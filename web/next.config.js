/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */

const path = require('path');

const nextConfig = {
  pageExtensions: ['api.ts', 'page.tsx'], // Allows for colocation of non page files under /pages/ without having a route created to them
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')]
  }
};


module.exports = {
  ...nextConfig
};
