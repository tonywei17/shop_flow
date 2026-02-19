import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "supabase-api.nexus-tech.cloud",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  transpilePackages: [
    "@enterprise/auth",
    "@enterprise/db",
    "@enterprise/config",
    "@enterprise/domain-settlement",
    "@enterprise/domain-org",
    "@enterprise/domain-commerce",
  ],
};

export default nextConfig;
