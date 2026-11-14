import type {
  CaseStudyMetric,
  CaseStudyWithRelations,
  MediaItem,
  ProjectWithRelations,
  ServiceRef,
  ServiceWithChildren,
  Taxonomy,
} from "@/types/content";

/* Raw rows from nested Supabase selects are loosely typed; these mappers are the boundary. */
/* eslint-disable @typescript-eslint/no-explicit-any */

const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;

function pluck<T>(rows: any[] | null | undefined, key: string): T[] {
  return (rows ?? []).map((r) => r?.[key]).filter((v): v is T => v != null);
}

export const SERVICE_SELECT = "*, service_capabilities(*), service_process_steps(*), service_faqs(*)";

export function mapService(row: any): ServiceWithChildren {
  const { service_capabilities, service_process_steps, service_faqs, ...rest } = row;
  return {
    ...rest,
    outcomes: rest.outcomes ?? [],
    deliverables: rest.deliverables ?? [],
    tools: rest.tools ?? [],
    capabilities: [...(service_capabilities ?? [])].sort(bySort),
    process_steps: [...(service_process_steps ?? [])].sort(bySort),
    faqs: [...(service_faqs ?? [])].sort(bySort),
  };
}

export const PROJECT_SELECT = [
  "*",
  "project_services(services(id, title, slug, accent_key))",
  "project_category_map(project_categories(id, name, slug))",
  "project_technologies(technologies(id, name, slug))",
  "project_media(*)",
].join(", ");

export function mapProject(row: any): ProjectWithRelations {
  const { project_services, project_category_map, project_technologies, project_media, ...rest } = row;
  return {
    ...rest,
    responsibilities: rest.responsibilities ?? [],
    services: pluck<ServiceRef>(project_services, "services"),
    categories: pluck<Taxonomy>(project_category_map, "project_categories"),
    technologies: pluck<Taxonomy>(project_technologies, "technologies").sort((a, b) => a.name.localeCompare(b.name)),
    media: [...((project_media ?? []) as MediaItem[])].sort(bySort),
  };
}

export const CASE_STUDY_SELECT = [
  "*",
  "case_study_services(services(id, title, slug, accent_key))",
  "case_study_platforms(ad_platforms(id, name, slug))",
  "case_study_category_map(case_study_categories(id, name, slug))",
  "case_study_metrics(*)",
  "case_study_media(*)",
].join(", ");

export function mapCaseStudy(row: any): CaseStudyWithRelations {
  const {
    case_study_services,
    case_study_platforms,
    case_study_category_map,
    case_study_metrics,
    case_study_media,
    ...rest
  } = row;
  return {
    ...rest,
    services: pluck<ServiceRef>(case_study_services, "services"),
    platforms: pluck<Taxonomy>(case_study_platforms, "ad_platforms"),
    categories: pluck<Taxonomy>(case_study_category_map, "case_study_categories"),
    metrics: [...((case_study_metrics ?? []) as CaseStudyMetric[])]
      .map((m) => ({ ...m, value_numeric: m.value_numeric == null ? null : Number(m.value_numeric) }))
      .sort(bySort),
    media: [...((case_study_media ?? []) as MediaItem[])].sort(bySort),
  };
}
