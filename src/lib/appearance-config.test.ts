import { expect, test } from 'bun:test';

import { DEFAULT_APPEARANCE, parseAppearance } from '$lib/appearance-config';

test('falls back on corrupt input', () => {
  const config = parseAppearance({ themeId: 42, windowStyle: 'floating' });
  expect(config.themeId).toBe(DEFAULT_APPEARANCE.themeId);
  expect(config.windowStyle).toBe(DEFAULT_APPEARANCE.windowStyle);
});

test('keeps image sizes within usable limits', () => {
  const config = parseAppearance({ width: -40, fontSize: 0, lineHeight: 200 });
  expect(config.width).toBe(320);
  expect(config.fontSize).toBe(12);
  expect(config.lineHeight).toBe(2);
});

test('replaces non-finite image sizes', () => {
  const config = parseAppearance({ width: Number.NaN, fontSize: Infinity, lineHeight: Number.NaN });
  expect(config.width).toBe(DEFAULT_APPEARANCE.width);
  expect(config.fontSize).toBe(DEFAULT_APPEARANCE.fontSize);
  expect(config.lineHeight).toBe(DEFAULT_APPEARANCE.lineHeight);
});

test('reads padding stored as a legacy preset name', () => {
  expect(parseAppearance({ padding: 'xlarge' }).paddingPx).toBe(64);
  expect(parseAppearance({ padding: 'small' }).paddingPx).toBe(16);
  expect(parseAppearance({ padding: 'huge' }).paddingPx).toBe(DEFAULT_APPEARANCE.paddingPx);
});

test('paddingPx wins over a legacy preset name', () => {
  expect(parseAppearance({ padding: 'small', paddingPx: 128 }).paddingPx).toBe(128);
});

test('reads width stored as a legacy preset name', () => {
  expect(parseAppearance({ width: 'compact' }).width).toBe(480);
  expect(parseAppearance({ width: 'wide' }).width).toBe(900);
  expect(parseAppearance({ width: 'custom', customWidth: 1024 }).width).toBe(1024);
  expect(parseAppearance({ width: 'custom' }).width).toBe(DEFAULT_APPEARANCE.width);
});
