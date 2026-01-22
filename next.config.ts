import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "i.ibb.co" }],
  },
  trailingSlash: true,
  pageExtensions: ["js","jsx","ts","tsx","md","mdx"],
  typedRoutes: false,

  // Skip trailing slash redirects for API routes (fixes Stripe webhook 308 errors)
  skipTrailingSlashRedirect: true,

  // Redirects for renamed product slugs
  async redirects() {
    return [
      {
        source: '/products/quantum-initiation/:path*',
        destination: '/products/business-alignment/:path*',
        permanent: true,
      },
    ];
  },
};

export default config;
