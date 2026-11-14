import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CaseStudyEditor } from "@/components/admin/case-study-editor";
import { requireAdmin } from "@/lib/auth/admin";
import { adminServiceOptions, adminTaxonomies } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "New case study" };

export default async function NewCaseStudyPage() {
  const ctx = await requireAdmin();
  const [services, tax] = await Promise.all([adminServiceOptions(ctx), adminTaxonomies(ctx)]);
  return (
    <>
      <AdminPageHeader title="New case study" crumbs={[{ label: "Case studies", href: "/admin/case-studies" }]} />
      <CaseStudyEditor caseStudy={null} options={{ services, platforms: tax.platforms, categories: tax.caseCategories }} />
    </>
  );
}
