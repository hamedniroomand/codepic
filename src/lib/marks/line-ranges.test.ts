import { expect, test } from 'bun:test';

import { formatLineRanges, parseLineRanges } from './line-ranges';

test('parses single lines and ranges', () => {
  expect(parseLineRanges('1, 3, 5-7')).toEqual([1, 3, 5, 6, 7]);
});

test('sorts and removes duplicates', () => {
  expect(parseLineRanges('7,2-3,3')).toEqual([2, 3, 7]);
});

test('ignores tokens that are not line numbers', () => {
  expect(parseLineRanges('a,0,-2,4-2,1-2-3,,2.5')).toEqual([]);
});

test('ignores ranges that would run past the limit', () => {
  expect(parseLineRanges('1-99999999')).toEqual([]);
});

test('formats consecutive lines as ranges', () => {
  expect(formatLineRanges([7, 1, 3, 5, 6])).toEqual('1,3,5-7');
  expect(formatLineRanges([])).toEqual('');
});

test('round trips through the text form', () => {
  expect(parseLineRanges(formatLineRanges([2, 3, 4, 9]))).toEqual([2, 3, 4, 9]);
});
