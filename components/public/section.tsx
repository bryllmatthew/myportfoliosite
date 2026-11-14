import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/json-ld";

interface SectionHeaderProps {
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  action?: ReactNode;
  className?: string;
  id?: string;
  /** Heading level. Default h2. */
  as?: "h1" | "h2";
}

/**
 * Section header. The eyebrow is a short context line in sentence case,
 * set in the signal colour with a node marker, not a tracked-out caps label.
 */
export function SectionHeader({ eyebrow, heading, description, action, className, id, as = "h2" }: SectionHeaderProps) {
  const Heading = as;
  if (!heading && !eyebrow && !description) return null;
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-signal">
            <span aria-hidden className="size-1.5 rounded-full bg-signal" />
            {eyebrow}
          </p>
        ) : null}
        {heading ? (
          <Heading id={id} className={as === "h1" ? "type-h1" : "type-h2"}>
            {heading}
          </Heading>
        ) : null}
        {description ? <p className="type-lead mt-5 max-w-2xl">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export interface Crumb {
  name: string;
  path: string;
}

/** Visible breadcrumbs + BreadcrumbList JSON-LD. The last crumb is the current page. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbSchema(all)} />
      <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
        <ol className="flex flex-wrap items-center gap-1.5 text-muted">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.path} className="inline-flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="max-w-[16rem] truncate text-paper">
                    {c.name}
                  </span>
                ) : (
                  <>
                    <Link href={c.path} className="transition-colors hover:text-paper">
                      {c.name}
                    </Link>
                    <ChevronRight className="size-3.5 text-subtle" aria-hidden />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

/** Page-level hero for index pages: breadcrumbs, H1 and intro over the dot-grid canvas. */
export function PageHero({
  heading,
  intro,
  crumbs,
  children,
}: {
  heading: string;
  intro?: string | null;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-14 pt-32 sm:pt-40 md:pb-20">
      <div aria-hidden className="dot-grid dot-grid-fade absolute inset-0" />
      <div aria-hidden className="absolute -top-40 right-[-10%] h-[28rem] w-[40rem] rounded-full bg-build/10 blur-[120px]" />
      <div className="container-page relative">
        {crumbs?.length ? <Breadcrumbs items={crumbs} className="mb-10" /> : null}
        <Reveal>
          <h1 className="type-h1 max-w-4xl">{heading}</h1>
          {intro ? <p className="type-lead mt-6 max-w-2xl">{intro}</p> : null}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
