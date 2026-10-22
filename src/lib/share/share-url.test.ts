import { expect, test } from 'vite-plus/test';

import { DEFAULT_APPEARANCE } from '$lib/config/appearance-config';
import { NO_MARKS } from '$lib/marks/line-marks';
import { parsePanels } from '$lib/panels/panels';

import { fromBase64Url, inflate } from './codec';
import {
  SHARE_HASH_LIMIT,
  buildShareUrl,
  measureShare,
  parseShareHash,
  type ShareSnapshot,
} from './share-url';

const BASE = 'https://example.test/';
const appearance = { ...DEFAULT_APPEARANCE, title: 'share.ts' };
const snapshot = (code: string): ShareSnapshot => ({
  appearance,
  code,
  marks: NO_MARKS,
  annotations: [],
  extraPanels: [],
});
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
  const empty = { appearance: null, code: null, marks: null, annotations: null, extraPanels: null };
  expect(await parseShareHash('')).toEqual(empty);
  expect(await parseShareHash('#other=1')).toEqual(empty);
  expect(await parseShareHash('#z=not-a-link')).toEqual(empty);
});

test('keeps annotations in a link and reads old links without them', async () => {
  const annotations = [{ line: 1, from: 1, to: 3, kind: 'box' as const, note: 'Look' }];
  const { url } = await buildShareUrl({ ...snapshot('const a = 1;'), annotations }, 'https://x/');
  expect((await parseShareHash(new URL(url).hash)).annotations).toEqual(annotations);

  const old = await buildShareUrl(snapshot('const a = 1;'), 'https://x/');
  expect((await parseShareHash(new URL(old.url).hash)).annotations).toBeNull();
});

test('keeps every panel with its marks and annotations', async () => {
  const extraPanels = [
    {
      code: 'b = 2',
      language: 'python',
      title: 'b.py',
      marks: { emphasized: [1], added: [], removed: [] },
      annotations: [{ line: 1, from: 1, to: 1, kind: 'underline' as const, note: 'B' }],
    },
    { code: 'c', language: 'go', title: '', marks: NO_MARKS, annotations: [] },
  ];
  const { url } = await buildShareUrl({ ...snapshot('a'), extraPanels }, 'https://x/');
  expect((await parseShareHash(new URL(url).hash)).extraPanels).toEqual(extraPanels);
});

test('a link with one panel has no panel list', async () => {
  const { url } = await buildShareUrl(snapshot('a'), 'https://x/');
  const hash = new URL(url).hash;
  expect((await parseShareHash(hash)).extraPanels).toBeNull();
  expect(await inflate(fromBase64Url(hash.slice(3)))).not.toContain('"p"');
});

test('drops bad panels from a link', () => {
  expect(
    parsePanels([{ c: 'x', l: 'klingon', t: 7 }, { l: 'go' }, 'x', { c: 'y' }, { c: 'z' }]),
  ).toEqual([
    { code: 'x', language: 'plaintext', title: '', marks: NO_MARKS, annotations: [] },
    { code: 'y', language: 'plaintext', title: '', marks: NO_MARKS, annotations: [] },
  ]);
});
