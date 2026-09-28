/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Authorize outside host domains for images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**', // Matches all avatar routes
      },
    ],
  },

  // 2. Your Turbopack rules from earlier
  turbopack: {
    resolveAlias: {
      '@/*': './src/*',
    },
  },
  
  // 3. Your Fallback Webpack options
  webpack: (config) => {
    config.resolve.alias['@'] = new URL('./src', import.meta.url).pathname;
    return config;
  },
};

export default nextConfig;
