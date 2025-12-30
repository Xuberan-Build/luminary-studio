import type { NextConfig } from "next";

const config: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  pageExtensions: ["js","jsx","ts","tsx","md","mdx"],
  typedRoutes: false,

  // Skip trailing slash redirects for API routes (fixes Stripe webhook 308 errors)
  skipTrailingSlashRedirect: true,
};

export default config;
