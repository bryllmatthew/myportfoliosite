import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Breadcrumbs, SectionHeader } from "@/components/public/section";
import { RichText } from "@/components/public/rich-text";
import { CaseStudyCard, ProjectCard } from "@/components/public/cards";
import { CtaSection } from "@/components/public/home/sections";
import { CmsImage } from "@/components/media/cms-image";
import { ParallaxMedia } from "@/components/motion/parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { ButtonLink } from "@/components/ui/button";
import { Tag, accentFor } from "@/components/ui/misc";
import { TrackView } from "@/components/analytics/analytics";
import { getCaseStudies, getProjects, getPublishedSlugs, getServiceBySlug } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, serviceSchema } from "@/lib/seo/json-ld";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const rows = await getPublishedSlugs("services");
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const service = await getServiceBySlug(slug, isEnabled);
  if (!service) return { title: "Service not found", robots: { index: false } };
  return buildMetadata({
    title: service.seo_title || service.title,
    description: service.seo_description || service.short_description,
    image: service.og_image_url || service.hero_media_url,
    path: `/services/${service.slug}`,
    noIndex: service.status !== "published",
  });
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const service = await getServiceBySlug(slug, isEnabled);
  if (!service) notFound();

  const [projects, caseStudies] = await Promise.all([getProjects(), getCaseStudies()]);
  const relatedWork = projects.filter((p) => p.services.some((s) => s.id === service.id)).slice(0, 3);
  const relatedCases = caseStudies.filter((c) => c.services.some((s) => s.id === service.id)).slice(0, 3);
  const a = accentFor(service.accent_key);
  const ctaLabel = service.cta_label || "Start a project";

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <TrackView event="service_view" id={service.id} label={service.title} />

      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-32 sm:pt-40">
        <div aria-hidden className="dot-grid dot-grid-fade absolute inset-0" />
        <div aria-hidden className={cn("absolute -right-40 -top-40 h-[30rem] w-[44rem] rounded-full opacity-60 blur-[120px]", a.bg)} />
        <div className="container-page relative">
          <Breadcrumbs items={[{ name: "Services", path: "/services" }, { name: service.title, path: `/services/${service.slug}` }]} className="mb-10" />
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-8">
              <h1 className="type-h1">{service.title}</h1>
              {service.short_description ? <p className="type-lead mt-6 max-w-2xl">{service.short_description}</p> : null}
              <div className="mt-10">
                <Magnetic>
                  <ButtonLink href={`/contact?service=${service.slug}`} size="lg" data-track="cta_click" data-track-label={`service hero: ${ctaLabel}`}>
                    {ctaLabel}
                  </ButtonLink>
                </Magnetic>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {service.hero_media_url ? (
        <div className="container-page">
          <ParallaxMedia className="aspect-[21/9] rounded-[var(--radius-card)] border border-line bg-ink-raised">
            <CmsImage src={service.hero_media_url} alt="" sizes="(min-width: 1280px) 1200px, 100vw" priority />
          </ParallaxMedia>
        </div>
      ) : null}

      {/* Overview + problems solved */}
      {service.overview || service.outcomes.length ? (
        <section aria-label="Overview" className="section-y">
          <div className="container-page grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <RichText content={service.overview} className="text-lg" />
            </div>
            {service.outcomes.length ? (
              <div className="lg:col-span-4 lg:col-start-9">
                <h2 className="font-display text-xl font-semibold">Problems this solves</h2>
                <ul className="mt-6 space-y-4">
                  {service.outcomes.map((o) => (
                    <li key={o} className="flex gap-3 text-muted">
                      <span aria-hidden className={cn("mt-2.5 size-1.5 shrink-0 rounded-full", a.dot)} />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Capabilities */}
      {service.capabilities.length ? (
        <section aria-labelledby="capabilities" className="section-y border-t border-line">
          <div className="container-page">
            <SectionHeader id="capabilities" heading="What I can take on" />
            <ul className="mt-12 grid overflow-hidden rounded-[var(--radius-card)] border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
              {service.capabilities.map((c) => (
                <li key={c.id} className="border-b border-r border-line p-6 sm:p-7">
                  <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                  {c.description ? <p className="mt-2 text-muted">{c.description}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Deliverables + tools */}
      {service.deliverables.length || service.tools.length ? (
        <section aria-label="Deliverables and tools" className="section-y border-t border-line">
          <div className="container-page grid gap-14 lg:grid-cols-2">
            {service.deliverables.length ? (
              <div>
                <h2 className="type-h3">What you get</h2>
                <ul className="mt-6 space-y-3">
                  {service.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-3 text-lg">
                      <Check className={cn("mt-1 size-5 shrink-0", a.text)} aria-hidden />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {service.tools.length ? (
              <div>
                <h2 className="type-h3">Tools and technology</h2>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {service.tools.map((t) => (
                    <li key={t}>
                      <Tag>{t}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Process */}
      {service.process_steps.length ? (
        <section aria-labelledby="service-process" className="section-y border-t border-line">
          <div className="container-page">
            <SectionHeader id="service-process" heading="How it works" />
            <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {service.process_steps.map((s, i) => (
                <li key={s.id} className="border-t border-line pt-6">
                  <span className={cn("font-display text-sm font-semibold", a.text)}>Step {i + 1}</span>
                  <h3 className="type-h3 mt-3">{s.title}</h3>
                  {s.description ? <p className="mt-2 text-muted">{s.description}</p> : null}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Related work */}
      {relatedWork.length ? (
        <section aria-labelledby="related-work" className="section-y border-t border-line">
          <div className="container-page">
            <SectionHeader
              id="related-work"
              heading="Related work"
              action={<ButtonLink href={`/work?service=${service.slug}`} variant="secondary">See all</ButtonLink>}
            />
            <Stagger as="ul" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedWork.map((p) => (
                <StaggerItem as="li" key={p.id}>
                  <ProjectCard project={p} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {relatedCases.length ? (
        <section aria-labelledby="related-cases" className="section-y border-t border-line">
          <div className="container-page">
            <SectionHeader id="related-cases" heading="Related case studies" />
            <Stagger as="ul" className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {relatedCases.map((c) => (
                <StaggerItem as="li" key={c.id}>
                  <CaseStudyCard caseStudy={c} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* FAQ: native disclosure, keyboard accessible without JS */}
      {service.faqs.length ? (
        <section aria-labelledby="faq" className="section-y border-t border-line">
          <div className="container-page grid gap-10 lg:grid-cols-12">
            <h2 id="faq" className="type-h2 lg:col-span-4">
              Questions
            </h2>
            <div className="divide-y divide-line border-y border-line lg:col-span-8">
              {service.faqs.map((f) => (
                <details key={f.id} className="group py-1">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span aria-hidden className="relative size-4 shrink-0">
                      <span className="absolute left-0 top-1/2 h-px w-4 bg-paper" />
                      <span className="absolute left-1/2 top-0 h-4 w-px bg-paper transition-transform duration-200 group-open:scale-y-0" />
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-6 text-muted">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaSection
        heading={`Ready to talk about ${service.title}?`}
        description="Share where things stand today. You will get a clear recommendation on what to do first."
        primary={{ label: ctaLabel, url: `/contact?service=${service.slug}` }}
        secondary={{ label: "See all services", url: "/services" }}
        trackLabel={`service cta: ${service.slug}`}
      />
    </>
  );
}
