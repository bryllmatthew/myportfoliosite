import type { Metadata } from "next";
import { LineChart, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ContentTable, StatusTabs, countByStatus } from "@/components/admin/content-table";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth/admin";
import { adminListCaseStudies } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Case studies" };

export default async function AdminCaseStudiesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const ctx = await requireAdmin();
  const { status } = await searchParams;
  const all = await adminListCaseStudies(ctx);
  const filtered = status ? all.filter((c) => c.status === status) : all;

  return (
    <>
      <AdminPageHeader
        title="Advertising case studies"
        description="Campaign write-ups with metrics. Only publish results you can verify."
        actions={
          <ButtonLink href="/admin/case-studies/new">
            <Plus aria-hidden />
            New case study
          </ButtonLink>
        }
      />
      {all.length ? (
        <>
          <StatusTabs basePath="/admin/case-studies" current={status ?? null} counts={countByStatus(all)} />
          {filtered.length ? (
            <ContentTable
              metaLabel="Platforms"
              rows={filtered.map((c) => ({
                id: c.id,
                title: c.title,
                href: `/admin/case-studies/${c.id}`,
                status: c.status,
                is_featured: c.is_featured,
                updated_at: c.updated_at,
                meta: c.platforms.map((p) => p.name).join(", ") || "None",
              }))}
            />
          ) : (
            <EmptyState title="Nothing here" description="No case studies have this status." />
          )}
        </>
      ) : (
        <EmptyState
          icon={<LineChart />}
          title="No case studies yet"
          description="Add a campaign with its objective, platforms, timeframe and verified metrics."
          action={<ButtonLink href="/admin/case-studies/new">Create a case study</ButtonLink>}
        />
      )}
    </>
  );
}
