"use server";

import { z } from "zod";
import { nullable, toLines } from "@/lib/validations/common";
import {
  contactSettingsSchema,
  homeConfigSchemas,
  homeSectionBaseSchema,
  inquiryStatusSchema,
  mediaRecordSchema,
  navItemSchema,
  pageSettingsSchema,
  profileSchema,
  siteSettingsSchema,
  socialLinkSchema,
  taxonomySchema,
  testimonialSchema,
  brandSchema,
  type HomeConfigKey,
} from "@/lib/validations/content";
import { audit } from "@/lib/utils/audit";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { dbFailure, invalid, isUuid, revalidatePublic, runAdmin } from "@/lib/actions/helpers";
import type { ActionResult, MediaLibraryItem, PageKey } from "@/types/content";

// =============================================================================
// Singletons
// =============================================================================
export async function saveSiteSettings(input: unknown): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    const parsed = siteSettingsSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const v = parsed.data;
    const { error } = await ctx.supabase.from("site_settings").upsert(
      {
        singleton: true,
        site_name: v.site_name,
        site_description: v.site_description,
        default_seo_title: v.default_seo_title,
        default_seo_description: v.default_seo_description,
        default_og_image: nullable(v.default_og_image),
        primary_cta_label: v.primary_cta_label,
        primary_cta_url: v.primary_cta_url,
        footer_text: v.footer_text,
        twitter_handle: nullable(v.twitter_handle.replace(/^@/, "")),
      },
      { onConflict: "singleton" },
    );
    if (error) return dbFailure(error, "site settings");
    await audit(ctx, "update", "site_settings", null);
    revalidatePublic();
    return { ok: true, data: undefined, message: "Settings saved" };
  });
}

export async function saveProfile(input: unknown): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const v = parsed.data;
    const { error } = await ctx.supabase.from("profiles").upsert(
      {
        singleton: true,
        display_name: v.display_name,
        headline: v.headline,
        short_bio: v.short_bio,
        long_bio: v.long_bio,
        avatar_url: nullable(v.avatar_url),
        resume_url: nullable(v.resume_url),
        location_label: nullable(v.location_label),
        availability_label: nullable(v.availability_label),
        is_available: v.is_available,
        email_public: nullable(v.email_public),
        phone_public: nullable(v.phone_public),
        skills: toLines(v.skills),
        stack_groups: v.stack_groups.map((g) => ({ category: g.category, items: toLines(g.items) })),
        experience: v.experience,
      },
      { onConflict: "singleton" },
    );
    if (error) return dbFailure(error, "the profile");
    await audit(ctx, "update", "profile", null);
    revalidatePublic();
    return { ok: true, data: undefined, message: "Profile saved" };
  });
}

export async function saveContactSettings(input: unknown): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    const parsed = contactSettingsSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const v = parsed.data;
    const { error } = await ctx.supabase.from("contact_settings").upsert(
      {
        singleton: true,
        primary_email: v.primary_email,
        phone: nullable(v.phone),
        location_label: nullable(v.location_label),
        calendar_url: nullable(v.calendar_url),
        contact_intro: v.contact_intro,
        response_time_text: nullable(v.response_time_text),
        show_budget: v.show_budget,
        budget_ranges: toLines(v.budget_ranges),
      },
      { onConflict: "singleton" },
    );
    if (error) return dbFailure(error, "contact settings");
    await audit(ctx, "update", "contact_settings", null);
    revalidatePublic();
    return { ok: true, data: undefined, message: "Contact details saved" };
  });
}

const PAGE_KEYS: PageKey[] = ["home", "services", "work", "case_studies", "about", "contact"];

export async function savePageSettings(key: string, input: unknown): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    if (!PAGE_KEYS.includes(key as PageKey)) return { ok: false, error: "Unknown page." };
    const parsed = pageSettingsSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const v = parsed.data;
    const { error } = await ctx.supabase.from("page_settings").upsert(
      {
        page_key: key,
        heading: nullable(v.heading),
        intro: nullable(v.intro),
        seo_title: nullable(v.seo_title),
        seo_description: nullable(v.seo_description),
        og_image_url: nullable(v.og_image_url),
      },
      { onConflict: "page_key" },
    );
    if (error) return dbFailure(error, "page settings");
    await audit(ctx, "update", "page_settings", null, { page: key });
    revalidatePublic();
    return { ok: true, data: undefined, message: "Page saved" };
  });
}

