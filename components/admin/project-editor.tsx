"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { projectSchema, type ProjectInput } from "@/lib/validations/content";
import { deleteProject, saveProject } from "@/lib/actions/admin/content";
import type { SaveIntent } from "@/lib/validations/common";
import type { ContentStatus, ProjectWithRelations, Taxonomy } from "@/types/content";
import { FormSection } from "./page-header";
import { EditorBar, applyResult, onInvalid, useUnsavedChanges } from "./editor";
import { ChipsField, LinesField, MarkdownField, NumberField, SelectField, SlugField, SwitchField, TextField, TextareaField } from "./fields";
import { ImageField } from "./image-field";
import { MediaRepeater } from "./media-repeater";
import { SeoFields } from "./seo-fields";

export interface ProjectEditorOptions {
  services: { id: string; title: string; status: ContentStatus }[];
  categories: Taxonomy[];
  technologies: Taxonomy[];
}

function toForm(p: ProjectWithRelations | null): ProjectInput {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    confirm_slug_change: false,
    short_description: p?.short_description ?? "",
    client_name: p?.client_name ?? "",
    client_display_mode: p?.client_display_mode ?? "public",
    cover_image_url: p?.cover_image_url ?? "",
    cover_image_alt: p?.cover_image_alt ?? "",
    hero_media_url: p?.hero_media_url ?? "",
    project_type: p?.project_type ?? "",
    challenge: p?.challenge ?? "",
    solution: p?.solution ?? "",
    role_description: p?.role_description ?? "",
    responsibilities: (p?.responsibilities ?? []).join("\n"),
    outcome: p?.outcome ?? "",
    is_featured: p?.is_featured ?? false,
    featured_order: p?.featured_order ?? 0,
    project_date: p?.project_date ?? "",
    external_url: p?.external_url ?? "",
    github_url: p?.github_url ?? "",
    seo_title: p?.seo_title ?? "",
    seo_description: p?.seo_description ?? "",
    og_image_url: p?.og_image_url ?? "",
    service_ids: p?.services.map((s) => s.id) ?? [],
    category_ids: p?.categories.map((c) => c.id) ?? [],
    technology_ids: p?.technologies.map((t) => t.id) ?? [],
    media: (p?.media ?? []).map((m) => ({
      id: m.id,
      media_type: m.media_type,
      url: m.url,
      thumbnail_url: m.thumbnail_url ?? "",
      alt_text: m.alt_text,
      caption: m.caption ?? "",
    })),
  };
}

export function ProjectEditor({ project, options }: { project: ProjectWithRelations | null; options: ProjectEditorOptions }) {
  const router = useRouter();
  const [status, setStatus] = useState<ContentStatus | null>(project?.status ?? null);
  const [submitting, setSubmitting] = useState<SaveIntent | null>(null);
  const form = useForm<ProjectInput>({ resolver: zodResolver(projectSchema), defaultValues: toForm(project) });
  const { handleSubmit, setError, reset, control, formState } = form;
  const featured = useWatch({ control, name: "is_featured" });
  useUnsavedChanges(formState.isDirty);

  const submit = (intent: SaveIntent) =>
    handleSubmit(async (values) => {
      setSubmitting(intent);
      const result = await saveProject(project?.id ?? null, values, intent);
      setSubmitting(null);
      if (!applyResult(result, setError)) return;
      setStatus(result.data.status);
      reset({ ...values, confirm_slug_change: false });
      if (!project) router.replace(`/admin/projects/${result.data.id}`);
      else router.refresh();
    }, onInvalid)();

  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-6">
        <FormSection title="Basics" id="basics">
          <TextField name="title" label="Title" required />
          <SlugField published={project?.status === "published"} basePath="/work" />
          <TextareaField name="short_description" label="Short description" rows={3} hint="Shown on project cards and in search results." />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="project_type" label="Project type" hint="For example: Internal system, SaaS, Ad creative" />
            <TextField name="project_date" label="Project date" type="date" />
          </div>
        </FormSection>

        <FormSection title="Client" id="client" description="Control how the client appears publicly.">
          <TextField name="client_name" label="Client name" />
          <SelectField
            name="client_display_mode"
            label="Show the client as"
            options={[
              { value: "public", label: "Their name" },
              { value: "anonymized", label: "Anonymized (Confidential client)" },
              { value: "hidden", label: "Hidden" },
            ]}
          />
        </FormSection>

        <FormSection title="Images" id="images">
          <ImageField name="cover_image_url" label="Cover image" altName="cover_image_alt" entity="projects" />
          <TextField name="cover_image_alt" label="Cover image alt text" hint="Describe what the image shows. Required when a cover image is set." />
          <ImageField
            name="hero_media_url"
            label="Hero media"
            entity="projects"
            imagesOnly={false}
            hint="Optional. A wide image, a video file, or a YouTube/Vimeo/Loom link. Falls back to the cover image."
          />
        </FormSection>

        <FormSection title="Relations" id="relations">
          <ChipsField
            name="service_ids"
            label="Related services"
            options={options.services.map((s) => ({ value: s.id, label: s.title, note: s.status !== "published" ? s.status : undefined }))}
            emptyText="Create a service first."
          />
          <ChipsField
            name="category_ids"
            label="Categories"
            options={options.categories.map((c) => ({ value: c.id, label: c.name }))}
            emptyText="Add categories in Settings."
            hint="Used for the filters on the work page."
          />
          <ChipsField
            name="technology_ids"
            label="Technologies and tools"
            options={options.technologies.map((t) => ({ value: t.id, label: t.name }))}
            emptyText="Add technologies in Settings."
          />
        </FormSection>

        <FormSection title="Story" id="story" description="Short paragraphs read best. Use Markdown for lists and emphasis.">
          <MarkdownField name="challenge" label="The challenge" />
          <MarkdownField name="solution" label="The solution" />
          <MarkdownField name="role_description" label="My role" rows={4} />
          <LinesField name="responsibilities" label="Responsibilities" rows={4} />
          <MarkdownField name="outcome" label="The outcome" hint="Only include results you can verify. Markdown supported." />
        </FormSection>

        <FormSection title="Gallery" id="gallery" description="Drag or use the arrows to reorder.">
          <MediaRepeater entity="projects" />
        </FormSection>

        <FormSection title="Links" id="links">
          <TextField name="external_url" label="Live project URL" type="url" placeholder="https://" />
          <TextField name="github_url" label="Code repository URL" type="url" placeholder="https://github.com/…" />
        </FormSection>

        <FormSection title="Display" id="display">
          <SwitchField name="is_featured" label="Feature this project" description="Featured projects appear on the homepage when no manual selection is set." />
          {featured ? <NumberField name="featured_order" label="Featured order" hint="Lower numbers appear first." /> : null}
        </FormSection>

        <SeoFields entity="projects" />

        <EditorBar
          status={status}
          dirty={formState.isDirty}
          submitting={submitting}
          onSubmit={submit}
          entityLabel="project"
          previewHref={project ? `/api/preview?type=project&id=${project.id}` : null}
          onDelete={
            project
              ? async () => {
                  const r = await deleteProject(project.id);
                  if (!r.ok) {
                    toast.error(r.error);
                    return false;
                  }
                  toast.success(r.message ?? "Deleted");
                  reset(toForm(project));
                  router.replace("/admin/projects");
                  return true;
                }
              : undefined
          }
        />
      </form>
    </FormProvider>
  );
}
