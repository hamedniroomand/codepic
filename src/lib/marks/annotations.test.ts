import { expect, test } from 'vite-plus/test';

import { markColumns, noteNumbers, parseAnnotations, rangeFromSelection } from './annotations';

type Range = { from: number; to: number; kind: 'box'; number?: number };

const box = (from: number, to: number, number?: number): Range => ({
  from,
  to,
  kind: 'box' as const,
  number,
});

test('wraps a range inside one token', () => {
  expect(markColumns('<span>abcdef</span>', [box(2, 3)])).toBe(
    '<span>a</span><mark class="ann ann-box"><span>bc</span></mark><span>def</span>',
  );
});

test('puts one mark around a range that crosses color spans', () => {
  expect(markColumns('<span a>ab</span><span b>cd</span>', [box(2, 3, 1)])).toBe(
    '<span a>a</span><mark class="ann ann-box" data-n="1"><span a>b</span><span b>c</span></mark><span b>d</span>',
  );
});

test('counts an entity as one column', () => {
  expect(markColumns('a &lt;b&gt; c', [box(3, 5)])).toBe(
    'a <mark class="ann ann-box">&lt;b&gt;</mark> c',
  );
});

test('stops at the end of the line and leaves an empty line alone', () => {
  expect(markColumns('ab', [box(2, 40)])).toBe('a<mark class="ann ann-box">b</mark>');
  expect(markColumns('<span>ab</span>', [box(2, 40)])).toBe(
    '<span>a</span><mark class="ann ann-box"><span>b</span></mark>',
  );
  expect(markColumns('', [box(1, 2)])).toBe('');
  expect(markColumns('ab', [])).toBe('ab');
});

test('keeps only valid annotations from a link', () => {
  expect(
    parseAnnotations([
      { line: 2, from: 3, to: 5, kind: 'box', note: 'Here\u0001!' },
      { line: 1, from: 5, to: 3, kind: 'underline' },
      { line: 0, kind: 'box' },
      { line: 1, kind: 'circle' },
      'x',
    ]),
  ).toEqual([
    { line: 2, from: 3, to: 5, kind: 'box', note: 'Here!' },
    { line: 1, kind: 'underline' },
  ]);
  expect(parseAnnotations(null)).toEqual([]);
  expect(
    parseAnnotations(Array.from({ length: 80 }, () => ({ line: 1, kind: 'box' }))),
  ).toHaveLength(50);
});

test('numbers only the annotations that have a note', () => {
  const list = parseAnnotations([
    { line: 1, kind: 'box' },
    { line: 2, kind: 'box', note: 'a' },
    { line: 3, kind: 'box', note: 'b' },
  ]);
  expect([...noteNumbers(list).values()]).toEqual([1, 2]);
  expect(noteNumbers(list).get(list[2])).toBe(2);
});

test('turns a selection into a range on its first line', () => {
  const code = 'const a = 1;\nconst b = 2;';
  expect(rangeFromSelection(code, 19, 20)).toEqual({ line: 2, from: 7, to: 7 });
  expect(rangeFromSelection(code, 6, 18)).toEqual({ line: 1, from: 7, to: 12 });
  expect(rangeFromSelection(code, 4, 4)).toEqual({ line: 1 });
  expect(rangeFromSelection('😀 foo', 3, 6)).toEqual({ line: 1, from: 3, to: 5 });
  expect(markColumns('😀 foo', [box(3, 5)])).toBe('😀 <mark class="ann ann-box">foo</mark>');
});
