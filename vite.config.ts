import { fileURLToPath } from 'node:url';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, lazyPlugins } from 'vite-plus';

const resolvePath = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  // Relative, so the build works from any path (served from the codepic.kitdev.space root).
  base: './',
  plugins: lazyPlugins(() => [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CodePic',
        short_name: 'CodePic',
        description: 'Turn code into shareable images in the browser.',
        theme_color: '#0d0d0d',
        background_color: '#0d0d0d',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,wasm}'],
      },
    }),
  ]),
  resolve: {
    alias: {
      $lib: resolvePath('./src/lib'),
      $components: resolvePath('./src/components'),
    },
  },
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    arrowParens: 'always',
    bracketSameLine: false,
    bracketSpacing: true,
    embeddedLanguageFormatting: 'auto',
    endOfLine: 'lf',
    ignorePatterns: ['bench/results/**'],
    insertFinalNewline: true,
    jsxSingleQuote: false,
    objectWrap: 'preserve',
    printWidth: 100,
    proseWrap: 'preserve',
    quoteProps: 'as-needed',
    semi: true,
    singleAttributePerLine: true,
    singleQuote: true,
    sortImports: {
      internalPattern: ['$lib/', '$components/'],
    },
    sortPackageJson: true,
    tabWidth: 2,
    trailingComma: 'all',
    useTabs: false,
    vueIndentScriptAndStyle: true,
    svelte: true,
  },
  // Ponytail: This alias supports test and expect. Use Bun for other Bun test APIs.
  test: {
    clearMocks: false,
    alias: { 'bun:test': 'vite-plus/test' },
  },
  lint: {
    categories: {
      correctness: 'error',
    },
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    options: { typeAware: true, typeCheck: true },
    plugins: ['eslint', 'import', 'oxc', 'promise', 'unicorn', 'typescript'],
    rules: {
      'eslint/no-unused-vars': 'error',
      'typescript/explicit-function-return-type': 'error',
      'typescript/no-non-null-assertion': 'error',
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
  },
});
