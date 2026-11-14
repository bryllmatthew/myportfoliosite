import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PageSeoForm, SeoDefaultsForm } from "@/components/admin/site-settings-forms";
import { requireAdmin } from "@/lib/auth/admin";
import { adminPageSettings, adminSiteSettings } from "@/lib/queries/admin";
import { getSiteUrl } from "@/lib/utils/site-url";
import type { PageKey } from "@/types/content";

export const metadata: Metadata = { title: "SEO" };

const PAGE_KEYS: PageKey[] = ["home", "services", "work", "case_studies", "about", "contact"];

export default async function SeoPage() {
  const ctx = await requireAdmin();
  const [site, pages] = await Promise.all([adminSiteSettings(ctx), adminPageSettings(ctx)]);
  const siteUrl = getSiteUrl();
  const siteName = site?.site_name || "Portfolio";

  return (
    <>
      <AdminPageHeader
        title="SEO"
        description="How your pages appear in search results and when shared. Services, projects and case studies have their own SEO fields in their editors."
      />
      <div className="flex flex-col gap-8">
        <SeoDefaultsForm site={site} siteUrl={siteUrl} />
        <section aria-labelledby="pages-seo" className="flex flex-col gap-3">
          <h2 id="pages-seo" className="font-display text-lg font-semibold">
            Pages
          </h2>
          {PAGE_KEYS.map((key) => {
            const page = pages.find((p) => p.page_key === key) ?? null;
            return <PageSeoForm key={`${key}:${page?.updated_at ?? ""}`} pageKey={key} page={page} siteName={siteName} siteUrl={siteUrl} />;
          })}
        </section>
      </div>
    </>
  );
}
