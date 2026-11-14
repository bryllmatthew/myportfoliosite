import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProjectEditor } from "@/components/admin/project-editor";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/admin";
import { adminGetProject, adminServiceOptions, adminTaxonomies } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [project, services, tax] = await Promise.all([adminGetProject(ctx, id), adminServiceOptions(ctx), adminTaxonomies(ctx)]);
  if (!project) notFound();

  return (
    <>
      <AdminPageHeader
        title={project.title}
        crumbs={[{ label: "Projects", href: "/admin/projects" }]}
        actions={
          project.status === "published" ? (
            <ButtonLink href={`/work/${project.slug}`} variant="secondary" size="sm" external>
              <ExternalLink aria-hidden />
              View live page
            </ButtonLink>
          ) : null
        }
      />
      <ProjectEditor
        key={project.updated_at}
        project={project}
        options={{ services, categories: tax.categories, technologies: tax.technologies }}
      />
    </>
  );
}
