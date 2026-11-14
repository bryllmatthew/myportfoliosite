"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";
import { ProjectCard } from "@/components/public/cards";
import { FilterGroup, writeQuery } from "@/components/public/filter-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import type { ProjectWithRelations, Taxonomy } from "@/types/content";

interface WorkBrowserProps {
  projects: ProjectWithRelations[];
  categories: Taxonomy[];
  services: { slug: string; title: string }[];
}

export function WorkBrowser({ projects, categories, services }: WorkBrowserProps) {
  const params = useSearchParams();
  const [category, setCategory] = useState<string | null>(params.get("category"));
  const [service, setService] = useState<string | null>(params.get("service"));

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (!category || p.categories.some((c) => c.slug === category)) &&
          (!service || p.services.some((s) => s.slug === service)),
      ),
    [projects, category, service],
  );

  const categoryOptions = categories
    .map((c) => ({ value: c.slug, label: c.name, count: projects.filter((p) => p.categories.some((x) => x.id === c.id)).length }))
    .filter((o) => o.count > 0);
  const serviceOptions = services
    .map((s) => ({ value: s.slug, label: s.title, count: projects.filter((p) => p.services.some((x) => x.slug === s.slug)).length }))
    .filter((o) => o.count > 0);

  const update = (next: { category?: string | null; service?: string | null }) => {
    const c = next.category !== undefined ? next.category : category;
    const s = next.service !== undefined ? next.service : service;
    setCategory(c);
    setService(s);
    writeQuery({ category: c, service: s });
  };

  if (!projects.length) {
    return (
      <EmptyState
        icon={<FolderOpen />}
        title="New work is on the way"
        description="Projects are being written up. In the meantime, get in touch to see examples relevant to your project."
      />
    );
  }

  return (
    <div>
      {categoryOptions.length > 1 || serviceOptions.length > 1 ? (
        <div className="mb-10 flex flex-col gap-4 border-b border-line pb-8">
          {categoryOptions.length > 1 ? (
            <FilterGroup label="Category" options={categoryOptions} value={category} onChange={(v) => update({ category: v })} />
          ) : null}
          {serviceOptions.length > 1 ? (
            <FilterGroup label="Service" options={serviceOptions} value={service} onChange={(v) => update({ service: v })} />
          ) : null}
        </div>
      ) : null}

      <p className="sr-only" role="status" aria-live="polite">
        Showing {filtered.length} of {projects.length} projects
      </p>

      {filtered.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {filtered.map((p, i) => (
            <li key={p.id}>
              <ProjectCard project={p} priority={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No projects match these filters"
          description="Try another category or service."
          action={
            <Button variant="secondary" onClick={() => update({ category: null, service: null })}>
              Clear filters
            </Button>
          }
        />
      )}
    </div>
  );
}
