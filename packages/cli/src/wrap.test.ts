import { expect, test } from 'vite-plus/test';

import { wrapTokens } from './wrap';

const text = (rows: ReturnType<typeof wrapTokens>): string[] =>
  rows.map((row) => row.map((token) => token.content).join(''));

test('keeps a short line on one row', () => {
  expect(text(wrapTokens([{ content: 'const' }, { content: ' a' }], 10))).toEqual(['const a']);
});

test('breaks a long line at the column limit', () => {
  expect(text(wrapTokens([{ content: 'abcdefgh' }], 3))).toEqual(['abc', 'def', 'gh']);
});

test('breaks inside a token and keeps its color', () => {
  const rows = wrapTokens([{ content: 'ab' }, { content: 'cdef', color: '#f00' }], 3);

  expect(text(rows)).toEqual(['abc', 'def']);
  expect(rows[1][0].color).toBe('#f00');
});

test('an empty line still takes one row', () => {
  expect(wrapTokens([], 10)).toEqual([[]]);
});
