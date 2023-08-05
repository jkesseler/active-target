/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  productionBrowserSourceMaps: true,
  pageExtensions: ['api.ts', 'page.tsx'], // Allows for colocation of non page files under /pages/ without having a route created to them
  poweredByHeader: false,
  swcMinify: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')]
  },
  images: {
    unoptimized: true
  }
};

module.exports = ({
  ...nextConfig,
});
