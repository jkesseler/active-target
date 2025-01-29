import path from 'path';
import { defineConfig } from '@rsbuild/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  output: {
    js: 'cheap-module-source-map',
    css: true
  },
  html: {
    template: './index.html',
    title: 'RSBuild'
  },
  resolve: {
    tsConfig: path.resolve('./tsconfig.json')
  },
  tools: {
    rspack: {
      plugins: [
        new ReactRefreshPlugin(),
        TanStackRouterRspack({
          routesDirectory: './src/routes',
          generatedRouteTree: './src/routes.gen.ts',
          quoteStyle: 'single',
          semicolons: true
        })]
    }
  }
});
