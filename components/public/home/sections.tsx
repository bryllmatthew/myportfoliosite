import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ButtonLink } from "@/components/ui/button";
import { accentFor, Tag } from "@/components/ui/misc";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { Magnetic } from "@/components/motion/magnetic";
import { SectionHeader } from "@/components/public/section";
import { MetricLedger, PrimaryResult, ProjectCard, TestimonialCard, primaryMetric } from "@/components/public/cards";
import { displayClient, formatDateRange } from "@/lib/utils/format";
import type { HomeConfig } from "@/lib/validations/content";
import type {
  CaseStudyWithRelations,
  HomeSection,
  Profile,
  ProjectWithRelations,
  ServiceWithChildren,
  Testimonial,
} from "@/types/content";

// ---------------------------------------------------------------------------
// Expertise strip: the four disciplines as one connected line.
// ---------------------------------------------------------------------------
export function ExpertiseStrip({ config }: { config: HomeConfig<"expertise"> }) {
  if (!config.items.length) return null;
  return (
    <section aria-label="Areas of expertise" className="relative border-y border-line bg-ink-raised/50">
      <ol className="container-page grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {config.items.map((item, i) => {
          const a = accentFor(item.key);
          return (
            <li
              key={`${item.key}-${item.label}`}
              className={cn(
                "relative flex flex-col gap-1.5 py-7 sm:px-6 lg:py-9",
                i > 0 && "border-t border-line sm:border-t-0",
                i % 2 === 1 && "sm:border-l sm:border-line",
                i >= 2 && "sm:border-t lg:border-t-0",
                i > 0 && "lg:border-l lg:border-line",
                i === 0 && "sm:pl-0",
              )}
            >
              <span className="flex items-center gap-2.5">
                <span aria-hidden className={cn("size-2 rounded-full", a.dot)} />
                <span className="font-display text-lg font-semibold tracking-tight">{item.label}</span>
              </span>
              {item.description ? <span className="text-sm text-muted">{item.description}</span> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Services as stations on one connected line (homepage and services index). */
export function ServiceRailList({ services, className }: { services: ServiceWithChildren[]; className?: string }) {
  return (
    <ol className={cn("relative", className)}>
      <span aria-hidden className="absolute bottom-10 left-[0.3125rem] top-10 w-px bg-gradient-to-b from-build via-automate to-create opacity-50 md:left-[0.4375rem]" />
      {services.map((service) => {
        const a = accentFor(service.accent_key);
        return (
          <li key={service.id}>
              <Link
                href={`/services/${service.slug}`}
                data-track="cta_click"
                data-track-label={`home service: ${service.title}`}
                className="group relative grid gap-4 border-b border-line py-9 pl-9 transition-colors md:grid-cols-12 md:gap-8 md:py-12 md:pl-14"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-[2.85rem] size-[0.6875rem] rounded-full ring-4 ring-ink transition-transform duration-300 group-hover:scale-125 md:top-[3.9rem] md:size-[0.9375rem]",
                    a.dot,
                  )}
                />
                <h3 className="type-h2 md:col-span-5">
                  <span className="transition-colors duration-300 group-hover:text-paper">{service.title}</span>
                </h3>
                <div className="md:col-span-6">
                  <p className="text-lg text-muted">{service.short_description}</p>
                  {service.capabilities.length ? (
                    <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${service.title} capabilities`}>
                      {service.capabilities.slice(0, 4).map((c) => (
                        <li key={c.id} className={cn("rounded-full border px-3 py-1 text-[0.8125rem] text-paper/85", a.border)}>
                          {c.title}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <span className="hidden justify-end md:col-span-1 md:flex">
                  <span className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong transition-all duration-300 group-hover:border-paper group-hover:bg-paper group-hover:text-ink">
                    <ArrowUpRight className="size-4" aria-hidden />
                  </span>
                </span>
              </Link>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Services rail: services as stations on one vertical line.
// ---------------------------------------------------------------------------
export function ServicesRail({ section, services }: { section: HomeSection; services: ServiceWithChildren[] }) {
  if (!services.length) return null;
  return (
    <section aria-labelledby="home-services" className="section-y relative">
      <div className="container-page">
        <SectionHeader
          id="home-services"
          eyebrow={section.eyebrow}
          heading={section.heading}
          description={section.description}
          action={
            <ButtonLink href="/services" variant="secondary">
              All services
            </ButtonLink>
          }
        />
        <ServiceRailList services={services} className="mt-14 md:mt-20" />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Selected work: asymmetric editorial grid.
// ---------------------------------------------------------------------------
/** Editorial grid spans (of 12) chosen so every row fills completely. */
const WORK_LAYOUTS: Record<number, number[]> = {
  1: [12],
  2: [7, 5],
  3: [12, 6, 6],
  4: [7, 5, 5, 7],
  5: [7, 5, 4, 4, 4],
  6: [7, 5, 4, 4, 4, 12],
};
const SPAN_CLASS: Record<number, string> = {
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  12: "sm:col-span-2 lg:col-span-12",
};
function workSpans(n: number): number[] {
  if (WORK_LAYOUTS[n]) return WORK_LAYOUTS[n];
  return Array.from({ length: n }, (_, i) => [7, 5, 4, 4, 4, 6, 6][i % 7] ?? 4);
}

export function SelectedWork({ section, projects }: { section: HomeSection; projects: ProjectWithRelations[] }) {
  if (!projects.length) return null;
  return (
    <section aria-labelledby="home-work" className="section-y relative border-t border-line">
      <div className="container-page">
        <SectionHeader
          id="home-work"
          eyebrow={section.eyebrow}
          heading={section.heading}
          description={section.description}
          action={
            <ButtonLink href="/work" variant="secondary">
              All work
            </ButtonLink>
          }
        />
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 md:mt-20 lg:grid-cols-12 lg:gap-6">
          {projects.map((p, i) => {
            const span = workSpans(projects.length)[i] ?? 4;
            return (
              <StaggerItem key={p.id} className={cn(SPAN_CLASS[span], i === 0 && projects.length % 2 === 1 && "sm:col-span-2")}>
                <ProjectCard project={p} size={span === 12 ? "panorama" : span >= 7 ? "wide" : "default"} />
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Featured advertising case study: result first, then context.
// ---------------------------------------------------------------------------
export function FeaturedCaseStudy({ section, caseStudy }: { section: HomeSection; caseStudy: CaseStudyWithRelations | null }) {
  if (!caseStudy) return null;
  const primary = primaryMetric(caseStudy.metrics);
  const others = caseStudy.metrics.filter((m) => m.id !== primary?.id).slice(0, 3);
  const range = formatDateRange(caseStudy.date_start, caseStudy.date_end);
  const client = displayClient(caseStudy.client_name, caseStudy.client_display_mode, caseStudy.client_descriptor);
  const context = [
    caseStudy.platforms.length ? { label: "Platform", value: caseStudy.platforms.map((p) => p.name).join(", ") } : null,
    caseStudy.campaign_objective ? { label: "Objective", value: caseStudy.campaign_objective } : null,
    range ? { label: "Timeframe", value: range } : null,
    client ? { label: "Client", value: client } : null,
  ].filter((x): x is { label: string; value: string } => Boolean(x));

  return (
    <section aria-labelledby="home-case" className="section-y relative overflow-hidden border-t border-line bg-ink-raised/40">
      <Parallax amplitude={60} className="pointer-events-none absolute inset-0">
        <div aria-hidden className="absolute -left-40 top-10 h-[30rem] w-[40rem] rounded-full bg-signal/[0.07] blur-[120px]" />
      </Parallax>
      <div className="container-page relative">
        <SectionHeader eyebrow={section.eyebrow} heading={section.heading} description={section.description} />
        <div className="mt-12 grid gap-12 border-t border-line pt-10 md:mt-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {primary ? (
              <>
                <PrimaryResult metric={primary} />
                <MetricLedger metrics={others} className="mt-10" />
              </>
            ) : caseStudy.result_headline ? (
              <p className="type-h2 text-signal">{caseStudy.result_headline}</p>
            ) : null}
          </div>
          <div className="lg:col-span-5">
            <h3 id="home-case" className="type-h3">
              {caseStudy.title}
            </h3>
            {caseStudy.short_description ? <p className="mt-3 text-muted">{caseStudy.short_description}</p> : null}
            {context.length ? (
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                {context.map((c) => (
                  <div key={c.label}>
                    <dt className="text-subtle">{c.label}</dt>
                    <dd className="mt-0.5 text-paper">{c.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <ButtonLink
              href={`/case-studies/${caseStudy.slug}`}
              className="mt-8"
              variant="secondary"
              data-track="cta_click"
              data-track-label="home featured case study"
            >
              Read the case study
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Process: a real sequence, so it is numbered.
// ---------------------------------------------------------------------------
export function ProcessSection({ section, config }: { section: HomeSection; config: HomeConfig<"process"> }) {
  if (!config.steps.length) return null;
  return (
    <section aria-labelledby="home-process" className="section-y border-t border-line">
      <div className="container-page">
        <SectionHeader id="home-process" eyebrow={section.eyebrow} heading={section.heading} description={section.description} />
        <ol className="relative mt-14 grid gap-10 md:mt-20 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {config.steps.map((step, i) => (
            <li key={`${step.title}-${i}`} className="relative">
              <div className="flex items-center gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong font-display text-sm font-semibold text-signal">
                  {i + 1}
                </span>
                {i < config.steps.length - 1 ? (
                  <span aria-hidden className="hidden h-px flex-1 bg-gradient-to-r from-line-strong to-transparent lg:block" />
                ) : null}
              </div>
              <h3 className="type-h3 mt-6">{step.title}</h3>
              {step.description ? <p className="mt-3 text-muted">{step.description}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Tools grouped by discipline (context instead of a logo wall).
// ---------------------------------------------------------------------------
export function StackSection({ section, profile }: { section: HomeSection; profile: Profile | null }) {
  const groups = (profile?.stack_groups ?? []).filter((g) => g.items.length);
  if (!groups.length) return null;
  return (
    <section aria-labelledby="home-stack" className="section-y border-t border-line">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeader id="home-stack" eyebrow={section.eyebrow} heading={section.heading} description={section.description} />
        </div>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:col-span-8">
          {groups.map((g) => (
            <div key={g.category} className="border-t border-line pt-6">
              <h3 className="font-display text-lg font-semibold">{g.category}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <li key={item}>
                    <Tag>{item}</Tag>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Testimonials: only rendered when published testimonials exist.
// ---------------------------------------------------------------------------
export function TestimonialsSection({ section, testimonials }: { section: HomeSection; testimonials: Testimonial[] }) {
  if (!testimonials.length) return null;
  return (
    <section aria-labelledby="home-testimonials" className="section-y border-t border-line">
      <div className="container-page">
        <SectionHeader id="home-testimonials" eyebrow={section.eyebrow} heading={section.heading} description={section.description} />
        <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.id}>
              <TestimonialCard testimonial={t} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Final call to action (also used on inner pages).
// ---------------------------------------------------------------------------
export function CtaSection({
  heading,
  description,
  primary,
  secondary,
  trackLabel = "final cta",
}: {
  heading: string;
  description?: string | null;
  primary: { label: string; url: string } | null;
  secondary?: { label: string; url: string } | null;
  trackLabel?: string;
}) {
  return (
    <section aria-labelledby="cta-heading" className="relative overflow-hidden border-t border-line">
      <Parallax amplitude={50} className="pointer-events-none absolute inset-0">
        <div aria-hidden className="dot-grid absolute -inset-y-20 inset-x-0 opacity-70" />
      </Parallax>
      <div
        aria-hidden
        className="absolute bottom-[-40%] left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_181_71/0.13),transparent)]"
      />
      <div className="container-page section-y relative">
        <div className="max-w-4xl">
          <h2 id="cta-heading" className="type-h1">
            {heading}
          </h2>
          {description ? <p className="type-lead mt-6 max-w-2xl">{description}</p> : null}
          <div className="mt-10 flex flex-wrap gap-3">
            {primary?.label && primary.url ? (
              <Magnetic>
                <ButtonLink href={primary.url} size="lg" data-track="cta_click" data-track-label={`${trackLabel}: ${primary.label}`}>
                  {primary.label}
                </ButtonLink>
              </Magnetic>
            ) : null}
            {secondary?.label && secondary.url ? (
              <ButtonLink href={secondary.url} size="lg" variant="secondary" data-track="cta_click" data-track-label={`${trackLabel}: ${secondary.label}`}>
                {secondary.label}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

