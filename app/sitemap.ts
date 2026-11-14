import type { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/lib/queries/public";
import { absoluteUrl } from "@/lib/utils/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, caseStudies] = await Promise.all([
    getPublishedSlugs("services"),
    getPublishedSlugs("projects"),
    getPublishedSlugs("case_studies"),
  ]);

  const statics: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/work"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/case-studies"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.7 },
  ];

  const entries = (rows: { slug: string; updated_at: string }[], base: string, priority: number) =>
    rows.map((r) => ({
      url: absoluteUrl(`${base}/${r.slug}`),
      lastModified: new Date(r.updated_at),
      changeFrequency: "monthly" as const,
      priority,
    }));

  return [
    ...statics,
    ...entries(services, "/services", 0.8),
    ...entries(projects, "/work", 0.7),
    ...entries(caseStudies, "/case-studies", 0.7),
  ];
}
