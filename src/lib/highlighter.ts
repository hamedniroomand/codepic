import bash from '@shikijs/langs/bash';
import csharp from '@shikijs/langs/csharp';
import css from '@shikijs/langs/css';
import go from '@shikijs/langs/go';
import html from '@shikijs/langs/html';
import java from '@shikijs/langs/java';
import javascript from '@shikijs/langs/javascript';
import json from '@shikijs/langs/json';
import markdown from '@shikijs/langs/markdown';
import php from '@shikijs/langs/php';
import python from '@shikijs/langs/python';
import rust from '@shikijs/langs/rust';
import sql from '@shikijs/langs/sql';
import typescript from '@shikijs/langs/typescript';
import dracula from '@shikijs/themes/dracula';
import githubDark from '@shikijs/themes/github-dark';
import githubLight from '@shikijs/themes/github-light';
import nord from '@shikijs/themes/nord';
import oneDarkPro from '@shikijs/themes/one-dark-pro';
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

import { languageShikiId } from '$lib/languages';
import { themeById } from '$lib/themes';

let highlighter: HighlighterCore | null = null;
let loadPromise: Promise<HighlighterCore> | null = null;

export async function ensureHighlighter(): Promise<HighlighterCore> {
  if (highlighter) return Promise.resolve(highlighter);
  if (!loadPromise) {
    loadPromise = createHighlighterCore({
      themes: [githubLight, githubDark, dracula, nord, oneDarkPro],
      langs: [
        javascript,
        typescript,
        html,
        css,
        json,
        bash,
        python,
        go,
        php,
        sql,
        java,
        csharp,
        rust,
        markdown,
      ],
      engine: createOnigurumaEngine(async () => import('shiki/wasm')),
    }).then((h) => {
      highlighter = h;
      return h;
    });
  }
  return loadPromise;
}

export function escapePlain(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function highlightCode(
  code: string,
  languageId: string,
  themeId: string,
): Promise<string> {
  const h = await ensureHighlighter();
  const lang = languageShikiId(languageId);
  const theme = themeById(themeId).shiki;
  if (lang === 'text') {
    return `<pre class="shiki plain"><code>${escapePlain(code)}</code></pre>`;
  }
  try {
    return h.codeToHtml(code, { lang, theme });
  } catch {
    return h.codeToHtml(code, { lang: 'text', theme });
  }
}
