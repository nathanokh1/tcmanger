/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://tcmanager-production.up.railway.app/api'
        : 'http://localhost:3000/api'),
  },

  // Enable static export for Railway deployment
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
    distDir: 'out',
  }),
  
  // Fix CSP issues preventing login page from loading
  async headers() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
                "font-src 'self' fonts.gstatic.com",
                "img-src 'self' data: https:",
                "connect-src 'self' https: wss:",
              ].join('; ')
            }
          ],
        },
      ];
    }
    return [];
  },
  
  images: {
    domains: ['localhost', 'tcmanager-production.up.railway.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

module.exports = nextConfig; 