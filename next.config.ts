import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === 'production' ? { output: 'standalone' as const } : {}),
  allowedDevOrigins: ['localhost', 'localhost:3000', '127.0.0.1', '127.0.0.1:3000', '192.168.0.127', '192.168.0.127:3000', '192.168.18.14', '192.168.18.14:3000'],
  devIndicators: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
      allowedOrigins: ['localhost:3000', '192.168.18.14:3000', '192.168.18.14', '127.0.0.1:3000', '*'],
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

export default nextConfig;
