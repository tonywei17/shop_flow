import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
    "@enterprise/domain-commerce",
  ],
};

export default nextConfig;
