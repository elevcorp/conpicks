import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a verification build run alongside `next dev` without clobbering .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
