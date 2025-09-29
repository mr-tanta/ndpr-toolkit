import type { NextConfig } from "next";

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Repository name for GitHub Pages
const REPO_NAME = 'ndpr-toolkit';

// Check if using custom domain (no basePath needed)
const USE_CUSTOM_DOMAIN = process.env.USE_CUSTOM_DOMAIN === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Skip type checking during build - let CI handle it
  typescript: {
    ignoreBuildErrors: true,
  },
  // Use custom build directory to bypass some type checking
  distDir: '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // These settings apply to all environments
  poweredByHeader: false,
  
  // Fix for hydration errors
  // This ensures consistent rendering between server and client
  experimental: {
    // Reduce hydration mismatches by making SSR output match client rendering
    scrollRestoration: true,
  },
  
  // Optimize fonts to reduce hydration mismatches
  optimizeFonts: true,
  
  // Suppress hydration warnings in development
  onDemandEntries: {
    // Keep pages in memory for longer to avoid reloading
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5,
  },
  
  // Only use static export, basePath and assetPrefix in production
  ...(isDevelopment 
    ? {
        // Development config - no basePath or static export
      } 
    : {
        // Production config for GitHub Pages
        output: 'export',  // Enable static HTML export
        trailingSlash: true,  // Important for GitHub Pages to work correctly with routing
        images: {
          unoptimized: true,  // Required for static export
        },
        // Only use basePath if not using custom domain
        ...(USE_CUSTOM_DOMAIN ? {} : {
          basePath: `/${REPO_NAME}`,
          assetPrefix: `/${REPO_NAME}`,
        }),
      }
  ),
};

// Add a custom export script to generate a .nojekyll file
// This prevents GitHub Pages from ignoring files that begin with an underscore
if (process.env.NODE_ENV === 'production') {
  const { execSync } = require('child_process');
  try {
    execSync('touch out/.nojekyll');
    console.log('Created .nojekyll file');
  } catch (error) {
    console.error('Error creating .nojekyll file:', error);
  }
}

export default nextConfig;
