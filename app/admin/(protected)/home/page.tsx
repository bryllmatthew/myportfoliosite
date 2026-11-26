import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { HomeEditor, type HomeEditorSection } from "@/components/admin/home-editor";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/admin";
import {
  adminCaseStudyOptions,
  adminHomeSections,
  adminListTestimonials,
  adminProjectOptions,
  adminServiceOptions,
} from "@/lib/queries/admin";
import { readHomeConfig } from "@/lib/queries/home-config";
import type { HomeSectionKey } from "@/types/content";

export const metadata: Metadata = { title: "Homepage" };

const KEYS: HomeSectionKey[] = ["hero", "brands", "expertise", "intro", "services", "work", "reels", "case_study", "process", "stack", "video", "testimonials", "cta"];

export default async function HomeAdminPage() {
  const ctx = await requireAdmin();
  const [rows, services, projects, caseStudies, testimonials] = await Promise.all([
    adminHomeSections(ctx),
    adminServiceOptions(ctx),
    adminProjectOptions(ctx),
    adminCaseStudyOptions(ctx),
    adminListTestimonials(ctx),
  ]);

  const sorted = KEYS.map((key, i) => {
    const row = rows.find((r) => r.section_key === key);
    return {
      key,
      exists: Boolean(row),
      sort: row?.sort_order ?? 100 + i,
      base: {
        eyebrow: row?.eyebrow ?? "",
        heading: row?.heading ?? "",
        description: row?.description ?? "",
        is_visible: row?.is_visible ?? true,
      },
      config: readHomeConfig(key, row) as Record<string, unknown>,
    };
  }).sort((a, b) => a.sort - b.sort);
  const sections: HomeEditorSection[] = sorted.map((s) => ({ key: s.key, exists: s.exists, base: s.base, config: s.config }));

  const stamp = rows.map((r) => `${r.section_key}:${r.updated_at}`).join("|");

  return (
    <>
      <AdminPageHeader
        title="Homepage"
        description="Choose which sections appear, their order, and their content. Changes go live as soon as you save."
        actions={
          <ButtonLink href="/" variant="secondary" external>
            View homepage
          </ButtonLink>
        }
      />
      <HomeEditor
        key={stamp}
        sections={sections}
        options={{
          services,
          projects,
          caseStudies,
          testimonials: testimonials.map((t) => ({ id: t.id, title: t.name, status: t.status })),
        }}
      />
    </>
  );
}
