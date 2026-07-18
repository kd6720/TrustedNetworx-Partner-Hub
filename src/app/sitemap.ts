import type { MetadataRoute } from "next";

const BASE_URL = "https://hub.trustednetworx.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "/", priority: 1.0 },
    { path: "/library", priority: 0.8 },
    { path: "/documentation", priority: 0.8 },
    { path: "/training", priority: 0.8 },
    { path: "/crm", priority: 0.9 },
    { path: "/opportunities", priority: 0.9 },
    { path: "/login", priority: 0.5 },
    { path: "/register", priority: 0.5 },
  ];

  return staticRoutes.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
  }));
}
