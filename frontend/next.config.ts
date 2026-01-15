import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Empty turbopack config to acknowledge we're using it
  turbopack: {},
};

export default nextConfig;
