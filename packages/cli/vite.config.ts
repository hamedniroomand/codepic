import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    deps: {
      // tsdown <0.23 compatibility: resolve external dependency subpaths.
      // Remove to preserve subpath imports as written (the new default).
      // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
      resolveDepSubpath: true,
    },
    entry: 'src/cli.ts',
    format: 'esm',
    platform: 'node',
    target: 'node20',
    clean: true,
    dts: false,
    outExtensions: () => ({ js: '.js' }),
  },
});
