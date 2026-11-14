"use server";

import { saveIntent, nullable, toLines, type SaveIntent } from "@/lib/validations/common";
import {
  caseStudySchema,
  projectSchema,
  serviceSchema,
} from "@/lib/validations/content";
import { audit } from "@/lib/utils/audit";
import {
  auditAction,
  dbFailure,
  invalid,
  isUuid,
  nextStatus,
  revalidatePublic,
  runAdmin,
  slugChangeBlocked,
  statusMessage,
  syncChildren,
  syncLinks,
} from "@/lib/actions/helpers";
import type { ActionResult, ContentStatus } from "@/types/content";

type SaveResult = ActionResult<{ id: string; slug: string; status: ContentStatus }>;

function parseIntent(value: unknown): SaveIntent {
  const parsed = saveIntent.safeParse(value);
  return parsed.success ? parsed.data : "save";
}

// =============================================================================
// Services
// =============================================================================
export async function saveService(id: string | null, input: unknown, intentInput: unknown): Promise<SaveResult> {
  return runAdmin(async (ctx) => {
    const parsed = serviceSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const v = parsed.data;
    const intent = parseIntent(intentInput);
    const db = ctx.supabase;

    let existing: { status: ContentStatus; slug: string } | null = null;
    if (id) {
      if (!isUuid(id)) return { ok: false, error: "Invalid service." };
      const { data } = await db.from("services").select("status, slug").eq("id", id).maybeSingle();
      if (!data) return { ok: false, error: "This service no longer exists." };
      existing = data as { status: ContentStatus; slug: string };
    }
    const blocked = slugChangeBlocked(existing, v.slug, v.confirm_slug_change);
    if (blocked) return blocked;

    const status = nextStatus(intent, existing?.status ?? null);
    const row = {
      title: v.title,
      slug: v.slug,
      short_description: v.short_description,
      overview: v.overview,
      icon: nullable(v.icon),
      hero_media_url: nullable(v.hero_media_url),
      accent_key: v.accent_key || null,
      outcomes: toLines(v.outcomes),
      deliverables: toLines(v.deliverables),
      tools: toLines(v.tools),
      cta_label: nullable(v.cta_label),
      is_featured: v.is_featured,
      sort_order: v.sort_order,
      seo_title: nullable(v.seo_title),
      seo_description: nullable(v.seo_description),
      og_image_url: nullable(v.og_image_url),
      status,
    };

    const res = id
      ? await db.from("services").update(row).eq("id", id).select("id").single()
      : await db.from("services").insert(row).select("id").single();
    if (res.error) return dbFailure(res.error, "the service");
    const serviceId = res.data.id as string;

    const childErrors = await Promise.all([
      syncChildren(db, "service_capabilities", "service_id", serviceId, v.capabilities.map((c) => ({ id: c.id, title: c.title, description: c.description }))),
      syncChildren(
        db,
        "service_process_steps",
        "service_id",
        serviceId,
        v.process_steps.map((s, i) => ({ id: s.id, title: s.title, description: s.description, step_number: i + 1 })),
      ),
      syncChildren(db, "service_faqs", "service_id", serviceId, v.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))),
    ]);
    const childError = childErrors.find(Boolean);
    if (childError) return dbFailure(childError, "the service details");

    await audit(ctx, auditAction(intent, !id), "service", serviceId, { title: v.title, status });
    revalidatePublic();
    return { ok: true, data: { id: serviceId, slug: v.slug, status }, message: statusMessage(status, intent, !id) };
  });
}

export async function deleteService(id: string): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    if (!isUuid(id)) return { ok: false, error: "Invalid service." };
    const { data, error } = await ctx.supabase.from("services").delete().eq("id", id).select("title").maybeSingle();
    if (error) return dbFailure(error, "the deletion");
    if (!data) return { ok: false, error: "This service was already deleted." };
    await audit(ctx, "delete", "service", id, { title: data.title });
    revalidatePublic();
    return { ok: true, data: undefined, message: "Service deleted" };
  });
}

export async function reorderServices(ids: string[]): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    const valid = ids.filter(isUuid).slice(0, 100);
    const results = await Promise.all(
      valid.map((id, i) => ctx.supabase.from("services").update({ sort_order: i + 1 }).eq("id", id)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) return dbFailure(failed.error, "the new order");
    revalidatePublic();
    return { ok: true, data: undefined, message: "Order saved" };
  });
}

