import "server-only";
import type { Metadata } from "next";
import { getPageSettings, getSiteSettings } from "@/lib/queries/public";
import { absoluteUrl } from "@/lib/utils/site-url";
import type { PageKey } from "@/types/content";

interface BuildMetadataInput {
  title?: string | null;
  description?: string | null;
  path: string;
  image?: string | null;
  type?: "website" | "article" | "profile";
  /** Set for drafts in preview mode. */
  noIndex?: boolean;
}

/** Page metadata with canonical URL, Open Graph and Twitter cards, falling back to site defaults. */
export async function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex,
}: BuildMetadataInput): Promise<Metadata> {
  const site = await getSiteSettings();
  const siteName = site?.site_name || "Portfolio";
  const finalDescription = description || site?.default_seo_description || site?.site_description || undefined;
  const ogImage = image || site?.default_og_image || undefined;
  const canonical = absoluteUrl(path);
  const fullTitle = title ? `${title} | ${siteName}` : site?.default_seo_title || siteName;

  return {
    title: { absolute: fullTitle },
    description: finalDescription,
    alternates: { canonical },
    openGraph: {
      type,
      url: canonical,
      siteName,
      title: fullTitle,
      description: finalDescription,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: fullTitle,
      description: finalDescription,
      images: ogImage ? [ogImage] : undefined,
      creator: site?.twitter_handle ? `@${site.twitter_handle.replace(/^@/, "")}` : undefined,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

/** Metadata for a static page using its CMS-managed SEO fields. */
export async function buildPageMetadata(key: PageKey, path: string, fallbackTitle?: string): Promise<Metadata> {
  const page = await getPageSettings(key);
  return buildMetadata({
    title: page?.seo_title || page?.heading || fallbackTitle || null,
    description: page?.seo_description || page?.intro || null,
    image: page?.og_image_url,
    path,
  });
}
