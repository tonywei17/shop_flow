import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  transpilePackages: [
    "@enterprise/auth",
    "@enterprise/db",
    "@enterprise/config",
    "@enterprise/ai",
    "@enterprise/stripe",
    "@enterprise/events",
    "@enterprise/reports",
    "@enterprise/domain-settlement",
    "@enterprise/domain-org",
    "@enterprise/domain-crm",
    "@enterprise/domain-lms",
  ],
};

export default nextConfig;