// =============================================================================
// Projects
// =============================================================================
export async function saveProject(id: string | null, input: unknown, intentInput: unknown): Promise<SaveResult> {
  return runAdmin(async (ctx) => {
    const parsed = projectSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const v = parsed.data;
    const intent = parseIntent(intentInput);
    const db = ctx.supabase;

    let existing: { status: ContentStatus; slug: string } | null = null;
    if (id) {
      if (!isUuid(id)) return { ok: false, error: "Invalid project." };
      const { data } = await db.from("projects").select("status, slug").eq("id", id).maybeSingle();
      if (!data) return { ok: false, error: "This project no longer exists." };
      existing = data as { status: ContentStatus; slug: string };
    }
    const blocked = slugChangeBlocked(existing, v.slug, v.confirm_slug_change);
    if (blocked) return blocked;

    const status = nextStatus(intent, existing?.status ?? null);
    const row = {
      title: v.title,
      slug: v.slug,
      short_description: v.short_description,
      client_name: nullable(v.client_name),
      client_display_mode: v.client_display_mode,
      cover_image_url: nullable(v.cover_image_url),
      cover_image_alt: nullable(v.cover_image_alt),
      hero_media_url: nullable(v.hero_media_url),
      project_type: v.project_type,
      challenge: v.challenge,
      solution: v.solution,
      role_description: v.role_description,
      responsibilities: toLines(v.responsibilities),
      outcome: v.outcome,
      is_featured: v.is_featured,
      featured_order: v.is_featured ? v.featured_order : null,
      project_date: v.project_date || null,
      external_url: nullable(v.external_url),
      github_url: nullable(v.github_url),
      seo_title: nullable(v.seo_title),
      seo_description: nullable(v.seo_description),
      og_image_url: nullable(v.og_image_url),
      status,
    };

    const res = id
      ? await db.from("projects").update(row).eq("id", id).select("id").single()
      : await db.from("projects").insert(row).select("id").single();
    if (res.error) return dbFailure(res.error, "the project");
    const projectId = res.data.id as string;

    const errors = await Promise.all([
      syncLinks(db, "project_services", "project_id", projectId, "service_id", v.service_ids),
      syncLinks(db, "project_category_map", "project_id", projectId, "category_id", v.category_ids),
      syncLinks(db, "project_technologies", "project_id", projectId, "technology_id", v.technology_ids),
      syncChildren(
        db,
        "project_media",
        "project_id",
        projectId,
        v.media.map((m) => ({
          id: m.id,
          media_type: m.media_type,
          url: m.url,
          thumbnail_url: nullable(m.thumbnail_url),
          alt_text: m.alt_text,
          caption: nullable(m.caption),
        })),
      ),
    ]);
    const linkError = errors.find(Boolean);
    if (linkError) return dbFailure(linkError, "the project details");

    await audit(ctx, auditAction(intent, !id), "project", projectId, { title: v.title, status });
    revalidatePublic();
    return { ok: true, data: { id: projectId, slug: v.slug, status }, message: statusMessage(status, intent, !id) };
  });
}

export async function deleteProject(id: string): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    if (!isUuid(id)) return { ok: false, error: "Invalid project." };
    const { data, error } = await ctx.supabase.from("projects").delete().eq("id", id).select("title").maybeSingle();
    if (error) return dbFailure(error, "the deletion");
    if (!data) return { ok: false, error: "This project was already deleted." };
    await audit(ctx, "delete", "project", id, { title: data.title });
    revalidatePublic();
    return { ok: true, data: undefined, message: "Project deleted" };
  });
}

// =============================================================================
// Case studies
// =============================================================================
function parseMetricValue(raw: string): { value_numeric: number | null; value_text: string } {
  const cleaned = raw.replace(/,/g, "").trim();
  const n = /^-?\d+(\.\d+)?$/.test(cleaned) ? Number(cleaned) : null;
  return { value_numeric: n != null && Number.isFinite(n) ? n : null, value_text: raw.trim() };
}

