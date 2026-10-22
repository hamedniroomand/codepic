import { expect, test } from 'vite-plus/test';

import { revealSchedule } from './animation';

test('types the code at the chosen speed and ends with all of it', () => {
  const schedule = revealSchedule(60, 30, 20, 1000);
  // 60 characters at 30 per second is 2 seconds, so 40 frames after the empty one.
  expect(schedule.counts).toHaveLength(41);
  expect(schedule.counts[0]).toBe(0);
  expect(schedule.counts.at(-1)).toBe(60);
  expect(schedule.delay).toBe(50);
  expect(schedule.lastDelay).toBe(1000);
  expect(
    schedule.counts.every((count, index) => index === 0 || count >= schedule.counts[index - 1]),
  ).toBe(true);
});

test('never makes more frames than the limit', () => {
  const schedule = revealSchedule(100_000, 15, 20, 500, 600);
  expect(schedule.counts).toHaveLength(600);
  expect(schedule.counts.at(-1)).toBe(100_000);
});

test('gives short code at least one typing frame and a pause no shorter than a frame', () => {
  expect(revealSchedule(1, 60, 20, 0)).toEqual({ counts: [0, 1], delay: 50, lastDelay: 50 });
});
