import type { Metadata } from "next";
import { AdminPageHeader, FormSection } from "@/components/admin/page-header";
import { NavigationList, SocialList } from "@/components/admin/navigation-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { adminListNavigation, adminListSocial } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Navigation and social" };

const keyOf = (rows: { id: string; sort_order: number; label: string; url: string; is_active: boolean }[]) =>
  rows.map((r) => `${r.id}:${r.sort_order}:${r.label}:${r.url}:${r.is_active}`).join("|");

export default async function NavigationPage() {
  const ctx = await requireAdmin();
  const [nav, social] = await Promise.all([adminListNavigation(ctx), adminListSocial(ctx)]);
  const header = nav.filter((n) => n.area === "header");
  const footer = nav.filter((n) => n.area === "footer");

  return (
    <>
      <AdminPageHeader
        title="Navigation and social"
        description="Menus in the site header and footer, and your social profiles. Use the arrows to change the order."
      />
      <div className="flex flex-col gap-6">
        <FormSection title="Header menu" description="The main navigation at the top of every page. The call-to-action button is set in Settings.">
          <NavigationList key={`h-${keyOf(header)}`} area="header" items={header} />
        </FormSection>
        <FormSection title="Footer menu" description="Links in the footer's Explore column.">
          <NavigationList key={`f-${keyOf(footer)}`} area="footer" items={footer} />
        </FormSection>
        <FormSection title="Social links" description="Shown in the footer and on the contact page, and used in structured data for search engines.">
          <SocialList key={`s-${keyOf(social)}`} items={social} />
        </FormSection>
      </div>
    </>
  );
}
