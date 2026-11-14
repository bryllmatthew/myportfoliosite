import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProjectEditor } from "@/components/admin/project-editor";
import { requireAdmin } from "@/lib/auth/admin";
import { adminServiceOptions, adminTaxonomies } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const ctx = await requireAdmin();
  const [services, tax] = await Promise.all([adminServiceOptions(ctx), adminTaxonomies(ctx)]);
  return (
    <>
      <AdminPageHeader title="New project" crumbs={[{ label: "Projects", href: "/admin/projects" }]} />
      <ProjectEditor project={null} options={{ services, categories: tax.categories, technologies: tax.technologies }} />
    </>
  );
}
