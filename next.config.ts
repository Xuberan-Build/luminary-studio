import type { NextConfig } from "next";

const config: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  pageExtensions: ["js","jsx","ts","tsx","md","mdx"],
  typedRoutes: false
};

export default config;
