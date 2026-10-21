import {
  createHighlighterCore,
  type HighlighterCore,
  type LanguageRegistration,
  type ThemeRegistration,
} from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

import { languageShikiId } from '$lib/config/languages';
import { themeById } from '$lib/config/themes';

// Each theme and grammar is its own chunk, so only what a snapshot uses is loaded.
export const THEME_LOADERS: Record<string, () => Promise<{ default: ThemeRegistration }>> = {
  'github-light': () => import('@shikijs/themes/github-light'),
  'github-dark': () => import('@shikijs/themes/github-dark'),
  dracula: () => import('@shikijs/themes/dracula'),
  nord: () => import('@shikijs/themes/nord'),
  'one-dark-pro': () => import('@shikijs/themes/one-dark-pro'),
  'catppuccin-latte': () => import('@shikijs/themes/catppuccin-latte'),
  'catppuccin-mocha': () => import('@shikijs/themes/catppuccin-mocha'),
  'tokyo-night': () => import('@shikijs/themes/tokyo-night'),
  monokai: () => import('@shikijs/themes/monokai'),
  'night-owl': () => import('@shikijs/themes/night-owl'),
  'rose-pine': () => import('@shikijs/themes/rose-pine'),
  'solarized-light': () => import('@shikijs/themes/solarized-light'),
  'solarized-dark': () => import('@shikijs/themes/solarized-dark'),
  'vitesse-light': () => import('@shikijs/themes/vitesse-light'),
  'vitesse-dark': () => import('@shikijs/themes/vitesse-dark'),
};

export const LANGUAGE_LOADERS: Record<string, () => Promise<{ default: LanguageRegistration[] }>> =
  {
    javascript: () => import('@shikijs/langs/javascript'),
    typescript: () => import('@shikijs/langs/typescript'),
    html: () => import('@shikijs/langs/html'),
    css: () => import('@shikijs/langs/css'),
    json: () => import('@shikijs/langs/json'),
    bash: () => import('@shikijs/langs/bash'),
    python: () => import('@shikijs/langs/python'),
    go: () => import('@shikijs/langs/go'),
    php: () => import('@shikijs/langs/php'),
    sql: () => import('@shikijs/langs/sql'),
    java: () => import('@shikijs/langs/java'),
    csharp: () => import('@shikijs/langs/csharp'),
    rust: () => import('@shikijs/langs/rust'),
    markdown: () => import('@shikijs/langs/markdown'),
    jsx: () => import('@shikijs/langs/jsx'),
    tsx: () => import('@shikijs/langs/tsx'),
    c: () => import('@shikijs/langs/c'),
    cpp: () => import('@shikijs/langs/cpp'),
    kotlin: () => import('@shikijs/langs/kotlin'),
    swift: () => import('@shikijs/langs/swift'),
    ruby: () => import('@shikijs/langs/ruby'),
    yaml: () => import('@shikijs/langs/yaml'),
    toml: () => import('@shikijs/langs/toml'),
    docker: () => import('@shikijs/langs/docker'),
    svelte: () => import('@shikijs/langs/svelte'),
    vue: () => import('@shikijs/langs/vue'),
  };

let loadPromise: Promise<HighlighterCore> | null = null;
const pending = new Map<string, Promise<void>>();

function once(key: string, load: () => Promise<void>): Promise<void> {
  let promise = pending.get(key);
  if (!promise) {
    promise = load().catch((error: unknown) => {
      pending.delete(key);
      throw error;
    });
    pending.set(key, promise);
  }
  return promise;
}

/** Returns a highlighter that has the theme and the language (a Shiki id) ready to use. */
export async function ensureHighlighter(
  shikiTheme: string,
  shikiLang: string,
): Promise<HighlighterCore> {
  loadPromise ??= createHighlighterCore({
    themes: [],
    langs: [],
    engine: createOnigurumaEngine(async () => import('shiki/wasm')),
  }).catch((error: unknown) => {
    loadPromise = null;
    throw error;
  });
  const h = await loadPromise;
  const theme = THEME_LOADERS[shikiTheme];
  const lang = LANGUAGE_LOADERS[shikiLang];
  await Promise.all([
    theme && once(`theme:${shikiTheme}`, async () => h.loadTheme((await theme()).default)),
    lang && once(`lang:${shikiLang}`, async () => h.loadLanguage((await lang()).default)),
  ]);
  return h;
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
  const lang = languageShikiId(languageId);
  const theme = themeById(themeId).shiki;
  if (lang === 'text') {
    return `<pre class="shiki plain"><code>${escapePlain(code)}</code></pre>`;
  }
  const h = await ensureHighlighter(theme, lang);
  try {
    return h.codeToHtml(code, { lang, theme });
  } catch {
    return h.codeToHtml(code, { lang: 'text', theme });
  }
}
