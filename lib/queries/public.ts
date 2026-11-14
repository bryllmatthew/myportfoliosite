import "server-only";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicClient } from "@/lib/supabase/public";
import { getAdminContext } from "@/lib/auth/admin";
import type {
  Brand,
  CaseStudyWithRelations,
  ContactSettings,
  HomeSection,
  NavArea,
  NavigationItem,
  PageKey,
  PageSettings,
  Profile,
  ProjectWithRelations,
  Service,
  ServiceWithChildren,
  SiteSettings,
  SocialLink,
  Taxonomy,
  Testimonial,
} from "@/types/content";
import { CASE_STUDY_SELECT, PROJECT_SELECT, SERVICE_SELECT, mapCaseStudy, mapProject, mapService } from "./mappers";

/**
 * Public read layer.
 *
 * Every function returns safe defaults (null / []) when Supabase is not
 * configured or a query fails, so pages render empty states instead of crashing.
 * Errors are logged without row content.
 */

function logError(scope: string, error: { code?: string; message?: string } | null) {
  if (error) console.error(`[queries] ${scope}: ${error.code ?? ""} ${error.message ?? ""}`.trim());
}

/**
 * Preview reads use the signed-in admin's session so drafts are visible.
 * Anyone else falls back to the anonymous client and sees only published rows.
 */
async function readClient(preview: boolean): Promise<SupabaseClient | null> {
  if (preview) {
    const ctx = await getAdminContext();
    if (ctx) return ctx.supabase;
  }
  return getPublicClient();
}

// ---------------------------------------------------------------------------
// Singletons & configuration
// ---------------------------------------------------------------------------
export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const db = getPublicClient();
  if (!db) return null;
  const { data, error } = await db.from("site_settings").select("*").maybeSingle();
  logError("site_settings", error);
  return (data as SiteSettings) ?? null;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const db = getPublicClient();
  if (!db) return null;
  const { data, error } = await db.from("profiles").select("*").maybeSingle();
  logError("profiles", error);
  if (!data) return null;
  return {
    ...(data as Profile),
    skills: data.skills ?? [],
    stack_groups: Array.isArray(data.stack_groups) ? data.stack_groups : [],
    experience: Array.isArray(data.experience) ? data.experience : [],
  };
});

export const getContactSettings = cache(async (): Promise<ContactSettings | null> => {
  const db = getPublicClient();
  if (!db) return null;
  const { data, error } = await db.from("contact_settings").select("*").maybeSingle();
  logError("contact_settings", error);
  return (data as ContactSettings) ?? null;
});

export const getNavigation = cache(async (area: NavArea): Promise<NavigationItem[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("navigation_items")
    .select("*")
    .eq("area", area)
    .eq("is_active", true)
    .order("sort_order");
  logError("navigation_items", error);
  return (data as NavigationItem[]) ?? [];
});

export const getBrands = cache(async (): Promise<Brand[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db.from("brands").select("*").eq("is_active", true).order("sort_order").order("name");
  logError("brands", error);
  return (data as Brand[]) ?? [];
});

export const getSocialLinks = cache(async (): Promise<SocialLink[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db.from("social_links").select("*").eq("is_active", true).order("sort_order");
  logError("social_links", error);
  return (data as SocialLink[]) ?? [];
});

export const getHomeSections = cache(async (): Promise<HomeSection[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db.from("home_sections").select("*").order("sort_order");
  logError("home_sections", error);
  return (data as HomeSection[]) ?? [];
});

export const getPageSettings = cache(async (key: PageKey): Promise<PageSettings | null> => {
  const db = getPublicClient();
  if (!db) return null;
  const { data, error } = await db.from("page_settings").select("*").eq("page_key", key).maybeSingle();
  logError("page_settings", error);
  return (data as PageSettings) ?? null;
});

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
export const getServices = cache(async (): Promise<ServiceWithChildren[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("services")
    .select(SERVICE_SELECT)
    .eq("status", "published")
    .order("sort_order")
    .order("title");
  logError("services", error);
  return (data ?? []).map(mapService);
});

export const getServiceBySlug = cache(
  async (slug: string, preview = false): Promise<ServiceWithChildren | null> => {
    const db = await readClient(preview);
    if (!db) return null;
    let query = db.from("services").select(SERVICE_SELECT).eq("slug", slug);
    if (!preview) query = query.eq("status", "published");
    const { data, error } = await query.maybeSingle();
    logError("service", error);
    return data ? mapService(data) : null;
  },
);

