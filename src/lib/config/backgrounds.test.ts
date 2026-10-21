import { expect, test } from 'vite-plus/test';

import { signatureColor } from './backgrounds';

test('picks dark text on light backgrounds and light text on dark ones', () => {
  expect(signatureColor({ mode: 'solid', presetId: 'paper' })).toBe('#0f172acc');
  expect(signatureColor({ mode: 'solid', presetId: 'charcoal' })).toBe('#ffffffd9');
  expect(
    signatureColor({
      mode: 'gradient',
      presetId: '',
      gradientFrom: '#ffffff',
      gradientTo: '#eeeeee',
    }),
  ).toBe('#0f172acc');
  expect(signatureColor({ mode: 'transparent', presetId: '' })).toBe('#808080');
});
