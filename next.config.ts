import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cursor browser + local tooling often hit 127.0.0.1 while Next serves as localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
