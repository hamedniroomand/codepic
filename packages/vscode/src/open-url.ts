import { LANGUAGES } from '$lib/config/languages';
import { detectLanguage } from '$lib/highlight/detect-language';
import { SHARE_HASH_LIMIT, buildCodeHash } from '$lib/share/share-url';

export const APP_URL = 'https://codepic.kitdev.space/';

/** VS Code language ids that differ from the CodePic ids. Same ids need no entry. */
export const LANGUAGE_ALIASES: Record<string, string> = {
  javascriptreact: 'jsx',
  typescriptreact: 'tsx',
  shellscript: 'shell',
  jsonc: 'json',
  dockercompose: 'yaml',
};

// VS Code opens a link as encodeURI(uri.toString(true)), so a percent escape in the query
// does not survive. These characters in a file name become "_".
const UNSAFE_IN_QUERY = /[%&+#=?]/g;
// Same limit as the title link parameter.
const MAX_TITLE_CHARS = 200;

export type Source = {
  code: string;
  languageId: string;
  /** The file name without its folder, such as `app.ts` or `Untitled-1`. */
  fileName: string;
};

/** Returns the CodePic language id. An id that CodePic does not know is guessed from the code. */
export function codepicLanguage(languageId: string, code: string): string {
  const id = LANGUAGE_ALIASES[languageId] ?? languageId;
  return LANGUAGES.some((language) => language.id === id) ? id : detectLanguage(code);
}

/**
 * Returns the link that opens the code in CodePic. The code goes in the compressed link hash.
 * After the `#z=` prefix it holds only letters, digits, "-" and "_", so VS Code passes it on
 * unchanged.
 * Throws when the code is too long for a link.
 */
export async function buildOpenUrl({ code, languageId, fileName }: Source): Promise<string> {
  const hash = await buildCodeHash(code);
  if (hash.length > SHARE_HASH_LIMIT) {
    throw new Error('The code is too long for a link. Select a smaller part of the code.');
  }
  const title = Array.from(fileName.replace(UNSAFE_IN_QUERY, '_'))
    .slice(0, MAX_TITLE_CHARS)
    .join('');
  return `${APP_URL}?lang=${codepicLanguage(languageId, code)}&title=${title}${hash}`;
}
