import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CmsImage } from "@/components/media/cms-image";
import { Spotlight } from "@/components/motion/spotlight";
import { CountUp } from "@/components/motion/count-up";

import { displayClient, formatDateRange, formatMetric, formatMonthYear } from "@/lib/utils/format";
import type {
  CaseStudyMetric,
  CaseStudyWithRelations,
  ProjectWithRelations,
  Testimonial,
} from "@/types/content";

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------
export function ProjectCard({
  project,
  size = "default",
  priority,
}: {
  project: ProjectWithRelations;
  size?: "default" | "wide" | "panorama";
  priority?: boolean;
}) {
  const client = displayClient(project.client_name, project.client_display_mode);
  const accent = project.services[0]?.accent_key ?? null;
  const meta = [project.project_type, client].filter(Boolean);
  return (
    <Spotlight className="h-full rounded-[var(--radius-card)]">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface/60 transition-colors duration-300 hover:border-line-strong">
        <div
          className={cn(
            "relative overflow-hidden bg-ink-raised",
            size === "panorama" ? "aspect-[16/9] lg:aspect-[21/9]" : size === "wide" ? "aspect-[16/9]" : "aspect-[4/3]",
          )}
        >
          <div className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.035]">
            <CmsImage
              src={project.cover_image_url}
              alt={project.cover_image_alt || ""}
              sizes={size === "panorama" ? "(min-width: 1280px) 1200px, 100vw" : size === "wide" ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
              accent={accent}
              priority={priority}
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          {project.categories.length ? (
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-meta" aria-label="Categories">
              {project.categories.map((c) => (
                <li key={c.id}>{c.name}</li>
              ))}
            </ul>
          ) : null}
          <h3 className="type-h3">
            <Link
              href={`/work/${project.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {project.title}
            </Link>
          </h3>
          {project.short_description ? <p className="line-clamp-3 text-muted">{project.short_description}</p> : null}
          {meta.length ? <p className="mt-auto pt-2 text-sm text-subtle">{meta.join(", ")}</p> : null}
        </div>
        <span
          aria-hidden
          className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full border border-line-strong bg-ink/70 text-paper opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <ArrowUpRight className="size-4" />
        </span>
      </article>
    </Spotlight>
  );
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------
export function primaryMetric(metrics: CaseStudyMetric[]): CaseStudyMetric | null {
  return metrics.find((m) => m.is_primary) ?? metrics[0] ?? null;
}

/** A metric value always travels with its label ("5.2x ROAS", never just "5.2x"). */
export function MetricValue({
  metric,
  className,
  animate = true,
}: {
  metric: CaseStudyMetric;
  className?: string;
  animate?: boolean;
}) {
  if (animate && metric.value_numeric != null) {
    return <CountUp value={metric.value_numeric} prefix={metric.prefix} suffix={metric.suffix} className={className} />;
  }
  return <span className={className}>{formatMetric(metric)}</span>;
}

/**
 * The leading result, set as type rather than a boxed stat tile:
 * the number, then what it measures, then its context.
 */
export function PrimaryResult({ metric, className }: { metric: CaseStudyMetric; className?: string }) {
  return (
    <dl className={cn("flex flex-col-reverse", className)}>
      <dt className="mt-4 max-w-sm">
        <span className="block text-lg font-medium text-paper">{metric.label}</span>
        {metric.description ? <span className="mt-1 block text-sm text-muted">{metric.description}</span> : null}
      </dt>
      <dd className="type-metric text-[clamp(4rem,10vw,8rem)] text-signal">
        <MetricValue metric={metric} />
      </dd>
    </dl>
  );
}

/** Supporting results as a ruled ledger row. */
export function MetricLedger({ metrics, className }: { metrics: CaseStudyMetric[]; className?: string }) {
  if (!metrics.length) return null;
  return (
    <dl className={cn("grid grid-cols-2 border-t border-line sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]", className)}>
      {metrics.map((m) => (
        <div key={m.id} className="flex flex-col-reverse gap-1.5 border-b border-line py-5 pr-4">
          <dt className="text-sm text-muted">
            {m.label}
            {m.description ? <span className="mt-0.5 block text-xs text-subtle">{m.description}</span> : null}
          </dt>
          <dd className="type-metric text-[clamp(1.75rem,3vw,2.375rem)] text-paper">
            <MetricValue metric={m} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------
// Case study
// ---------------------------------------------------------------------------
export function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudyWithRelations }) {
  const metric = primaryMetric(caseStudy.metrics);
  const range = formatDateRange(caseStudy.date_start, caseStudy.date_end);
  const client = displayClient(caseStudy.client_name, caseStudy.client_display_mode, caseStudy.client_descriptor);
  const context = [caseStudy.platforms.map((p) => p.name).join(" and "), caseStudy.campaign_objective, range].filter(Boolean);
  return (
    <Spotlight className="h-full rounded-[var(--radius-card)]">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface/60 p-6 transition-colors duration-300 hover:border-line-strong sm:p-7">
        {metric ? (
          <dl className="flex flex-col-reverse border-b border-line pb-6">
            <dt className="mt-2 text-sm font-medium text-paper">{metric.label}</dt>
            <dd className="type-metric text-[clamp(2.75rem,5vw,4rem)] text-signal">
              <MetricValue metric={metric} animate={false} />
            </dd>
          </dl>
        ) : caseStudy.result_headline ? (
          <p className="border-b border-line pb-6 font-display text-2xl font-semibold leading-tight text-signal">
            {caseStudy.result_headline}
          </p>
        ) : null}
        <div className="flex flex-1 flex-col gap-3 pt-6">
          {client ? <p className="text-meta">{client}</p> : null}
          <h3 className="type-h3">
            <Link
              href={`/case-studies/${caseStudy.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {caseStudy.title}
            </Link>
          </h3>
          {caseStudy.short_description ? <p className="line-clamp-3 text-muted">{caseStudy.short_description}</p> : null}
          {context.length ? <p className="mt-auto pt-2 text-sm text-subtle">{context.join(", ")}</p> : null}
        </div>
      </article>
    </Spotlight>
  );
}

// ---------------------------------------------------------------------------
// Testimonial
// ---------------------------------------------------------------------------
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const byline = [testimonial.role, testimonial.company].filter(Boolean).join(", ");
  return (
    <figure className="flex h-full flex-col justify-between gap-8 rounded-[var(--radius-card)] border border-line bg-surface/50 p-6 sm:p-8">
      <Quote className="size-6 text-signal" aria-hidden />
      <blockquote className="text-lg leading-relaxed text-paper">
        <p>{testimonial.quote}</p>
      </blockquote>
      <figcaption className="flex items-center gap-3">
        {testimonial.avatar_url ? (
          <span className="relative size-11 shrink-0 overflow-hidden rounded-full border border-line">
            <CmsImage src={testimonial.avatar_url} alt="" sizes="44px" />
          </span>
        ) : (
          <span
            aria-hidden
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-ink-raised font-display font-semibold text-muted"
          >
            {testimonial.name.slice(0, 1)}
          </span>
        )}
        <span className="flex flex-col">
          <span className="font-medium text-paper">{testimonial.name}</span>
          {byline ? <span className="text-sm text-muted">{byline}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}

export function projectDateLabel(project: ProjectWithRelations) {
  return formatMonthYear(project.project_date);
}
