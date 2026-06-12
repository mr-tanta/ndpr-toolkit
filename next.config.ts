import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === 'development';

// Repository name, used as basePath for GitHub Pages project-page deploys.
// The live site uses the custom domain ndprtoolkit.com.ng, so no basePath by
// default; set USE_CUSTOM_DOMAIN=false to build for <user>.github.io/ndpr-toolkit.
const REPO_NAME = 'ndpr-toolkit';
const USE_CUSTOM_DOMAIN = process.env.USE_CUSTOM_DOMAIN !== 'false';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Skip type checking during build - let CI handle it
  typescript: {
    ignoreBuildErrors: true,
  },
  distDir: '.next',
  poweredByHeader: false,

  // Only use static export, basePath and assetPrefix in production
  ...(isDevelopment
    ? {}
    : {
        output: 'export',
        images: {
          unoptimized: true,
        },
        ...(USE_CUSTOM_DOMAIN ? {} : {
          basePath: `/${REPO_NAME}`,
          assetPrefix: `/${REPO_NAME}`,
        }),
      }
  ),
};

export default nextConfig;
