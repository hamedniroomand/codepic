import { readFileSync } from 'node:fs';

import { expect, test } from 'vite-plus/test';

import { CODE_FONTS } from '$lib/config/fonts';

/** Reads the advance width, ascent and descent from the font tables, in em. */
function readMetrics(file: string): { advance: number; ascent: number; descent: number } {
  const data = readFileSync(new URL(`../assets/${file}`, import.meta.url));
  const tables = new Map<string, number>();
  for (let i = 0; i < data.readUInt16BE(4); i++) {
    const at = 12 + i * 16;
    tables.set(data.toString('latin1', at, at + 4), data.readUInt32BE(at + 8));
  }
  const table = (tag: string): number => {
    const offset = tables.get(tag);
    if (offset === undefined) throw new Error(`${file} has no ${tag} table`);
    return offset;
  };
  const em = data.readUInt16BE(table('head') + 18);
  const hhea = table('hhea');
  return {
    advance: data.readUInt16BE(table('hmtx')) / em,
    ascent: data.readInt16BE(hhea + 4) / em,
    descent: -data.readInt16BE(hhea + 6) / em,
  };
}

test.each(CODE_FONTS)('$label metrics match its font file', (font) => {
  const metrics = readMetrics(font.file);
  expect(metrics.advance).toBeCloseTo(font.metrics.advance, 3);
  expect(metrics.ascent).toBeCloseTo(font.metrics.ascent, 3);
  expect(metrics.descent).toBeCloseTo(font.metrics.descent, 3);
});
