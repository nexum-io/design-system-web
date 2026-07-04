import { readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { defineConfig } from 'tsup';

function collectEntries(dir: string, prefix: string): Record<string, string> {
  return Object.fromEntries(
    readdirSync(dir)
      .filter((file) => file.endsWith('.tsx') || file.endsWith('.ts'))
      .map((file) => {
        const name = basename(file, file.endsWith('.tsx') ? '.tsx' : '.ts');
        return [`${prefix}/${name}`, join(dir, file)];
      }),
  );
}

export default defineConfig({
  entry: {
    index: 'index.ts',
    tokens: 'tokens.ts',
    ...collectEntries('primitives', 'primitives'),
    ...collectEntries('components', 'components'),
    ...collectEntries('blocks', 'blocks'),
    ...collectEntries('layouts', 'layouts'),
    'utils/index': 'utils/index.ts',
    'utils/cx': 'utils/cx.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ['react', 'react-dom', 'tailwindcss'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
