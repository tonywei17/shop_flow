import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "supabase-api.nexus-tech.cloud",
      },
    ],
  },
  transpilePackages: ["@enterprise/db", "@enterprise/auth"],
};

export default nextConfig;
