import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/public/section";
import { ProjectCard } from "@/components/public/cards";
import { WorkBrowser } from "@/components/public/work-browser";
import { CtaSection } from "@/components/public/home/sections";
import { getPageSettings, getProjectCategories, getProjects, getServices, getSiteSettings } from "@/lib/queries/public";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("work", "/work", "My work");
}

export default async function WorkPage() {
  const [page, projects, categories, services, site] = await Promise.all([
    getPageSettings("work"),
    getProjects(),
    getProjectCategories(),
    getServices(),
    getSiteSettings(),
  ]);

  const featured = projects.filter((p) => p.is_featured).sort((a, b) => (a.featured_order ?? 9999) - (b.featured_order ?? 9999));
  const lead = featured[0] ?? null;

  return (
    <>
      <PageHero heading={page?.heading || "My work"} intro={page?.intro} crumbs={[{ name: "My Work", path: "/work" }]} />

      {lead && projects.length > 3 ? (
        <section aria-label="Featured project" className="pb-16">
          <div className="container-page">
            <ProjectCard project={lead} size="wide" priority />
          </div>
        </section>
      ) : null}

      <section aria-label="All projects" className="pb-24">
        <div className="container-page">
          {/* Static fallback renders every project for crawlers and no-JS; the browser adds filters. */}
          <Suspense
            fallback={
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {projects.map((p) => (
                  <li key={p.id}>
                    <ProjectCard project={p} />
                  </li>
                ))}
              </ul>
            }
          >
            <WorkBrowser
              projects={projects}
              categories={categories}
              services={services.map((s) => ({ slug: s.slug, title: s.title }))}
            />
          </Suspense>
        </div>
      </section>

      <CtaSection
        heading="Want results like these for your business?"
        primary={{ label: site?.primary_cta_label || "Start a project", url: site?.primary_cta_url || "/contact" }}
        secondary={{ label: "Advertising case studies", url: "/case-studies" }}
        trackLabel="work index cta"
      />
    </>
  );
}