/** Minimal list for the contact form's service selector. */
export const getServiceOptions = cache(async (): Promise<Pick<Service, "id" | "title" | "slug">[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("services")
    .select("id, title, slug")
    .eq("status", "published")
    .order("sort_order");
  logError("service options", error);
  return data ?? [];
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
function sortProjects(list: ProjectWithRelations[]) {
  return list.sort((a, b) => {
    const ad = a.project_date ?? a.published_at ?? a.created_at;
    const bd = b.project_date ?? b.published_at ?? b.created_at;
    return bd.localeCompare(ad);
  });
}

export const getProjects = cache(async (): Promise<ProjectWithRelations[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db.from("projects").select(PROJECT_SELECT).eq("status", "published");
  logError("projects", error);
  return sortProjects((data ?? []).map(mapProject));
});

export const getProjectBySlug = cache(
  async (slug: string, preview = false): Promise<ProjectWithRelations | null> => {
    const db = await readClient(preview);
    if (!db) return null;
    let query = db.from("projects").select(PROJECT_SELECT).eq("slug", slug);
    if (!preview) query = query.eq("status", "published");
    const { data, error } = await query.maybeSingle();
    logError("project", error);
    return data ? mapProject(data) : null;
  },
);

/** Explicit selection (in order) or, when empty, featured projects by featured_order. */
export async function getHomeProjects(ids: string[], limit: number): Promise<ProjectWithRelations[]> {
  const all = await getProjects();
  if (ids.length) {
    const byId = new Map(all.map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter((p): p is ProjectWithRelations => Boolean(p)).slice(0, limit);
  }
  const featured = all
    .filter((p) => p.is_featured)
    .sort((a, b) => (a.featured_order ?? 9999) - (b.featured_order ?? 9999));
  return (featured.length ? featured : all).slice(0, limit);
}

export function relatedProjects(all: ProjectWithRelations[], project: ProjectWithRelations, limit = 3) {
  const serviceIds = new Set(project.services.map((s) => s.id));
  const categoryIds = new Set(project.categories.map((c) => c.id));
  return all
    .filter((p) => p.id !== project.id)
    .map((p) => ({
      p,
      score:
        p.services.filter((s) => serviceIds.has(s.id)).length * 2 +
        p.categories.filter((c) => categoryIds.has(c.id)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

export const getProjectCategories = cache(async (): Promise<Taxonomy[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db.from("project_categories").select("id, name, slug").order("sort_order");
  logError("project_categories", error);
  return data ?? [];
});

// ---------------------------------------------------------------------------
// Case studies
// ---------------------------------------------------------------------------
export const getCaseStudies = cache(async (): Promise<CaseStudyWithRelations[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("case_studies")
    .select(CASE_STUDY_SELECT)
    .eq("status", "published")
    .order("date_end", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  logError("case_studies", error);
  return (data ?? []).map(mapCaseStudy);
});

export const getCaseStudyBySlug = cache(
  async (slug: string, preview = false): Promise<CaseStudyWithRelations | null> => {
    const db = await readClient(preview);
    if (!db) return null;
    let query = db.from("case_studies").select(CASE_STUDY_SELECT).eq("slug", slug);
    if (!preview) query = query.eq("status", "published");
    const { data, error } = await query.maybeSingle();
    logError("case_study", error);
    return data ? mapCaseStudy(data) : null;
  },
);

export async function getHomeCaseStudy(id: string | null): Promise<CaseStudyWithRelations | null> {
  const all = await getCaseStudies();
  if (id) {
    const chosen = all.find((c) => c.id === id);
    if (chosen) return chosen;
  }
  const featured = all
    .filter((c) => c.is_featured)
    .sort((a, b) => (a.featured_order ?? 9999) - (b.featured_order ?? 9999));
  return featured[0] ?? all[0] ?? null;
}

export const getAdPlatforms = cache(async (): Promise<Taxonomy[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db.from("ad_platforms").select("id, name, slug").order("name");
  logError("ad_platforms", error);
  return data ?? [];
});

export const getCaseStudyCategories = cache(async (): Promise<Taxonomy[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db.from("case_study_categories").select("id, name, slug").order("sort_order");
  logError("case_study_categories", error);
  return data ?? [];
});

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------
export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("testimonials")
    .select("*")
    .eq("status", "published")
    .order("sort_order")
    .order("created_at", { ascending: false });
  logError("testimonials", error);
  return (data as Testimonial[]) ?? [];
});

// ---------------------------------------------------------------------------
// Slugs for static generation & sitemap (no request context available)
// ---------------------------------------------------------------------------
export async function getPublishedSlugs(
  table: "services" | "projects" | "case_studies",
): Promise<{ slug: string; updated_at: string }[]> {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db.from(table).select("slug, updated_at").eq("status", "published");
  logError(`${table} slugs`, error);
  return data ?? [];
}
