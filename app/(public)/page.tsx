import type { Metadata } from "next";
import type { ReactNode } from "react";
import { HomeHero } from "@/components/public/home/hero";
import { ReelsSection } from "@/components/public/home/reels";
import { BrandsSection, IntroSection, VideoSection } from "@/components/public/home/brands-intro";
import {
  CtaSection,
  ExpertiseStrip,
  FeaturedCaseStudy,
  ProcessSection,
  SelectedWork,
  ServicesRail,
  StackSection,
  TestimonialsSection,
} from "@/components/public/home/sections";
import {
  getBrands,
  getHomeCaseStudy,
  getHomeProjects,
  getHomeSections,
  getProfile,
  getServices,
  getSiteSettings,
  getSocialLinks,
  getTestimonials,
} from "@/lib/queries/public";
import { HOME_CONFIG_DEFAULTS, readHomeConfig } from "@/lib/queries/home-config";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, personSchema, professionalServiceSchema } from "@/lib/seo/json-ld";
import type { HomeSection, HomeSectionKey } from "@/types/content";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("home", "/");
}

/** Order used before any homepage modules exist in the CMS. */
const DEFAULT_ORDER: HomeSectionKey[] = ["hero", "brands", "expertise", "intro", "services", "work", "reels", "case_study", "process", "stack", "video", "testimonials", "cta"];

function placeholderSection(key: HomeSectionKey, i: number): HomeSection {
  return {
    id: key,
    section_key: key,
    heading: null,
    eyebrow: null,
    description: null,
    is_visible: true,
    sort_order: i,
    config: HOME_CONFIG_DEFAULTS[key] as Record<string, unknown>,
    updated_at: "",
  };
}

export default async function HomePage() {
  const [stored, profile, site, services, testimonials, social, brands] = await Promise.all([
    getHomeSections(),
    getProfile(),
    getSiteSettings(),
    getServices(),
    getTestimonials(),
    getSocialLinks(),
    getBrands(),
  ]);

  const sections = (stored.length ? stored : DEFAULT_ORDER.map(placeholderSection))
    .filter((s) => s.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order);
  const byKey = new Map(sections.map((s) => [s.section_key, s]));

  const expertise = readHomeConfig("expertise", byKey.get("expertise"));
  const workConfig = readHomeConfig("work", byKey.get("work"));
  const caseConfig = readHomeConfig("case_study", byKey.get("case_study"));
  const serviceConfig = readHomeConfig("services", byKey.get("services"));
  const testimonialConfig = readHomeConfig("testimonials", byKey.get("testimonials"));

  const [projects, featuredCase] = await Promise.all([
    byKey.has("work") ? getHomeProjects(workConfig.project_ids, workConfig.limit) : Promise.resolve([]),
    byKey.has("case_study") ? getHomeCaseStudy(caseConfig.case_study_id) : Promise.resolve(null),
  ]);

  const chosenServices = serviceConfig.service_ids.length
    ? serviceConfig.service_ids.map((id) => services.find((s) => s.id === id)).filter((s) => s != null)
    : services;
  const chosenTestimonials = testimonialConfig.testimonial_ids.length
    ? testimonialConfig.testimonial_ids.map((id) => testimonials.find((t) => t.id === id)).filter((t) => t != null)
    : testimonials.filter((t) => t.is_featured).length
      ? testimonials.filter((t) => t.is_featured)
      : testimonials;

  const render = (section: HomeSection): ReactNode => {
    switch (section.section_key) {
      case "hero":
        return (
          <HomeHero
            key={section.id}
            section={section}
            config={readHomeConfig("hero", section)}
            profile={profile}
            nodeLabels={expertise.items.map((i) => ({ key: i.key, label: i.label }))}
          />
        );
      case "brands":
        return <BrandsSection key={section.id} section={section} brands={brands} />;
      case "intro":
        return <IntroSection key={section.id} section={section} config={readHomeConfig("intro", section)} profile={profile} />;
      case "expertise":
        return <ExpertiseStrip key={section.id} config={expertise} />;
      case "services":
        return <ServicesRail key={section.id} section={section} services={chosenServices} />;
      case "work":
        return <SelectedWork key={section.id} section={section} projects={projects} />;
      case "reels":
        return <ReelsSection key={section.id} section={section} config={readHomeConfig("reels", section)} />;
      case "case_study":
        return <FeaturedCaseStudy key={section.id} section={section} caseStudy={featuredCase} />;
      case "process":
        return <ProcessSection key={section.id} section={section} config={readHomeConfig("process", section)} />;
      case "stack":
        return <StackSection key={section.id} section={section} profile={profile} />;
      case "video":
        return <VideoSection key={section.id} section={section} config={readHomeConfig("video", section)} />;
      case "testimonials":
        return <TestimonialsSection key={section.id} section={section} testimonials={chosenTestimonials} />;
      case "cta": {
        const cfg = readHomeConfig("cta", section);
        return (
          <CtaSection
            key={section.id}
            heading={section.heading || "Have something to build, automate or sell?"}
            description={section.description}
            primary={cfg.primary_cta}
            secondary={cfg.secondary_cta}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      <JsonLd data={[personSchema(profile, site, social), professionalServiceSchema(site, services)]} />
      {!byKey.has("hero") ? <h1 className="sr-only">{site?.site_name || "Portfolio"}</h1> : null}
      {sections.map(render)}
    </>
  );
}
