import { parseAppearance, type AppearanceConfig } from '$lib/appearance-config';

const MAX_CODE_CHARS = 1200;
const MAX_URL_CHARS = 8000;
const HASH_PREFIX = '#s=';

type SharePayload = { a: AppearanceConfig; c?: string };

function encode(payload: SharePayload): string {
  return `${HASH_PREFIX}${encodeURIComponent(JSON.stringify(payload))}`;
}

export function buildShareUrl(
  appearance: AppearanceConfig,
  code: string,
): { url: string; codeOmitted: boolean } {
  const base = `${location.origin}${location.pathname}`;
  const payload: SharePayload = { a: appearance };
  if (code && code.length <= MAX_CODE_CHARS) payload.c = code;

  const hash = encode(payload);
  if (payload.c !== undefined && hash.length > MAX_URL_CHARS) {
    delete payload.c;
    return { url: `${base}${encode(payload)}`, codeOmitted: true };
  }
  return { url: `${base}${hash}`, codeOmitted: Boolean(code) && payload.c === undefined };
}

export function parseShareFromLocation(): {
  appearance: AppearanceConfig | null;
  code: string | null;
} {
  if (!location.hash.startsWith(HASH_PREFIX)) return { appearance: null, code: null };
  try {
    const data = JSON.parse(decodeURIComponent(location.hash.slice(HASH_PREFIX.length))) as {
      a?: unknown;
      c?: unknown;
    };
    return {
      appearance: data.a ? parseAppearance(data.a) : null,
      code: typeof data.c === 'string' ? data.c : null,
    };
  } catch {
    return { appearance: null, code: null };
  }
}
