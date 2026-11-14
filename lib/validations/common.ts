import { z } from "zod";

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const text = (max: number) =>
  z.string().trim().max(max, { message: `Keep this under ${max.toLocaleString()} characters.` });

export const requiredText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, { message: `${label} is required.` })
    .max(max, { message: `Keep this under ${max.toLocaleString()} characters.` });

export const slugField = z
  .string()
  .trim()
  .min(1, { message: "Slug is required." })
  .max(120, { message: "Keep the slug under 120 characters." })
  .regex(SLUG_PATTERN, { message: "Use lowercase letters, numbers and single hyphens, e.g. my-project." });

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Absolute http(s) URL or empty string. Rejects javascript:, data:, etc. */
export const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || isHttpUrl(v), { message: "Enter a full URL starting with https://" });

export const requiredUrl = z
  .string()
  .trim()
  .min(1, { message: "URL is required." })
  .max(2000)
  .refine(isHttpUrl, { message: "Enter a full URL starting with https://" });

/** Link targets for CTAs/navigation: site paths, http(s), mailto: or tel:. */
export function isSafeLink(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
  if (value.startsWith("#")) return true;
  if (/^mailto:[^\s@]+@[^\s@]+$/i.test(value)) return true;
  if (/^tel:\+?[\d\s()-]{5,}$/i.test(value)) return true;
  return isHttpUrl(value);
}

export const linkField = z
  .string()
  .trim()
  .min(1, { message: "Link is required." })
  .max(500)
  .refine(isSafeLink, { message: "Use a site path like /contact, a full https:// URL, mailto: or tel:." });

export const optionalLink = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || isSafeLink(v), {
    message: "Use a site path like /contact, a full https:// URL, mailto: or tel:.",
  });

export const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: "Enter a valid email address." });

export const optionalDate = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), { message: "Use a valid date." });

export const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
  message: "Invalid reference.",
});

export const sortOrder = z
  .number({ message: "Enter a number." })
  .int({ message: "Use a whole number." })
  .min(0, { message: "Use 0 or higher." })
  .max(100000);

/** Newline-separated list edited in a textarea. */
export const linesField = (maxItems = 30, maxLength = 300) =>
  z
    .string()
    .max(maxItems * (maxLength + 1))
    .refine((v) => toLines(v).length <= maxItems, { message: `Use at most ${maxItems} lines.` })
    .refine((v) => toLines(v).every((l) => l.length <= maxLength), {
      message: `Keep each line under ${maxLength} characters.`,
    });

export function toLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export const statusField = z.enum(["draft", "published", "archived"]);
export const displayModeField = z.enum(["public", "anonymized", "hidden"]);

/** What the admin asked for when saving: keep status, or move it. */
export const saveIntent = z.enum(["save", "draft", "publish", "archive"]);
export type SaveIntent = z.infer<typeof saveIntent>;

export const seoFields = {
  seo_title: text(120),
  seo_description: text(320),
  og_image_url: optionalUrl,
};

/** "" -> null for optional DB columns. */
export function nullable(value: string | null | undefined): string | null {
  if (value == null) return null;
  const v = value.trim();
  return v === "" ? null : v;
}
