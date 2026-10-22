import { parseAppearance, type AppearanceConfig } from '$lib/config/appearance-config';
import { parseAnnotations, type Annotation } from '$lib/marks/annotations';
import { MARK_KINDS, parseMarks, type LineMarks } from '$lib/marks/line-marks';
import { parsePanels, type Panel } from '$lib/panels/panels';

import { deflate, fromBase64Url, inflate, toBase64Url } from './codec';

/** Longest link hash we build. Chat apps and browsers handle this comfortably. */
export const SHARE_HASH_LIMIT = 12_000;

const COMPRESSED_PREFIX = '#z=';
// Links from before compression. Still read, never written.
const PLAIN_PREFIX = '#s=';

export type ShareSnapshot = {
  appearance: AppearanceConfig;
  code: string;
  marks: LineMarks;
  annotations: Annotation[];
  /** Panels after the first one. */
  extraPanels: Panel[];
};

export type SharedSnapshot = {
  appearance: AppearanceConfig | null;
  code: string | null;
  marks: LineMarks | null;
  annotations: Annotation[] | null;
  extraPanels: Panel[] | null;
};

// A payload without `a` carries only code, so the reader keeps its own appearance.
type PanelPayload = { c: string; l: string; t?: string; m?: LineMarks; n?: Annotation[] };
type SharePayload = {
  a?: AppearanceConfig;
  c?: string;
  m?: LineMarks;
  n?: Annotation[];
  p?: PanelPayload[];
};

const EMPTY_SHARE: SharedSnapshot = {
  appearance: null,
  code: null,
  marks: null,
  annotations: null,
  extraPanels: null,
};

function hasMarks(marks: LineMarks): boolean {
  return MARK_KINDS.some((kind) => marks[kind].length > 0);
}

function panelPayload({ code, language, title, marks, annotations }: Panel): PanelPayload {
  const payload: PanelPayload = { c: code, l: language };
  if (title) payload.t = title;
  if (hasMarks(marks)) payload.m = marks;
  if (annotations.length) payload.n = annotations;
  return payload;
}

function toPayload({
  appearance,
  code,
  marks,
  annotations,
  extraPanels,
}: ShareSnapshot): SharePayload {
  const payload: SharePayload = { a: appearance };
  if (code) payload.c = code;
  if (hasMarks(marks)) payload.m = marks;
  // Annotations point into the code, so they go only where the code goes.
  if (code && annotations.length) payload.n = annotations;
  // Without the first panel's code the link has no code at all, as before panels.
  if (code && extraPanels.length) payload.p = extraPanels.map(panelPayload);
  return payload;
}

async function encode(payload: SharePayload): Promise<string> {
  return `${COMPRESSED_PREFIX}${toBase64Url(await deflate(JSON.stringify(payload)))}`;
}

async function decode(hash: string): Promise<SharePayload | null> {
  if (hash.startsWith(COMPRESSED_PREFIX)) {
    return JSON.parse(await inflate(fromBase64Url(hash.slice(COMPRESSED_PREFIX.length))));
  }
  if (hash.startsWith(PLAIN_PREFIX)) {
    return JSON.parse(decodeURIComponent(hash.slice(PLAIN_PREFIX.length)));
  }
  return null;
}

export async function measureShare(snapshot: ShareSnapshot): Promise<number> {
  return (await encode(toPayload(snapshot))).length;
}

export async function buildShareUrl(
  snapshot: ShareSnapshot,
  base = `${location.origin}${location.pathname}`,
): Promise<{ url: string; codeOmitted: boolean }> {
  const hash = await encode(toPayload(snapshot));
  if (hash.length <= SHARE_HASH_LIMIT) return { url: `${base}${hash}`, codeOmitted: false };

  const withoutCode = await encode(toPayload({ ...snapshot, code: '', extraPanels: [] }));
  return { url: `${base}${withoutCode}`, codeOmitted: true };
}

/** A link hash that carries only the code. The app keeps the appearance it has. */
export async function buildCodeHash(code: string): Promise<string> {
  return encode({ c: code });
}

export async function parseShareHash(hash: string): Promise<SharedSnapshot> {
  try {
    const data = await decode(hash);
    if (!data) return EMPTY_SHARE;
    return {
      appearance: data.a ? parseAppearance(data.a) : null,
      code: typeof data.c === 'string' ? data.c : null,
      marks: data.m ? parseMarks(data.m) : null,
      annotations: data.n ? parseAnnotations(data.n) : null,
      extraPanels: data.p ? parsePanels(data.p) : null,
    };
  } catch {
    return EMPTY_SHARE;
  }
}
