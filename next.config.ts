import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "tinacms-authjs",
    "tinacms-gitprovider-github",
    "upstash-redis-level",
    "@octokit/rest",
  ],
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/lucidadmindashboard",
        permanent: false,
      },
      {
        source: "/lucidadmindashboard",
        destination: "/lucidadmindashboard/index.html",
        permanent: false,
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
