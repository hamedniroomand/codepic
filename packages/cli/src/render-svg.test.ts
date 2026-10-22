import { expect, test } from 'vite-plus/test';

import { DEFAULT_APPEARANCE } from '$lib/config/appearance-config';
import { NO_MARKS } from '$lib/marks/line-marks';

import { renderSvg } from './render-svg';

const appearance = { ...DEFAULT_APPEARANCE, language: 'typescript', title: 'a.ts' };

test('draws the code, line numbers and the title', async () => {
  const svg = await renderSvg('const a = 1;\nconst b = 2;', appearance, NO_MARKS);

  expect(svg).toContain('width="680"');
  expect(svg).toContain('a.ts');
  expect(svg).toContain('>2</text>');
  expect(svg.match(/<tspan/g)?.length).toBeGreaterThan(4);
});

test('escapes code so it cannot break out of the image', async () => {
  const svg = await renderSvg(
    '<script>alert("x")</script>',
    { ...appearance, language: 'plaintext' },
    NO_MARKS,
  );

  expect(svg).not.toContain('<script>');
  expect(svg).toContain('&lt;script&gt;');
});

test('wraps long lines onto more rows than the code has lines', async () => {
  const code = 'x'.repeat(300);
  const wrapped = await renderSvg(code, appearance, NO_MARKS);
  const unwrapped = await renderSvg(code, { ...appearance, wrap: false }, NO_MARKS);
  const height = (svg: string): number => Number(/height="([\d.]+)"/.exec(svg)?.[1]);

  expect(height(wrapped)).toBeGreaterThan(height(unwrapped));
});

test('marks lines and dims the others', async () => {
  const marks = { emphasized: [1], added: [], removed: [] };
  const svg = await renderSvg('a\nb', appearance, marks);

  expect(svg).toContain('fill-opacity="0.14"');
  expect(svg).toContain('opacity="0.4"');
});

test('adds a sign column for diff lines', async () => {
  const marks = { emphasized: [], added: [1], removed: [2] };
  const svg = await renderSvg('a\nb', appearance, marks);

  expect(svg).toContain('>+</text>');
  expect(svg).toContain('>−</text>');
});

test('draws the signature only when it is set', async () => {
  const plain = await renderSvg('a', appearance, NO_MARKS);
  const signed = await renderSvg(
    'a',
    { ...appearance, signature: '<@me>', signaturePosition: 'top-left' },
    NO_MARKS,
  );

  expect(plain).not.toContain('dominant-baseline');
  expect(signed).toContain('&lt;@me&gt;');
  expect(signed).toContain('x="64" y="32" text-anchor="start"');

  const bottom = await renderSvg(
    'a',
    { ...appearance, signature: '@me', signaturePosition: 'bottom-right' },
    NO_MARKS,
  );
  const height = Number(/height="([\d.]+)"/.exec(bottom)?.[1]);
  expect(bottom).toContain(`x="616" y="${height - 32}" text-anchor="end"`);
});

test('uses the chosen code font and can turn ligatures off', async () => {
  const fira = await renderSvg('a => b', { ...appearance, codeFont: 'fira-code' }, NO_MARKS);
  const plain = await renderSvg(
    'a => b',
    { ...appearance, codeFont: 'fira-code', ligatures: false },
    NO_MARKS,
  );

  expect(fira).toContain('font-family="Fira Code, monospace"');
  expect(fira).not.toContain('font-variant-ligatures');
  expect(plain).toContain('font-variant-ligatures: none');
  expect(plain.match(/<tspan x="/g)?.length).toBe('a => b'.length);
});

test.each(['16:9', '1:1', '4:5'] as const)('draws the exact %s shape', async (aspect) => {
  const [w, h] = aspect.split(':').map(Number);
  for (const code of ['a', 'x\n'.repeat(200)]) {
    const svg = await renderSvg(code, { ...appearance, width: 800, aspect }, NO_MARKS);
    expect(svg).toContain(`width="800" height="${Math.round((800 * h) / w)}"`);
  }
});

test('shrinks code that is too tall for the shape', async () => {
  const short = await renderSvg('a', { ...appearance, aspect: '16:9' }, NO_MARKS);
  const tall = await renderSvg('x\n'.repeat(200), { ...appearance, aspect: '16:9' }, NO_MARKS);
  expect(short).toContain('scale(1)');
  expect(Number(/scale\(([\d.]+)\)/.exec(tall)?.[1])).toBeLessThan(0.2);
});

test('keeps the card visible when the padding is larger than the shape', async () => {
  const svg = await renderSvg(
    'a',
    { ...appearance, width: 320, paddingPx: 128, aspect: '16:9' },
    NO_MARKS,
  );
  expect(Number(/scale\(([\d.]+)\)/.exec(svg)?.[1])).toBeGreaterThan(0.3);
});

test.each([
  { fontSize: 12, width: 680, paddingPx: 16 as const },
  { fontSize: 20, width: 900, paddingPx: 128 as const },
])('places an annotation box on its columns at %o', async (look) => {
  const svg = await renderSvg(
    'ab\tcdefgh',
    { ...appearance, ...look, lineNumbers: false },
    NO_MARKS,
    [{ line: 1, from: 4, to: 6, kind: 'box', note: 'n' }],
  );
  const cell = look.fontSize * 0.6;
  const codeX = look.paddingPx + 24;
  // The tab before column 4 takes two cells, so the box starts after "ab" and two spaces.
  const rect = /<rect x="([\d.]+)" y="[\d.]+" width="([\d.]+)"[^>]*stroke="#facc15"/.exec(svg);
  expect(Number(rect?.[1])).toBeCloseTo(codeX + 4 * cell - 0.75, 5);
  expect(Number(rect?.[2])).toBeCloseTo(3 * cell + 1.5, 5);
  expect(svg).toContain('>n</text>');
});
