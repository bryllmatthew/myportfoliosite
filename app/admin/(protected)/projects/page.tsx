import type { Metadata } from "next";
import { Briefcase, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ContentTable, StatusTabs, countByStatus } from "@/components/admin/content-table";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth/admin";
import { adminListProjects } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Projects" };

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const ctx = await requireAdmin();
  const { status } = await searchParams;
  const all = await adminListProjects(ctx);
  const filtered = status ? all.filter((p) => p.status === status) : all;

  return (
    <>
      <AdminPageHeader
        title="Projects"
        description="General portfolio work: software, automation, marketing and creative. Advertising results go in Case studies."
        actions={
          <ButtonLink href="/admin/projects/new">
            <Plus aria-hidden />
            New project
          </ButtonLink>
        }
      />
      {all.length ? (
        <>
          <StatusTabs basePath="/admin/projects" current={status ?? null} counts={countByStatus(all)} />
          {filtered.length ? (
            <ContentTable
              metaLabel="Categories"
              rows={filtered.map((p) => ({
                id: p.id,
                title: p.title,
                href: `/admin/projects/${p.id}`,
                status: p.status,
                is_featured: p.is_featured,
                updated_at: p.updated_at,
                meta: p.categories.map((c) => c.name).join(", ") || "None",
              }))}
            />
          ) : (
            <EmptyState title="Nothing here" description="No projects have this status." />
          )}
        </>
      ) : (
        <EmptyState
          icon={<Briefcase />}
          title="No projects yet"
          description="Add your first project with a cover image, the story behind it, and a gallery."
          action={<ButtonLink href="/admin/projects/new">Create a project</ButtonLink>}
        />
      )}
    </>
  );
}
