import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/public/section";
import { CaseStudyCard } from "@/components/public/cards";
import { CaseStudyBrowser } from "@/components/public/case-study-browser";
import { CtaSection } from "@/components/public/home/sections";
import { getAdPlatforms, getCaseStudies, getCaseStudyCategories, getPageSettings } from "@/lib/queries/public";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("case_studies", "/case-studies", "Advertising case studies");
}

export default async function CaseStudiesPage() {
  const [page, caseStudies, platforms, categories] = await Promise.all([
    getPageSettings("case_studies"),
    getCaseStudies(),
    getAdPlatforms(),
    getCaseStudyCategories(),
  ]);

  return (
    <>
      <PageHero
        heading={page?.heading || "Advertising case studies"}
        intro={page?.intro}
        crumbs={[{ name: "Advertising Case Studies", path: "/case-studies" }]}
      />
      <section aria-label="Case studies" className="pb-24">
        <div className="container-page">
          <Suspense
            fallback={
              <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {caseStudies.map((c) => (
                  <li key={c.id}>
                    <CaseStudyCard caseStudy={c} />
                  </li>
                ))}
              </ul>
            }
          >
            <CaseStudyBrowser caseStudies={caseStudies} platforms={platforms} categories={categories} />
          </Suspense>
        </div>
      </section>
      <CtaSection
        heading="Want your next campaign to have numbers like these?"
        description="Share your current spend, results and goals. I will tell you where I see the biggest opportunity."
        primary={{ label: "Improve my advertising", url: "/contact?service=digital-marketing" }}
        secondary={{ label: "Digital marketing services", url: "/services/digital-marketing" }}
        trackLabel="case studies index cta"
      />
    </>
  );
}
