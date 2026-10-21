import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: 'src/extension.ts',
    format: 'cjs',
    platform: 'node',
    target: 'node20',
    clean: true,
    dts: false,
    deps: { neverBundle: ['vscode'] },
    outExtensions: () => ({ js: '.cjs' }),
  },
});
