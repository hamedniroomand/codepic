import { expect, test } from 'bun:test';

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
