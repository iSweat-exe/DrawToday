import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// Pre-launch: nothing is indexed. Open the public pages (landing, exercises...) when the marketing decision is made.
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [{ userAgent: "*", disallow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