// =============================================================================
// Homepage modules
// =============================================================================
export async function saveHomeSection(key: string, baseInput: unknown, configInput: unknown): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    if (!(key in homeConfigSchemas)) return { ok: false, error: "Unknown section." };
    const base = homeSectionBaseSchema.safeParse(baseInput);
    if (!base.success) return invalid(base.error);
    const config = homeConfigSchemas[key as HomeConfigKey].safeParse(configInput);
    if (!config.success) return invalid(config.error);

    const { error } = await ctx.supabase.from("home_sections").upsert(
      {
        section_key: key,
        eyebrow: nullable(base.data.eyebrow),
        heading: nullable(base.data.heading),
        description: nullable(base.data.description),
        is_visible: base.data.is_visible,
        config: config.data,
      },
      { onConflict: "section_key" },
    );
    if (error) return dbFailure(error, "the section");
    await audit(ctx, "update", "home_section", null, { section: key });
    revalidatePublic();
    return { ok: true, data: undefined, message: "Section saved" };
  });
}

export async function setHomeSectionVisibility(key: string, visible: boolean): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    if (!(key in homeConfigSchemas)) return { ok: false, error: "Unknown section." };
    const { error } = await ctx.supabase.from("home_sections").update({ is_visible: Boolean(visible) }).eq("section_key", key);
    if (error) return dbFailure(error, "the section");
    await audit(ctx, "update", "home_section", null, { section: key, visible });
    revalidatePublic();
    return { ok: true, data: undefined, message: visible ? "Section shown" : "Section hidden" };
  });
}

export async function reorderHomeSections(keys: string[]): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    const valid = keys.filter((k) => k in homeConfigSchemas);
    const results = await Promise.all(
      valid.map((k, i) => ctx.supabase.from("home_sections").update({ sort_order: i + 1 }).eq("section_key", k)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) return dbFailure(failed.error, "the new order");
    await audit(ctx, "update", "home_section", null, { order: valid });
    revalidatePublic();
    return { ok: true, data: undefined, message: "Order saved" };
  });
}

// =============================================================================
// Simple collections: testimonials, navigation, social links
// =============================================================================
const COLLECTIONS = {
  testimonials: { schema: testimonialSchema, entity: "testimonial" },
  brands: { schema: brandSchema, entity: "brand" },
  navigation_items: { schema: navItemSchema, entity: "navigation_item" },
  social_links: { schema: socialLinkSchema, entity: "social_link" },
} as const;
type CollectionTable = keyof typeof COLLECTIONS;

function toRow(table: CollectionTable, data: Record<string, unknown>) {
  if (table === "brands") {
    return { ...data, logo_url: nullable(data.logo_url as string), website_url: nullable(data.website_url as string) };
  }
  if (table === "testimonials") {
    return {
      ...data,
      role: nullable(data.role as string),
      company: nullable(data.company as string),
      avatar_url: nullable(data.avatar_url as string),
    };
  }
  return data;
}

export async function saveCollectionItem(
  table: CollectionTable,
  id: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return runAdmin(async (ctx) => {
    const def = COLLECTIONS[table];
    if (!def) return { ok: false, error: "Unknown collection." };
    const parsed = def.schema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    if (id && !isUuid(id)) return { ok: false, error: "Invalid item." };
    const row = toRow(table, parsed.data as Record<string, unknown>);
    const res = id
      ? await ctx.supabase.from(table).update(row).eq("id", id).select("id").single()
      : await ctx.supabase.from(table).insert(row).select("id").single();
    if (res.error) return dbFailure(res.error, "the item");
    await audit(ctx, id ? "update" : "create", def.entity, res.data.id);
    revalidatePublic();
    return { ok: true, data: { id: res.data.id as string }, message: id ? "Saved" : "Added" };
  });
}

export async function deleteCollectionItem(table: CollectionTable, id: string): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    const def = COLLECTIONS[table];
    if (!def || !isUuid(id)) return { ok: false, error: "Invalid item." };
    const { error } = await ctx.supabase.from(table).delete().eq("id", id);
    if (error) return dbFailure(error, "the deletion");
    await audit(ctx, "delete", def.entity, id);
    revalidatePublic();
    return { ok: true, data: undefined, message: "Deleted" };
  });
}

