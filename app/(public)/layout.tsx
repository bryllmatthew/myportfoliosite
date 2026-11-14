import { draftMode } from "next/headers";
import { Header, type HeaderNavItem } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { PreviewBanner } from "@/components/public/preview-banner";
import { MouseGlow } from "@/components/motion/mouse-glow";
import { AnalyticsListener } from "@/components/analytics/analytics";
import {
  getContactSettings,
  getNavigation,
  getProfile,
  getSiteSettings,
  getSocialLinks,
} from "@/lib/queries/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Used only before Supabase is connected, so a fresh clone still has working navigation. */
const FALLBACK_NAV: HeaderNavItem[] = [
  { label: "Home", url: "/", is_external: false },
  { label: "Services", url: "/services", is_external: false },
  { label: "My Work", url: "/work", is_external: false },
  { label: "Advertising Case Studies", url: "/case-studies", is_external: false },
  { label: "Contact", url: "/contact", is_external: false },
];

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [site, profile, contact, headerNav, footerNav, social, draft] = await Promise.all([
    getSiteSettings(),
    getProfile(),
    getContactSettings(),
    getNavigation("header"),
    getNavigation("footer"),
    getSocialLinks(),
    draftMode(),
  ]);

  const headerItems = isSupabaseConfigured ? headerNav : FALLBACK_NAV;
  const footerItems = isSupabaseConfigured ? footerNav : FALLBACK_NAV;
  const siteName = site?.site_name || profile?.display_name || "Portfolio";
  const cta = site?.primary_cta_label
    ? { label: site.primary_cta_label, url: site.primary_cta_url || "/contact" }
    : { label: "Start a project", url: "/contact" };

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-signal px-4 py-2 font-medium text-signal-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <MouseGlow />
      <AnalyticsListener />
      {draft.isEnabled ? <PreviewBanner /> : null}
      <Header siteName={siteName} items={headerItems} cta={cta} />
      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        {children}
      </main>
      <Footer site={site} profile={profile} contact={contact} items={footerItems} social={social} />
    </>
  );
}