export async function saveCaseStudy(id: string | null, input: unknown, intentInput: unknown): Promise<SaveResult> {
  return runAdmin(async (ctx) => {
    const parsed = caseStudySchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const v = parsed.data;
    const intent = parseIntent(intentInput);
    const db = ctx.supabase;

    let existing: { status: ContentStatus; slug: string } | null = null;
    if (id) {
      if (!isUuid(id)) return { ok: false, error: "Invalid case study." };
      const { data } = await db.from("case_studies").select("status, slug").eq("id", id).maybeSingle();
      if (!data) return { ok: false, error: "This case study no longer exists." };
      existing = data as { status: ContentStatus; slug: string };
    }
    const blocked = slugChangeBlocked(existing, v.slug, v.confirm_slug_change);
    if (blocked) return blocked;

    const status = nextStatus(intent, existing?.status ?? null);
    const row = {
      title: v.title,
      slug: v.slug,
      short_description: v.short_description,
      result_headline: nullable(v.result_headline),
      client_name: nullable(v.client_name),
      client_display_mode: v.client_display_mode,
      client_descriptor: nullable(v.client_descriptor),
      cover_image_url: nullable(v.cover_image_url),
      cover_image_alt: nullable(v.cover_image_alt),
      hero_media_url: nullable(v.hero_media_url),
      campaign_objective: v.campaign_objective,
      challenge: v.challenge,
      strategy: v.strategy,
      creative_approach: v.creative_approach,
      targeting_summary: v.targeting_summary,
      tracking_setup: v.tracking_setup,
      execution_summary: v.execution_summary,
      optimization_summary: v.optimization_summary,
      results_summary: v.results_summary,
      learnings: v.learnings,
      date_start: v.date_start || null,
      date_end: v.date_end || null,
      currency_code: nullable(v.currency_code),
      is_featured: v.is_featured,
      featured_order: v.is_featured ? v.featured_order : null,
      seo_title: nullable(v.seo_title),
      seo_description: nullable(v.seo_description),
      og_image_url: nullable(v.og_image_url),
      status,
    };

    const res = id
      ? await db.from("case_studies").update(row).eq("id", id).select("id").single()
      : await db.from("case_studies").insert(row).select("id").single();
    if (res.error) return dbFailure(res.error, "the case study");
    const caseId = res.data.id as string;

    // Exactly one primary metric: the first one ticked, or the first metric.
    const primaryIndex = Math.max(0, v.metrics.findIndex((m) => m.is_primary));
    const errors = await Promise.all([
      syncLinks(db, "case_study_services", "case_study_id", caseId, "service_id", v.service_ids),
      syncLinks(db, "case_study_platforms", "case_study_id", caseId, "platform_id", v.platform_ids),
      syncLinks(db, "case_study_category_map", "case_study_id", caseId, "category_id", v.category_ids),
      syncChildren(
        db,
        "case_study_metrics",
        "case_study_id",
        caseId,
        v.metrics.map((m, i) => ({
          id: m.id,
          metric_key: m.label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 60),
          label: m.label,
          ...parseMetricValue(m.value),
          prefix: nullable(m.prefix),
          suffix: nullable(m.suffix),
          description: nullable(m.description),
          is_primary: i === primaryIndex,
        })),
      ),
      syncChildren(
        db,
        "case_study_media",
        "case_study_id",
        caseId,
        v.media.map((m) => ({
          id: m.id,
          media_type: m.media_type,
          url: m.url,
          thumbnail_url: nullable(m.thumbnail_url),
          alt_text: m.alt_text,
          caption: nullable(m.caption),
        })),
      ),
    ]);
    const linkError = errors.find(Boolean);
    if (linkError) return dbFailure(linkError, "the case study details");

    await audit(ctx, auditAction(intent, !id), "case_study", caseId, { title: v.title, status });
    revalidatePublic();
    return { ok: true, data: { id: caseId, slug: v.slug, status }, message: statusMessage(status, intent, !id) };
  });
}

export async function deleteCaseStudy(id: string): Promise<ActionResult> {
  return runAdmin(async (ctx) => {
    if (!isUuid(id)) return { ok: false, error: "Invalid case study." };
    const { data, error } = await ctx.supabase.from("case_studies").delete().eq("id", id).select("title").maybeSingle();
    if (error) return dbFailure(error, "the deletion");
    if (!data) return { ok: false, error: "This case study was already deleted." };
    await audit(ctx, "delete", "case_study", id, { title: data.title });
    revalidatePublic();
    return { ok: true, data: undefined, message: "Case study deleted" };
  });
}
