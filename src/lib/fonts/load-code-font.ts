import { codeFontStack } from '$lib/config/fonts';

// JetBrains Mono is the default and loads with the app. The others load on first use.
const STYLESHEETS: Record<string, () => Promise<unknown>> = {
  'fira-code': () => import('@fontsource/fira-code/400.css'),
  'source-code-pro': () => import('@fontsource/source-code-pro/400.css'),
  'ibm-plex-mono': () => import('@fontsource/ibm-plex-mono/400.css'),
};

/** Resolves when the code font can draw text, so an export never falls back to another font. */
export async function loadCodeFont(id: string, text?: string): Promise<void> {
  await STYLESHEETS[id]?.();
  // The text picks which unicode-range files load, for example Cyrillic or Greek.
  await document.fonts.load(`16px ${codeFontStack(id)}`, text);
}
