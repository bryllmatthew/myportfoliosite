import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CaseStudyEditor } from "@/components/admin/case-study-editor";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/admin";
import { adminGetCaseStudy, adminServiceOptions, adminTaxonomies } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Edit case study" };

export default async function EditCaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [caseStudy, services, tax] = await Promise.all([adminGetCaseStudy(ctx, id), adminServiceOptions(ctx), adminTaxonomies(ctx)]);
  if (!caseStudy) notFound();

  return (
    <>
      <AdminPageHeader
        title={caseStudy.title}
        crumbs={[{ label: "Case studies", href: "/admin/case-studies" }]}
        actions={
          caseStudy.status === "published" ? (
            <ButtonLink href={`/case-studies/${caseStudy.slug}`} variant="secondary" size="sm" external>
              <ExternalLink aria-hidden />
              View live page
            </ButtonLink>
          ) : null
        }
      />
      <CaseStudyEditor
        key={caseStudy.updated_at}
        caseStudy={caseStudy}
        options={{ services, platforms: tax.platforms, categories: tax.caseCategories }}
      />
    </>
  );
}
