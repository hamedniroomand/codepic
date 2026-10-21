import { expect, test } from 'vite-plus/test';

import { LANGUAGES } from '$lib/config/languages';
import { THEMES } from '$lib/config/themes';
import { LANGUAGE_LOADERS, THEME_LOADERS, escapePlain } from '$lib/highlight/highlighter';

test('escapePlain neutralizes script tags', () => {
  const out = escapePlain('<script>alert(1)</script>');
  expect(out.includes('<script')).toBe(false);
  expect(out.includes('&lt;script')).toBe(true);
});

test('every theme and language has a loader', () => {
  for (const theme of THEMES) expect(THEME_LOADERS).toHaveProperty([theme.shiki]);
  for (const language of LANGUAGES.filter((l) => l.shiki !== 'text'))
    expect(LANGUAGE_LOADERS).toHaveProperty([language.shiki]);
});