export async function reorderCollection(table: CollectionTable, ids: string[]): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    if (!COLLECTIONS[table]) return { ok: false, error: "Unknown collection." };
    const valid = ids.filter(isUuid).slice(0, 200);
    const results = await Promise.all(valid.map((id, i) => ctx.supabase.from(table).update({ sort_order: i + 1 }).eq("id", id)));
    const failed = results.find((r) => r.error);
    if (failed?.error) return dbFailure(failed.error, "the new order");
    revalidatePublic();
    return { ok: true, data: undefined, message: "Order saved" };
  });
}

// =============================================================================
// Taxonomies
// =============================================================================
const TAXONOMIES = ["project_categories", "technologies", "ad_platforms", "case_study_categories"] as const;
type TaxonomyTable = (typeof TAXONOMIES)[number];

export async function saveTaxonomy(table: TaxonomyTable, id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAdmin(async (ctx) => {
    if (!TAXONOMIES.includes(table)) return { ok: false, error: "Unknown list." };
    const parsed = taxonomySchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    if (id && !isUuid(id)) return { ok: false, error: "Invalid item." };
    const res = id
      ? await ctx.supabase.from(table).update(parsed.data).eq("id", id).select("id").single()
      : await ctx.supabase.from(table).insert(parsed.data).select("id").single();
    if (res.error) return dbFailure(res.error, "the item");
    await audit(ctx, id ? "update" : "create", table, res.data.id, { name: parsed.data.name });
    revalidatePublic();
    return { ok: true, data: { id: res.data.id as string }, message: id ? "Saved" : "Added" };
  });
}

export async function deleteTaxonomy(table: TaxonomyTable, id: string): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    if (!TAXONOMIES.includes(table) || !isUuid(id)) return { ok: false, error: "Invalid item." };
    const { error } = await ctx.supabase.from(table).delete().eq("id", id);
    if (error) return dbFailure(error, "the deletion");
    await audit(ctx, "delete", table, id);
    revalidatePublic();
    return { ok: true, data: undefined, message: "Deleted. It was removed from any items that used it." };
  });
}

// =============================================================================
// Cache
// =============================================================================
/** For content changed outside the admin (e.g. SQL run in the Supabase dashboard). */
export async function refreshPublicSite(): Promise<ActionResult> {
  return runAdmin(async () => {
    revalidatePublic();
    return { ok: true, data: undefined, message: "The live site now shows the latest content" };
  });
}

// =============================================================================
// Inquiries
// =============================================================================
export async function setInquiryStatus(id: string, status: unknown): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    const parsed = inquiryStatusSchema.safeParse(status);
    if (!parsed.success || !isUuid(id)) return { ok: false, error: "Invalid status." };
    const { error } = await ctx.supabase.from("inquiries").update({ status: parsed.data }).eq("id", id);
    if (error) return dbFailure(error, "the inquiry");
    await audit(ctx, "status_change", "inquiry", id, { status: parsed.data });
    return { ok: true, data: undefined, message: `Marked as ${parsed.data}` };
  });
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    if (!isUuid(id)) return { ok: false, error: "Invalid inquiry." };
    const { error } = await ctx.supabase.from("inquiries").delete().eq("id", id);
    if (error) return dbFailure(error, "the deletion");
    await audit(ctx, "delete", "inquiry", id);
    return { ok: true, data: undefined, message: "Inquiry deleted" };
  });
}

// =============================================================================
// Media library
// =============================================================================
/** Records a file the browser uploaded directly to Storage (with the admin's session). */
export async function recordMedia(input: unknown): Promise<ActionResult<MediaLibraryItem>> {
  return runAdmin(async (ctx) => {
    const parsed = mediaRecordSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const v = parsed.data;
    // The object must really exist in our bucket before it is recorded.
    const folder = v.storage_path.split("/").slice(0, -1).join("/");
    const name = v.storage_path.split("/").pop() ?? "";
    const { data: listing, error: listError } = await ctx.supabase.storage.from(MEDIA_BUCKET).list(folder, { search: name, limit: 1 });
    if (listError || !listing?.some((o) => o.name === name)) {
      return { ok: false, error: "The upload could not be verified. Try uploading again." };
    }
    const public_url = ctx.supabase.storage.from(MEDIA_BUCKET).getPublicUrl(v.storage_path).data.publicUrl;
    const { data, error } = await ctx.supabase
      .from("media_library")
      .insert({ ...v, alt_text: nullable(v.alt_text), public_url, uploaded_by: ctx.userId })
      .select("*")
      .single();
    if (error) return dbFailure(error, "the upload");
    await audit(ctx, "upload", "media", data.id, { file: v.file_name });
    return { ok: true, data: data as MediaLibraryItem, message: "Uploaded" };
  });
}

