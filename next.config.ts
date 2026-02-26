import type { NextConfig } from "next";

const buildDate = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_DATE: buildDate,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
