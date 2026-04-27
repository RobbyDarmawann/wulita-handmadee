import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Set max upload size to 10MB
    },
  },
};

export default nextConfig;
