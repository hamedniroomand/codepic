import { expect, test } from 'bun:test';

import { NO_MARKS, cycleMark, isDimmed, markAt, parseMarks } from './line-marks';

test('cycling a line steps through every mark and back to none', () => {
  let marks = cycleMark(NO_MARKS, 2);
  expect(markAt(2, marks)).toBe('emphasized');
  marks = cycleMark(marks, 2);
  expect(markAt(2, marks)).toBe('added');
  marks = cycleMark(marks, 2);
  expect(markAt(2, marks)).toBe('removed');
  marks = cycleMark(marks, 2);
  expect(markAt(2, marks)).toBeNull();
});

test('a line belongs to one mark at a time', () => {
  const marks = cycleMark(cycleMark({ ...NO_MARKS, emphasized: [2, 4] }, 2), 5);
  expect(marks.emphasized).toEqual([4, 5]);
  expect(marks.added).toEqual([2]);
});

test('cycling does not change the marks it was given', () => {
  cycleMark(NO_MARKS, 1);
  expect(NO_MARKS).toEqual({ emphasized: [], added: [], removed: [] });
});

test('dims unmarked lines only while something is emphasized', () => {
  expect(isDimmed(1, NO_MARKS)).toBe(false);
  expect(isDimmed(1, { ...NO_MARKS, emphasized: [2] })).toBe(true);
  expect(isDimmed(2, { ...NO_MARKS, emphasized: [2] })).toBe(false);
});

test('reads marks from untrusted input', () => {
  expect(parseMarks({ emphasized: [1, -2, 'x', 3.5, 4], added: 'no' })).toEqual({
    emphasized: [1, 4],
    added: [],
    removed: [],
  });
  expect(parseMarks(null)).toEqual(NO_MARKS);
});
