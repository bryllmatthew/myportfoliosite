import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { PageHero } from "@/components/public/section";
import { CtaSection, ServiceRailList } from "@/components/public/home/sections";
import { EmptyState } from "@/components/ui/misc";
import { getPageSettings, getServices, getSiteSettings } from "@/lib/queries/public";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("services", "/services", "Services");
}

export default async function ServicesPage() {
  const [page, services, site] = await Promise.all([getPageSettings("services"), getServices(), getSiteSettings()]);

  return (
    <>
      <PageHero heading={page?.heading || "Services"} intro={page?.intro} crumbs={[{ name: "Services", path: "/services" }]} />

      <section aria-label="Service list" className="pb-24">
        <div className="container-page">
          {services.length ? (
            <ServiceRailList services={services} className="border-t border-line" />
          ) : (
            <EmptyState icon={<Layers />} title="Services are being updated" description="Get in touch to talk about what you need." />
          )}
        </div>
      </section>

      {services.length > 1 ? (
        <section aria-labelledby="connected" className="section-y border-t border-line">
          <div className="container-page grid gap-10 lg:grid-cols-12">
            <h2 id="connected" className="type-h2 lg:col-span-5">
              Why one partner across all of them
            </h2>
            <div className="space-y-5 text-lg text-muted lg:col-span-6 lg:col-start-7">
              <p>
                A landing page, the automation behind its form, the campaign sending traffic to it and the ad creative in
                that campaign all decide the same number: how many enquiries turn into customers.
              </p>
              <p>
                When one person understands every link in that chain, fixes happen in the right place, tracking is set up
                before launch, and nothing waits on a handoff between vendors.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <CtaSection
        heading="Not sure which service fits?"
        description="Describe the problem. I will tell you what I would do first, and whether I am the right person for it."
        primary={{ label: site?.primary_cta_label || "Start a project", url: site?.primary_cta_url || "/contact" }}
        trackLabel="services index cta"
      />
    </>
  );
}
