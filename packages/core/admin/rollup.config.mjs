import path from 'path';
import { defineConfig } from 'rollup';
import { basePlugins } from '../../../rollup.utils.mjs';

export default defineConfig([
  {
    input: path.join(import.meta.dirname, 'server/src/index.ts'),
    external: (id) => !path.isAbsolute(id) && !id.startsWith('.'),
    output: [
      {
        dir: path.join(import.meta.dirname, 'dist/server'),
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        exports: 'auto',
        format: 'cjs',
        sourcemap: true,
      },
      {
        dir: path.join(import.meta.dirname, 'dist/server'),
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[name]-[hash].mjs',
        exports: 'auto',
        format: 'esm',
        sourcemap: true,
      },
    ],

    plugins: [...basePlugins(import.meta.dirname)],
  },
  {
    input: {
      _internal: path.join(import.meta.dirname, '/_internal/index.ts'),
    },
    external: (id) => !path.isAbsolute(id) && !id.startsWith('.'),
    output: [
      {
        dir: path.join(import.meta.dirname, 'dist'),
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        exports: 'auto',
        format: 'cjs',
        sourcemap: true,
      },
      {
        dir: path.join(import.meta.dirname, 'dist'),
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[name]-[hash].mjs',
        exports: 'auto',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [...basePlugins(import.meta.dirname)],
  }
]);
