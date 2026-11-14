"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { FormSection } from "./page-header";
import { TextField, TextareaField } from "./fields";
import { ImageField } from "./image-field";

/** Per-item SEO: title, description, social image, with a live search-result preview. */
export function SeoFields({ entity, titleSource = "title", descriptionSource = "short_description" }: { entity: string; titleSource?: string; descriptionSource?: string }) {
  const { control } = useFormContext();
  const [seoTitle, seoDescription, title, description, slug] = useWatch({
    control,
    name: ["seo_title", "seo_description", titleSource, descriptionSource, "slug"],
  }) as string[];
  const shownTitle = seoTitle || title || "Untitled";
  const shownDescription = seoDescription || description || "Add a description so search engines show a useful summary.";
  const base = entity === "projects" ? "work" : entity === "case-studies" ? "case-studies" : "services";

  return (
    <FormSection title="Search and sharing" id="seo" description="Leave blank to use the title and short description.">
      <TextField name="seo_title" label="SEO title" hint={`${(seoTitle ?? "").length}/60 recommended`} />
      <TextareaField name="seo_description" label="SEO description" rows={2} hint={`${(seoDescription ?? "").length}/160 recommended`} />
      <ImageField name="og_image_url" label="Social sharing image" entity={entity} hint="1200 × 630 works best. Falls back to the cover image." />
      <div className="rounded-xl border border-line bg-ink-raised p-4" aria-label="Search result preview">
        <p className="text-xs text-subtle">Search result preview</p>
        <p className="mt-2 truncate text-sm text-grow">/{base}/{slug || "…"}</p>
        <p className="truncate text-lg text-build">{shownTitle}</p>
        <p className="line-clamp-2 text-sm text-muted">{shownDescription}</p>
      </div>
    </FormSection>
  );
}
