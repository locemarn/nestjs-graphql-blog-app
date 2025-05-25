import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    setupFiles: [],
    include: ['**/*.spec.ts'],
    watch: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: ['node_modules/', 'dist/', '.eslintrc.js', 'vitest.config.ts', '**/main.ts'],
    },
    alias: {
      '@src/': './src/',
      '@domain/': './src/domain/',
      '@application/': './src/application/',
      '@infrastructure/': './src/infrastructure/',
      '@presentation/': './src/presentation/',
    },
  },
  plugins: [
    tsConfigPaths(),
    swc.vite(),
  ],
});