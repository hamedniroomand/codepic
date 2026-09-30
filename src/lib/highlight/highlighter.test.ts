import { expect, test } from 'vite-plus/test';

import { escapePlain } from '$lib/highlight/highlighter';

test('escapePlain neutralizes script tags', () => {
  const out = escapePlain('<script>alert(1)</script>');
  expect(out.includes('<script')).toBe(false);
  expect(out.includes('&lt;script')).toBe(true);
});
