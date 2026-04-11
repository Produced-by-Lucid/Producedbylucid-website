import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
