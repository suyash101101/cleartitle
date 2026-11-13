import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hot-labs/near-connect", "chainsig.js"],
  devIndicators: false,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      encoding: false,
    };
    config.externals = [...(config.externals || []), "pino-pretty", "encoding"];
    return config;
  },
};

export default nextConfig;
