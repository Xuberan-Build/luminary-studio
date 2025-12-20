import type { NextConfig } from "next";

const config: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  pageExtensions: ["js","jsx","ts","tsx","md","mdx"],
  typedRoutes: false
};

export default config;
