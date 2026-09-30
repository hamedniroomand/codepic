import { parseAppearance, type AppearanceConfig } from '$lib/config/appearance-config';
import { MARK_KINDS, parseMarks, type LineMarks } from '$lib/marks/line-marks';

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
};

export type SharedSnapshot = {
  appearance: AppearanceConfig | null;
  code: string | null;
  marks: LineMarks | null;
};

type SharePayload = { a: AppearanceConfig; c?: string; m?: LineMarks };

const EMPTY_SHARE: SharedSnapshot = { appearance: null, code: null, marks: null };

function toPayload({ appearance, code, marks }: ShareSnapshot): SharePayload {
  const payload: SharePayload = { a: appearance };
  if (code) payload.c = code;
  if (MARK_KINDS.some((kind) => marks[kind].length)) payload.m = marks;
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

  const withoutCode = await encode(toPayload({ ...snapshot, code: '' }));
  return { url: `${base}${withoutCode}`, codeOmitted: true };
}

export async function parseShareHash(hash: string): Promise<SharedSnapshot> {
  try {
    const data = await decode(hash);
    if (!data) return EMPTY_SHARE;
    return {
      appearance: data.a ? parseAppearance(data.a) : null,
      code: typeof data.c === 'string' ? data.c : null,
      marks: data.m ? parseMarks(data.m) : null,
    };
  } catch {
    return EMPTY_SHARE;
  }
}
