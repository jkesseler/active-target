/// <reference types="vitest" />
/// <reference types="vite/client" />

import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@/mocks', replacement: path.resolve(__dirname, './mocks') },
      {
        // Fix for react-redux ESM/CJS issue in Vitest
        find: 'react-redux/es/exports',
        replacement: path.resolve(__dirname, './node_modules/react-redux/lib/exports'),
      },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-utils/setup.ts',
    include: ['./src/**/*.{test,spec,snapshot}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/', 'tests/', 'dist/', 'build/', 'scripts/'],
    },
  },
});
