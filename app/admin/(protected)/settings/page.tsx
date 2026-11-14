import type { Metadata } from "next";
import { AdminPageHeader, FormSection } from "@/components/admin/page-header";
import { RefreshSiteButton } from "@/components/admin/refresh-site-button";
import { BrandSettingsForm } from "@/components/admin/site-settings-forms";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { adminSiteSettings, adminTaxonomies } from "@/lib/queries/admin";
import type { Taxonomy } from "@/types/content";

export const metadata: Metadata = { title: "Settings" };

const keyOf = (items: Taxonomy[]) => items.map((i) => `${i.id}:${i.name}:${i.slug}`).join("|");

export default async function SettingsPage() {
  const ctx = await requireAdmin();
  const [site, tax] = await Promise.all([adminSiteSettings(ctx), adminTaxonomies(ctx)]);

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Site name, the main call to action, and the lists used to tag projects and case studies."
        actions={<RefreshSiteButton />}
      />
      <div className="flex flex-col gap-8">
        <BrandSettingsForm key={site?.updated_at ?? "new"} site={site} />

        <h2 className="mt-4 font-display text-xl font-semibold">Lists and tags</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <FormSection title="Project categories" description="Used for the filters on the My Work page.">
            <TaxonomyManager
              key={keyOf(tax.categories)}
              table="project_categories"
              singular="category"
              items={tax.categories}
              usageNote="Projects themselves are not deleted."
            />
          </FormSection>
          <FormSection title="Technologies and tools" description="Listed on project pages.">
            <TaxonomyManager
              key={keyOf(tax.technologies)}
              table="technologies"
              singular="technology"
              items={tax.technologies}
              usageNote="Projects themselves are not deleted."
            />
          </FormSection>
          <FormSection title="Ad platforms" description="Used for case study filters and context, for example Meta Ads or TikTok Ads.">
            <TaxonomyManager
              key={keyOf(tax.platforms)}
              table="ad_platforms"
              singular="platform"
              items={tax.platforms}
              usageNote="Case studies themselves are not deleted."
            />
          </FormSection>
          <FormSection title="Case study types" description="For example e-commerce, lead generation or awareness.">
            <TaxonomyManager
              key={keyOf(tax.caseCategories)}
              table="case_study_categories"
              singular="type"
              items={tax.caseCategories}
              usageNote="Case studies themselves are not deleted."
            />
          </FormSection>
        </div>
      </div>
    </>
  );
}
