import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["https://capstone24.sit.kmutt.ac.th"],
    unoptimized: true,
  },
  basePath: "/nw1",
  assetPrefix: "/nw1",
};

export default nextConfig;
