import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize Remotion packages (moved from experimental in Next.js 16)
  serverExternalPackages: [
    '@remotion/bundler',
    '@remotion/renderer',
    '@remotion/cli',
    'remotion',
  ],
  
  // Empty turbopack config to acknowledge we're using Turbopack
  turbopack: {},
  
  webpack: (config, { isServer }) => {
    // Only apply webpack config when using webpack (not Turbopack)
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        '@remotion/bundler',
        '@remotion/renderer',
        '@remotion/cli',
        'remotion',
      ];
    }

    // Ignore non-JavaScript files in node_modules
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });

    return config;
  },
};

export default nextConfig;
