import { ensureHighlighter } from '$lib/highlight/highlighter';
import { languageShikiId } from '$lib/highlight/languages';
import { themeById } from '$lib/themes';

import type { Token } from './wrap';

export async function tokenize(
  code: string,
  languageId: string,
  themeId: string,
): Promise<Token[][]> {
  const lang = languageShikiId(languageId);
  const plain = code.split('\n').map((line) => [{ content: line }]);
  if (lang === 'text') return plain;

  const highlighter = await ensureHighlighter();
  try {
    return highlighter.codeToTokens(code, { lang, theme: themeById(themeId).shiki }).tokens;
  } catch {
    return plain;
  }
}
