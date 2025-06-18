/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: 'dist',
  
  // Static export for production (served by Express)
  ...(process.env.NODE_ENV === 'production' ? {
    output: 'export',
    trailingSlash: true,
    assetPrefix: '',
  } : {}),
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  
  // Development rewrites only
  ...(process.env.NODE_ENV !== 'production' ? {
    async rewrites() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ];
    },
  } : {}),
  
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'production', // Required for static export
  },
};

module.exports = nextConfig; 