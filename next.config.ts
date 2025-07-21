import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Désactiver ESLint pendant le build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
