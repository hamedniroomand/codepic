import { languageShikiId } from '$lib/config/languages';
import { themeById } from '$lib/config/themes';
import { ensureHighlighter } from '$lib/highlight/highlighter';

import type { Token } from './wrap';

export async function tokenize(
  code: string,
  languageId: string,
  themeId: string,
): Promise<Token[][]> {
  const lang = languageShikiId(languageId);
  const plain = code.split('\n').map((line) => [{ content: line }]);
  if (lang === 'text') return plain;

  const theme = themeById(themeId).shiki;
  const highlighter = await ensureHighlighter(theme, lang);
  try {
    return highlighter.codeToTokens(code, { lang, theme }).tokens;
  } catch {
    return plain;
  }
}
