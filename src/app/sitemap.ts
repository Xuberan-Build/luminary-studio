import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://luminary-studio.netlify.app"; // replace on deploy

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/meet/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/values/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/resources/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/articles/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/courses/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/whitepapers/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/portfolio/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
  return staticRoutes;
}
