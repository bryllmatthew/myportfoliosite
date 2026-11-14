"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { LineChart } from "lucide-react";
import { CaseStudyCard } from "@/components/public/cards";
import { FilterGroup, writeQuery } from "@/components/public/filter-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import type { CaseStudyWithRelations, Taxonomy } from "@/types/content";

interface Props {
  caseStudies: CaseStudyWithRelations[];
  platforms: Taxonomy[];
  categories: Taxonomy[];
}

export function CaseStudyBrowser({ caseStudies, platforms, categories }: Props) {
  const params = useSearchParams();
  const [platform, setPlatform] = useState<string | null>(params.get("platform"));
  const [category, setCategory] = useState<string | null>(params.get("type"));

  const filtered = useMemo(
    () =>
      caseStudies.filter(
        (c) =>
          (!platform || c.platforms.some((p) => p.slug === platform)) &&
          (!category || c.categories.some((x) => x.slug === category)),
      ),
    [caseStudies, platform, category],
  );

  const platformOptions = platforms
    .map((p) => ({ value: p.slug, label: p.name, count: caseStudies.filter((c) => c.platforms.some((x) => x.id === p.id)).length }))
    .filter((o) => o.count > 0);
  const categoryOptions = categories
    .map((p) => ({ value: p.slug, label: p.name, count: caseStudies.filter((c) => c.categories.some((x) => x.id === p.id)).length }))
    .filter((o) => o.count > 0);

  const update = (next: { platform?: string | null; category?: string | null }) => {
    const p = next.platform !== undefined ? next.platform : platform;
    const c = next.category !== undefined ? next.category : category;
    setPlatform(p);
    setCategory(c);
    writeQuery({ platform: p, type: c });
  };

  if (!caseStudies.length) {
    return (
      <EmptyState
        icon={<LineChart />}
        title="Case studies are being prepared"
        description="Campaign write-ups are added once results are verified. Ask about relevant campaigns on a call."
      />
    );
  }

  return (
    <div>
      {platformOptions.length > 1 || categoryOptions.length > 1 ? (
        <div className="mb-10 flex flex-col gap-4 border-b border-line pb-8">
          {platformOptions.length > 1 ? (
            <FilterGroup label="Platform" options={platformOptions} value={platform} onChange={(v) => update({ platform: v })} />
          ) : null}
          {categoryOptions.length > 1 ? (
            <FilterGroup label="Type" options={categoryOptions} value={category} onChange={(v) => update({ category: v })} />
          ) : null}
        </div>
      ) : null}

      <p className="sr-only" role="status" aria-live="polite">
        Showing {filtered.length} of {caseStudies.length} case studies
      </p>

      {filtered.length ? (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {filtered.map((c) => (
            <li key={c.id}>
              <CaseStudyCard caseStudy={c} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No case studies match these filters"
          description="Try another platform or campaign type."
          action={
            <Button variant="secondary" onClick={() => update({ platform: null, category: null })}>
              Clear filters
            </Button>
          }
        />
      )}
    </div>
  );
}
