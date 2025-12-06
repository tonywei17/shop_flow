import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@enterprise/db", "@enterprise/auth"],
};

export default nextConfig;
