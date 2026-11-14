import "server-only";
import type { AdminContext } from "@/lib/auth/admin";
import type {
  AuditLog,
  Brand,
  CaseStudy,
  CaseStudyWithRelations,
  ContactSettings,
  HomeSection,
  Inquiry,
  MediaLibraryItem,
  NavigationItem,
  PageSettings,
  Profile,
  Project,
  ProjectWithRelations,
  Service,
  ServiceWithChildren,
  SiteSettings,
  SocialLink,
  Taxonomy,
  Testimonial,
} from "@/types/content";
import { CASE_STUDY_SELECT, PROJECT_SELECT, SERVICE_SELECT, mapCaseStudy, mapProject, mapService } from "./mappers";

/** Admin reads run with the signed-in admin's session; RLS allows drafts. */

function fail(scope: string, error: { code?: string; message?: string } | null): void {
  if (error) {
    console.error(`[admin queries] ${scope}: ${error.code ?? ""} ${error.message ?? ""}`);
    throw new Error(`Could not load ${scope}.`);
  }
}

export async function getDashboardData(ctx: AdminContext) {
  const db = ctx.supabase;
  const count = async (table: string, status: string) => {
    const { count: n, error } = await db.from(table).select("id", { count: "exact", head: true }).eq("status", status);
    fail(`${table} count`, error);
    return n ?? 0;
  };

  const [services, projects, caseStudies, draftServices, draftProjects, draftCases, newInquiries] = await Promise.all([
    count("services", "published"),
    count("projects", "published"),
    count("case_studies", "published"),
    count("services", "draft"),
    count("projects", "draft"),
    count("case_studies", "draft"),
    count("inquiries", "new"),
  ]);

  const [inquiries, recentServices, recentProjects, recentCases, audit] = await Promise.all([
    db.from("inquiries").select("id, name, email, company, status, created_at, service:services(title)").order("created_at", { ascending: false }).limit(5),
    db.from("services").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
    db.from("projects").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
    db.from("case_studies").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
    db.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  const recent = [
    ...(recentServices.data ?? []).map((r) => ({ ...r, type: "Service", href: `/admin/services/${r.id}` })),
    ...(recentProjects.data ?? []).map((r) => ({ ...r, type: "Project", href: `/admin/projects/${r.id}` })),
    ...(recentCases.data ?? []).map((r) => ({ ...r, type: "Case study", href: `/admin/case-studies/${r.id}` })),
  ]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 6);

  return {
    counts: { services, projects, caseStudies, drafts: draftServices + draftProjects + draftCases, newInquiries },
    inquiries: (inquiries.data ?? []) as unknown as Pick<Inquiry, "id" | "name" | "email" | "company" | "status" | "created_at" | "service">[],
    recent,
    audit: (audit.data ?? []) as AuditLog[],
  };
}

// --- Services ---------------------------------------------------------------
export async function adminListServices(ctx: AdminContext): Promise<Service[]> {
  const { data, error } = await ctx.supabase.from("services").select("*").order("sort_order").order("title");
  fail("services", error);
  return (data ?? []) as Service[];
}

export async function adminGetService(ctx: AdminContext, id: string): Promise<ServiceWithChildren | null> {
  const { data, error } = await ctx.supabase.from("services").select(SERVICE_SELECT).eq("id", id).maybeSingle();
  fail("service", error);
  return data ? mapService(data) : null;
}

export async function adminServiceOptions(ctx: AdminContext): Promise<Pick<Service, "id" | "title" | "status">[]> {
  const { data, error } = await ctx.supabase.from("services").select("id, title, status").order("sort_order");
  fail("service options", error);
  return data ?? [];
}

// --- Projects ---------------------------------------------------------------
export async function adminListProjects(ctx: AdminContext): Promise<ProjectWithRelations[]> {
  const { data, error } = await ctx.supabase.from("projects").select(PROJECT_SELECT).order("updated_at", { ascending: false });
  fail("projects", error);
  return (data ?? []).map(mapProject);
}

export async function adminGetProject(ctx: AdminContext, id: string): Promise<ProjectWithRelations | null> {
  const { data, error } = await ctx.supabase.from("projects").select(PROJECT_SELECT).eq("id", id).maybeSingle();
  fail("project", error);
  return data ? mapProject(data) : null;
}

export async function adminProjectOptions(ctx: AdminContext): Promise<Pick<Project, "id" | "title" | "status">[]> {
  const { data, error } = await ctx.supabase.from("projects").select("id, title, status").order("title");
  fail("project options", error);
  return data ?? [];
}

// --- Case studies -----------------------------------------------------------
export async function adminListCaseStudies(ctx: AdminContext): Promise<CaseStudyWithRelations[]> {
  const { data, error } = await ctx.supabase.from("case_studies").select(CASE_STUDY_SELECT).order("updated_at", { ascending: false });
  fail("case studies", error);
  return (data ?? []).map(mapCaseStudy);
}

export async function adminGetCaseStudy(ctx: AdminContext, id: string): Promise<CaseStudyWithRelations | null> {
  const { data, error } = await ctx.supabase.from("case_studies").select(CASE_STUDY_SELECT).eq("id", id).maybeSingle();
  fail("case study", error);
  return data ? mapCaseStudy(data) : null;
}

export async function adminCaseStudyOptions(ctx: AdminContext): Promise<Pick<CaseStudy, "id" | "title" | "status">[]> {
  const { data, error } = await ctx.supabase.from("case_studies").select("id, title, status").order("title");
  fail("case study options", error);
  return data ?? [];
}

// --- Taxonomies -------------------------------------------------------------
export async function adminTaxonomies(ctx: AdminContext) {
  const [categories, technologies, platforms, caseCategories] = await Promise.all([
    ctx.supabase.from("project_categories").select("id, name, slug").order("sort_order").order("name"),
    ctx.supabase.from("technologies").select("id, name, slug").order("name"),
    ctx.supabase.from("ad_platforms").select("id, name, slug").order("name"),
    ctx.supabase.from("case_study_categories").select("id, name, slug").order("sort_order").order("name"),
  ]);
  fail("project categories", categories.error);
  fail("technologies", technologies.error);
  fail("ad platforms", platforms.error);
  fail("case study categories", caseCategories.error);
  return {
    categories: (categories.data ?? []) as Taxonomy[],
    technologies: (technologies.data ?? []) as Taxonomy[],
    platforms: (platforms.data ?? []) as Taxonomy[],
    caseCategories: (caseCategories.data ?? []) as Taxonomy[],
  };
}

// --- Testimonials, navigation, social --------------------------------------
export async function adminListTestimonials(ctx: AdminContext): Promise<Testimonial[]> {
  const { data, error } = await ctx.supabase.from("testimonials").select("*").order("sort_order").order("created_at", { ascending: false });
  fail("testimonials", error);
  return (data ?? []) as Testimonial[];
}

export async function adminListNavigation(ctx: AdminContext): Promise<NavigationItem[]> {
  const { data, error } = await ctx.supabase.from("navigation_items").select("*").order("area").order("sort_order");
  fail("navigation", error);
  return (data ?? []) as NavigationItem[];
}

export async function adminListBrands(ctx: AdminContext): Promise<Brand[]> {
  const { data, error } = await ctx.supabase.from("brands").select("*").order("sort_order").order("name");
  fail("brands", error);
  return (data ?? []) as Brand[];
}

export async function adminListSocial(ctx: AdminContext): Promise<SocialLink[]> {
  const { data, error } = await ctx.supabase.from("social_links").select("*").order("sort_order");
  fail("social links", error);
  return (data ?? []) as SocialLink[];
}

// --- Singletons ---------------------------------------------------------------
export async function adminSiteSettings(ctx: AdminContext): Promise<SiteSettings | null> {
  const { data, error } = await ctx.supabase.from("site_settings").select("*").maybeSingle();
  fail("site settings", error);
  return (data as SiteSettings) ?? null;
}

export async function adminProfile(ctx: AdminContext): Promise<Profile | null> {
  const { data, error } = await ctx.supabase.from("profiles").select("*").maybeSingle();
  fail("profile", error);
  if (!data) return null;
  return {
    ...(data as Profile),
    skills: data.skills ?? [],
    stack_groups: Array.isArray(data.stack_groups) ? data.stack_groups : [],
    experience: Array.isArray(data.experience) ? data.experience : [],
  };
}

export async function adminContactSettings(ctx: AdminContext): Promise<ContactSettings | null> {
  const { data, error } = await ctx.supabase.from("contact_settings").select("*").maybeSingle();
  fail("contact settings", error);
  return (data as ContactSettings) ?? null;
}

export async function adminPageSettings(ctx: AdminContext): Promise<PageSettings[]> {
  const { data, error } = await ctx.supabase.from("page_settings").select("*");
  fail("page settings", error);
  return (data ?? []) as PageSettings[];
}

export async function adminHomeSections(ctx: AdminContext): Promise<HomeSection[]> {
  const { data, error } = await ctx.supabase.from("home_sections").select("*").order("sort_order");
  fail("homepage sections", error);
  return (data ?? []) as HomeSection[];
}

// --- Inquiries & media --------------------------------------------------------
export async function adminListInquiries(ctx: AdminContext, status: string | null): Promise<Inquiry[]> {
  let q = ctx.supabase
    .from("inquiries")
    .select("*, service:services(title)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status && ["new", "read", "replied", "archived"].includes(status)) q = q.eq("status", status);
  else q = q.neq("status", "archived");
  const { data, error } = await q;
  fail("inquiries", error);
  return (data ?? []) as Inquiry[];
}

export async function adminGetInquiry(ctx: AdminContext, id: string): Promise<Inquiry | null> {
  const { data, error } = await ctx.supabase.from("inquiries").select("*, service:services(title)").eq("id", id).maybeSingle();
  fail("inquiry", error);
  return (data as Inquiry) ?? null;
}

export async function adminListMedia(ctx: AdminContext, search?: string | null): Promise<MediaLibraryItem[]> {
  let q = ctx.supabase.from("media_library").select("*").order("created_at", { ascending: false }).limit(300);
  const term = search?.trim().replace(/[%_,()]/g, "");
  if (term) q = q.or(`file_name.ilike.%${term}%,alt_text.ilike.%${term}%`);
  const { data, error } = await q;
  fail("media", error);
  return (data ?? []) as MediaLibraryItem[];
}
