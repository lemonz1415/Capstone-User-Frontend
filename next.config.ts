import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["https://capstone24.sit.kmutt.ac.th"],
    unoptimized: true,
  },
  basePath: "/nw1",
  assetPrefix: "/nw1",
  reactStrictMode: false, //เฉพาะใน dev mode กันไม่ให้ fetch ซ้ำ 2 รอบในหน้า exam จนได้ exam id ที่ซ้ำกันมา
};

export default nextConfig;
