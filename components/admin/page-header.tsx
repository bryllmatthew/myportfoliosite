import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export function AdminPageHeader({
  title,
  description,
  actions,
  crumbs,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  crumbs?: { label: string; href: string }[];
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {crumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
              {crumbs.map((c) => (
                <li key={c.href} className="inline-flex items-center gap-1">
                  <Link href={c.href} className="hover:text-paper">
                    {c.label}
                  </Link>
                  <ChevronRight className="size-3.5 text-subtle" aria-hidden />
                </li>
              ))}
              <li aria-current="page" className="max-w-[18rem] truncate text-paper">
                {title}
              </li>
            </ol>
          </nav>
        ) : null}
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

/** A titled group of fields inside an editor. */
export function FormSection({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section aria-labelledby={id ? `${id}-title` : undefined} className="rounded-[var(--radius-card)] border border-line bg-surface/40 p-5 sm:p-6">
      <div className="mb-5">
        <h2 id={id ? `${id}-title` : undefined} className="font-display text-lg font-semibold">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
