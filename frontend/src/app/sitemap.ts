import type { MetadataRoute } from "next";

import { absoluteUrl, pagesSeo } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return pagesSeo.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: new Date(),
    changeFrequency: page.path === "/" ? "weekly" : "monthly",
    priority: page.path === "/" ? 1 : 0.7,
  }));
}
