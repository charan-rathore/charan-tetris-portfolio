import type { NextConfig } from "next";

const repo = "charan-tetris-portfolio";
const basePath =
  process.env.GITHUB_PAGES === "true" ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // Cursor browser + local tooling often hit 127.0.0.1 while Next serves as localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
