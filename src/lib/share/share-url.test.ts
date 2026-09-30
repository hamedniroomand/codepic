import { expect, test } from 'bun:test';

import { DEFAULT_APPEARANCE } from '$lib/appearance-config';
import { NO_MARKS } from '$lib/marks/line-marks';

import {
  SHARE_HASH_LIMIT,
  buildShareUrl,
  measureShare,
  parseShareHash,
  type ShareSnapshot,
} from './share-url';

const BASE = 'https://example.test/';
const appearance = { ...DEFAULT_APPEARANCE, title: 'share.ts' };
const snapshot = (code: string): ShareSnapshot => ({ appearance, code, marks: NO_MARKS });
const hashOf = (url: string): string => url.slice(BASE.length);

function noisyCode(length: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 \n{}[];.,';
  let code = '';
  for (let i = 0; i < length; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

test('a snippet well past the old 1200 character limit round trips', async () => {
  const code = 'export const total = items.length;\n'.repeat(400);
  const { url, codeOmitted } = await buildShareUrl(snapshot(code), BASE);

  expect(codeOmitted).toBe(false);
  const shared = await parseShareHash(hashOf(url));
  expect(shared.code).toBe(code);
  expect(shared.appearance?.title).toBe('share.ts');
});

test('marks survive the round trip', async () => {
  const marks = { emphasized: [1, 2], added: [4], removed: [] };
  const { url } = await buildShareUrl({ ...snapshot('a\nb\nc\nd'), marks }, BASE);

  expect((await parseShareHash(hashOf(url))).marks).toEqual({ ...marks });
});

test('unicode code round trips', async () => {
  const code = 'const greeting = "héllo wörld 🚀";';
  const { url } = await buildShareUrl(snapshot(code), BASE);

  expect((await parseShareHash(hashOf(url))).code).toBe(code);
});

test('drops the code when the link would pass the limit', async () => {
  const { url, codeOmitted } = await buildShareUrl(snapshot(noisyCode(30_000)), BASE);

  expect(codeOmitted).toBe(true);
  expect(hashOf(url).length).toBeLessThan(SHARE_HASH_LIMIT);
  const shared = await parseShareHash(hashOf(url));
  expect(shared.code).toBeNull();
  expect(shared.appearance?.title).toBe('share.ts');
});

test('measures how close a snippet is to the limit', async () => {
  const small = await measureShare(snapshot('const a = 1;'));
  const large = await measureShare(snapshot(noisyCode(30_000)));

  expect(small).toBeLessThan(SHARE_HASH_LIMIT);
  expect(large).toBeGreaterThan(SHARE_HASH_LIMIT);
});

test('links made before compression still open', async () => {
  const payload = { a: appearance, c: 'const legacy = true;' };
  const hash = `#s=${encodeURIComponent(JSON.stringify(payload))}`;

  const shared = await parseShareHash(hash);
  expect(shared.code).toBe('const legacy = true;');
  expect(shared.appearance?.title).toBe('share.ts');
  expect(shared.marks).toBeNull();
});

test('ignores hashes that are not share links', async () => {
  const empty = { appearance: null, code: null, marks: null };
  expect(await parseShareHash('')).toEqual(empty);
  expect(await parseShareHash('#other=1')).toEqual(empty);
  expect(await parseShareHash('#z=not-a-link')).toEqual(empty);
});
