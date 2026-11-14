import { absoluteUrl } from "@/lib/utils/site-url";
import type {
  CaseStudyWithRelations,
  Profile,
  ProjectWithRelations,
  ServiceWithChildren,
  SiteSettings,
  SocialLink,
} from "@/types/content";

type JsonLdObject = Record<string, unknown>;

/** Renders JSON-LD safely: "<" is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function personSchema(profile: Profile | null, site: SiteSettings | null, social: SocialLink[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/#person"),
    name: profile?.display_name || site?.site_name,
    jobTitle: profile?.headline || undefined,
    description: profile?.short_bio || site?.site_description || undefined,
    url: absoluteUrl("/"),
    image: profile?.avatar_url || undefined,
    email: profile?.email_public ? `mailto:${profile.email_public}` : undefined,
    knowsAbout: profile?.skills?.length ? profile.skills : undefined,
    sameAs: social.filter((s) => s.url.startsWith("http")).map((s) => s.url),
  };
}

export function professionalServiceSchema(
  site: SiteSettings | null,
  services: Pick<ServiceWithChildren, "title" | "slug" | "short_description">[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": absoluteUrl("/#service"),
    name: site?.site_name,
    description: site?.site_description || undefined,
    url: absoluteUrl("/"),
    founder: { "@id": absoluteUrl("/#person") },
    areaServed: "Worldwide",
    hasOfferCatalog: services.length
      ? {
          "@type": "OfferCatalog",
          name: "Services",
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: s.title,
              description: s.short_description,
              url: absoluteUrl(`/services/${s.slug}`),
            },
          })),
        }
      : undefined,
  };
}

export function serviceSchema(service: ServiceWithChildren): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.seo_description || service.short_description,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { "@id": absoluteUrl("/#person") },
    ...(service.faqs.length
      ? {
          subjectOf: {
            "@type": "FAQPage",
            mainEntity: service.faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          },
        }
      : {}),
  };
}

export function projectSchema(project: ProjectWithRelations): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.seo_description || project.short_description,
    url: absoluteUrl(`/work/${project.slug}`),
    image: project.og_image_url || project.cover_image_url || undefined,
    dateCreated: project.project_date || undefined,
    datePublished: project.published_at || undefined,
    dateModified: project.updated_at,
    creator: { "@id": absoluteUrl("/#person") },
    keywords: [...project.categories.map((c) => c.name), ...project.technologies.map((t) => t.name)].join(", ") || undefined,
  };
}

export function caseStudySchema(cs: CaseStudyWithRelations): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: cs.title,
    description: cs.seo_description || cs.short_description,
    url: absoluteUrl(`/case-studies/${cs.slug}`),
    image: cs.og_image_url || cs.cover_image_url || undefined,
    datePublished: cs.published_at || undefined,
    dateModified: cs.updated_at,
    author: { "@id": absoluteUrl("/#person") },
    about: cs.platforms.map((p) => p.name).join(", ") || undefined,
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
