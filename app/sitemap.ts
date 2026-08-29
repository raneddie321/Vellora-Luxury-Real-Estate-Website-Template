import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { properties } from "@/data/properties";
import { developments } from "@/data/developments";
import { neighborhoods } from "@/data/neighborhoods";
import { agents } from "@/data/agents";
import { articles } from "@/data/articles";
import { services } from "@/data/services";

const staticRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/properties", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/developments", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/neighborhoods", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/agents", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/services", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/journal", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.6, changeFrequency: "yearly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" as const },
  { path: "/book-a-viewing", priority: 0.6, changeFrequency: "yearly" as const },
  { path: "/search", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/mortgage-calculator", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/compare", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/favorites", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => `${siteConfig.url}${path}`;

  return [
    ...staticRoutes.map((route) => ({
      url: url(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...properties.map((p) => ({
      url: url(`/properties/${p.slug}`),
      lastModified: new Date(p.listedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...developments.map((d) => ({
      url: url(`/developments/${d.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...neighborhoods.map((n) => ({
      url: url(`/neighborhoods/${n.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...agents.map((a) => ({
      url: url(`/agents/${a.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...services.map((s) => ({
      url: url(`/services/${s.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...articles.map((a) => ({
      url: url(`/journal/${a.slug}`),
      lastModified: new Date(a.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
