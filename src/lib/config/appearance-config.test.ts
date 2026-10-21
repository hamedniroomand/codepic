import { expect, test } from 'vite-plus/test';

import {
  DEFAULT_APPEARANCE,
  aspectHeight,
  cleanSignature,
  fitScale,
  parseAppearance,
} from '$lib/config/appearance-config';

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

test('reads the export format and falls back to png', () => {
  expect(parseAppearance({ exportFormat: 'svg' }).exportFormat).toBe('svg');
  expect(parseAppearance({ exportFormat: 'gif' }).exportFormat).toBe('png');
  expect(parseAppearance({}).exportFormat).toBe('png');
});

test('keeps only hex background colors', () => {
  const config = parseAppearance({
    background: {
      mode: 'gradient',
      presetId: '',
      gradientFrom: '#FF8800',
      gradientTo: 'red; background: url(x)',
      solidColor: 42,
    },
  });
  expect(config.background.gradientFrom).toBe('#ff8800');
  expect(config.background.gradientTo).toBeNull();
  expect(config.background.solidColor).toBeNull();
});

test('reads a config saved before signatures existed', () => {
  const config = parseAppearance({ themeId: 'nord' });
  expect(config.signature).toBe('');
  expect(config.signaturePosition).toBe('bottom-right');
});

test('keeps the signature short and its corner known', () => {
  const config = parseAppearance({ signature: 'x'.repeat(500), signaturePosition: 'middle' });
  expect(config.signature).toHaveLength(60);
  expect(config.signaturePosition).toBe('bottom-right');
});

test('removes control characters from the signature and keeps emoji whole', () => {
  expect(cleanSignature('@me\u0001\n\u009f!')).toBe('@me!');
  expect(cleanSignature(`${'x'.repeat(59)}🙂🙂`)).toBe(`${'x'.repeat(59)}🙂`);
});

test('reads a config saved before code fonts existed', () => {
  const config = parseAppearance({ themeId: 'nord' });
  expect(config.codeFont).toBe('jetbrains-mono');
  expect(config.ligatures).toBe(true);
  expect(parseAppearance({ codeFont: 'comic-sans' }).codeFont).toBe('jetbrains-mono');
});

test('gives each shape its exact height', () => {
  expect(aspectHeight('free', 800)).toBeNull();
  expect(aspectHeight('16:9', 1600)).toBe(900);
  expect(aspectHeight('1:1', 680)).toBe(680);
  expect(aspectHeight('4:5', 800)).toBe(1000);
});

test('shrinks a card only when it does not fit', () => {
  expect(fitScale(900, 64, 300)).toBe(1);
  expect(fitScale(900, 64, 1544)).toBe(0.5);
  expect(fitScale(180, 128, 180)).toBe(0.5);
});

test('reads a config saved before shapes existed', () => {
  expect(parseAppearance({}).aspect).toBe('free');
  expect(parseAppearance({ aspect: '2:1' }).aspect).toBe('free');
});
