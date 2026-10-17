import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || "hayat2808",
  },
};

export default nextConfig;
