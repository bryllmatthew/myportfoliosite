import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { getSiteSettings } from "@/lib/queries/public";
import { getSiteUrl } from "@/lib/utils/site-url";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz", "wdth"],
  display: "swap",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  axes: ["wdth"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const name = site?.site_name || "Portfolio";
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: site?.default_seo_title || name, template: `%s | ${name}` },
    description: site?.default_seo_description || site?.site_description || undefined,
    applicationName: name,
    openGraph: { siteName: name, type: "website", locale: "en_US" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0c1322",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
