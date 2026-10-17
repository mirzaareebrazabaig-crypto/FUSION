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
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || "hayat2808",
  },
};

export default nextConfig;
