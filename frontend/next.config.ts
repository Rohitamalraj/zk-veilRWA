import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  serverExternalPackages: [
    '@solana/kit',
    '@solana-program/system',
    '@solana-program/token',
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    // Ignore Solana optional dependencies
    config.externals.push({
      '@solana/kit': 'commonjs @solana/kit',
      '@solana-program/system': 'commonjs @solana-program/system',
      '@solana-program/token': 'commonjs @solana-program/token',
    });
    return config;
  },
};

export default nextConfig;
