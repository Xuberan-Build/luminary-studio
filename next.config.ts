import type { NextConfig } from "next";

const config: NextConfig = {
  // Removed static export for SSR support (needed for courses with auth)
  images: { unoptimized: true },
  trailingSlash: true,
  pageExtensions: ["js","jsx","ts","tsx","md","mdx"],
  typedRoutes: false
};

export default config;