export async function updateMediaAlt(id: string, alt: unknown): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    const parsed = z.string().trim().max(300).safeParse(alt);
    if (!parsed.success || !isUuid(id)) return { ok: false, error: "Keep alt text under 300 characters." };
    const { error } = await ctx.supabase.from("media_library").update({ alt_text: nullable(parsed.data) }).eq("id", id);
    if (error) return dbFailure(error, "the alt text");
    return { ok: true, data: undefined, message: "Alt text saved" };
  });
}

/** Columns that may hold a media URL. Used to stop deleting files that are still in use. */
const URL_REFERENCES: { table: string; columns: string[]; label: string }[] = [
  { table: "services", columns: ["hero_media_url", "og_image_url"], label: "Service" },
  { table: "projects", columns: ["cover_image_url", "hero_media_url", "og_image_url"], label: "Project" },
  { table: "project_media", columns: ["url", "thumbnail_url"], label: "Project gallery" },
  { table: "case_studies", columns: ["cover_image_url", "hero_media_url", "og_image_url"], label: "Case study" },
  { table: "case_study_media", columns: ["url", "thumbnail_url"], label: "Case study gallery" },
  { table: "testimonials", columns: ["avatar_url"], label: "Testimonial" },
  { table: "brands", columns: ["logo_url"], label: "Brand" },
  { table: "profiles", columns: ["avatar_url", "resume_url"], label: "Profile" },
  { table: "site_settings", columns: ["default_og_image"], label: "Site settings" },
  { table: "page_settings", columns: ["og_image_url"], label: "Page SEO" },
];

export async function listMedia(search?: string): Promise<ActionResult<MediaLibraryItem[]>> {
  return runAdmin(async (ctx) => {
    let q = ctx.supabase.from("media_library").select("*").order("created_at", { ascending: false }).limit(120);
    const term = search?.trim().replace(/[%_,()]/g, "");
    if (term) q = q.or(`file_name.ilike.%${term}%,alt_text.ilike.%${term}%`);
    const { data, error } = await q;
    if (error) return dbFailure(error, "the media library");
    return { ok: true, data: (data ?? []) as MediaLibraryItem[] };
  });
}

export async function deleteMedia(id: string, force = false): Promise<ActionResult<{ usedBy?: string[] }>> {
  return runAdmin(async (ctx) => {
    if (!isUuid(id)) return { ok: false, error: "Invalid file." };
    const { data: item } = await ctx.supabase.from("media_library").select("*").eq("id", id).maybeSingle();
    if (!item) return { ok: false, error: "This file was already deleted." };

    if (!force) {
      const usedBy: string[] = [];
      await Promise.all(
        URL_REFERENCES.map(async (ref) => {
          const { count } = await ctx.supabase
            .from(ref.table)
            .select("*", { count: "exact", head: true })
            .or(ref.columns.map((c) => `${c}.eq."${item.public_url}"`).join(","));
          if (count) usedBy.push(`${ref.label} (${count})`);
        }),
      );
      if (usedBy.length) {
        return {
          ok: false,
          error: `This file is still used by: ${usedBy.join(", ")}. Replace it there first, or delete anyway.`,
        };
      }
    }

    const { error: storageError } = await ctx.supabase.storage.from(MEDIA_BUCKET).remove([item.storage_path]);
    if (storageError) return { ok: false, error: "The file could not be removed from storage. Try again." };
    const { error } = await ctx.supabase.from("media_library").delete().eq("id", id);
    if (error) return dbFailure(error, "the deletion");
    await audit(ctx, "delete", "media", id, { file: item.file_name });
    return { ok: true, data: {}, message: "File deleted" };
  });
}
