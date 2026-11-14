"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { caseStudySchema, type CaseStudyInput } from "@/lib/validations/content";
import { deleteCaseStudy, saveCaseStudy } from "@/lib/actions/admin/content";
import type { SaveIntent } from "@/lib/validations/common";
import type { CaseStudyWithRelations, ContentStatus, Taxonomy } from "@/types/content";
import { FormSection } from "./page-header";
import { EditorBar, Repeater, applyResult, onInvalid, useUnsavedChanges } from "./editor";
import { ChipsField, MarkdownField, NumberField, SelectField, SlugField, SwitchField, TextField, TextareaField } from "./fields";
import { ImageField } from "./image-field";
import { MediaRepeater } from "./media-repeater";
import { SeoFields } from "./seo-fields";

export interface CaseStudyEditorOptions {
  services: { id: string; title: string; status: ContentStatus }[];
  platforms: Taxonomy[];
  categories: Taxonomy[];
}

function toForm(c: CaseStudyWithRelations | null): CaseStudyInput {
  return {
    title: c?.title ?? "",
    slug: c?.slug ?? "",
    confirm_slug_change: false,
    short_description: c?.short_description ?? "",
    result_headline: c?.result_headline ?? "",
    client_name: c?.client_name ?? "",
    client_display_mode: c?.client_display_mode ?? "anonymized",
    client_descriptor: c?.client_descriptor ?? "",
    cover_image_url: c?.cover_image_url ?? "",
    cover_image_alt: c?.cover_image_alt ?? "",
    hero_media_url: c?.hero_media_url ?? "",
    campaign_objective: c?.campaign_objective ?? "",
    challenge: c?.challenge ?? "",
    strategy: c?.strategy ?? "",
    creative_approach: c?.creative_approach ?? "",
    targeting_summary: c?.targeting_summary ?? "",
    tracking_setup: c?.tracking_setup ?? "",
    execution_summary: c?.execution_summary ?? "",
    optimization_summary: c?.optimization_summary ?? "",
    results_summary: c?.results_summary ?? "",
    learnings: c?.learnings ?? "",
    date_start: c?.date_start ?? "",
    date_end: c?.date_end ?? "",
    currency_code: c?.currency_code ?? "",
    is_featured: c?.is_featured ?? false,
    featured_order: c?.featured_order ?? 0,
    seo_title: c?.seo_title ?? "",
    seo_description: c?.seo_description ?? "",
    og_image_url: c?.og_image_url ?? "",
    service_ids: c?.services.map((s) => s.id) ?? [],
    platform_ids: c?.platforms.map((p) => p.id) ?? [],
    category_ids: c?.categories.map((x) => x.id) ?? [],
    metrics: (c?.metrics ?? []).map((m) => ({
      id: m.id,
      label: m.label,
      value: m.value_text || (m.value_numeric != null ? String(m.value_numeric) : ""),
      prefix: m.prefix ?? "",
      suffix: m.suffix ?? "",
      description: m.description ?? "",
      is_primary: m.is_primary,
    })),
    media: (c?.media ?? []).map((m) => ({
      id: m.id,
      media_type: m.media_type,
      url: m.url,
      thumbnail_url: m.thumbnail_url ?? "",
      alt_text: m.alt_text,
      caption: m.caption ?? "",
    })),
  };
}

function MetricPreview({ index }: { index: number }) {
  const m = useWatch({ name: `metrics.${index}` }) as CaseStudyInput["metrics"][number] | undefined;
  if (!m?.value && !m?.label) return null;
  return (
    <p className="rounded-lg border border-line bg-ink px-3 py-2 text-sm" aria-live="polite">
      <span className="text-subtle">Shows as </span>
      <span className="font-display font-semibold text-signal">
        {m.prefix}
        {m.value || "0"}
        {m.suffix}
      </span>{" "}
      <span className="text-paper">{m.label || "Label"}</span>
    </p>
  );
}

export function CaseStudyEditor({ caseStudy, options }: { caseStudy: CaseStudyWithRelations | null; options: CaseStudyEditorOptions }) {
  const router = useRouter();
  const [status, setStatus] = useState<ContentStatus | null>(caseStudy?.status ?? null);
  const [submitting, setSubmitting] = useState<SaveIntent | null>(null);
  const form = useForm<CaseStudyInput>({ resolver: zodResolver(caseStudySchema), defaultValues: toForm(caseStudy) });
  const { control, handleSubmit, setError, reset, setValue, getValues, formState } = form;
  const metricValues = useWatch({ control, name: "metrics" });
  const metrics = useFieldArray({ control, name: "metrics", keyName: "key" });
  const featured = useWatch({ control, name: "is_featured" });
  const displayMode = useWatch({ control, name: "client_display_mode" });
  useUnsavedChanges(formState.isDirty);

  const submit = (intent: SaveIntent) =>
    handleSubmit(async (values) => {
      setSubmitting(intent);
      const result = await saveCaseStudy(caseStudy?.id ?? null, values, intent);
      setSubmitting(null);
      if (!applyResult(result, setError)) return;
      setStatus(result.data.status);
      reset({ ...values, confirm_slug_change: false });
      if (!caseStudy) router.replace(`/admin/case-studies/${result.data.id}`);
      else router.refresh();
    }, onInvalid)();

  /** Only one metric can lead; ticking one unticks the rest. */
  const makePrimary = (index: number) => {
    getValues("metrics").forEach((_, i) => {
      if (i !== index) setValue(`metrics.${i}.is_primary`, false, { shouldDirty: true });
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-6">
        <div role="note" className="flex gap-3 rounded-[var(--radius-card)] border border-signal/40 bg-signal/[0.07] p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden />
          <p>
            Publish only results you can verify, with the context that makes them meaningful: platform, objective,
            timeframe and spend. Sample or placeholder numbers must never go live.
          </p>
        </div>

        <FormSection title="Basics" id="basics">
          <TextField name="title" label="Title" required />
          <SlugField published={caseStudy?.status === "published"} basePath="/case-studies" />
          <TextField name="result_headline" label="Result headline" hint="Lead with the outcome, for example: 3.1x return on ad spend in 90 days" />
          <TextareaField name="short_description" label="Summary" rows={3} />
          <div className="grid gap-5 sm:grid-cols-3">
            <TextField name="campaign_objective" label="Campaign objective" hint="Sales, Leads, Awareness…" />
            <TextField name="date_start" label="Start date" type="date" />
            <TextField name="date_end" label="End date" type="date" />
          </div>
          <TextField name="currency_code" label="Currency" hint="3-letter code, for example USD or PHP." className="max-w-48" />
        </FormSection>

        <FormSection title="Client" id="client" description="Anonymized case studies never show the client's name.">
          <SelectField
            name="client_display_mode"
            label="Show the client as"
            options={[
              { value: "anonymized", label: "Anonymized (use the description below)" },
              { value: "public", label: "Their name" },
              { value: "hidden", label: "Hidden" },
            ]}
          />
          {displayMode === "public" ? <TextField name="client_name" label="Client name" /> : null}
          <TextField name="client_descriptor" label="Client description" hint="For example: Direct-to-consumer skincare brand" />
        </FormSection>

        <FormSection title="Metrics" id="metrics" description="The first metric marked as primary leads the page and cards.">
          <Repeater
            items={metrics.fields}
            itemLabel={(i) => metricValues?.[i]?.label || `Metric ${i + 1}`}
            onAdd={() => metrics.append({ label: "", value: "", prefix: "", suffix: "", description: "", is_primary: metrics.fields.length === 0 })}
            onRemove={(i) => metrics.remove(i)}
            onMove={(a, b) => metrics.move(a, b)}
            addLabel="Add metric"
            emptyText="No metrics yet. Add ROAS, revenue, CPA, CTR, leads and so on."
            max={24}
            renderItem={(i) => (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField name={`metrics.${i}.label`} label="Label" required hint="For example: ROAS" />
                  <TextField name={`metrics.${i}.value`} label="Value" required hint="Numbers count up on the page, for example 5.2" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField name={`metrics.${i}.prefix`} label="Prefix" hint="For example: $ or ₱" />
                  <TextField name={`metrics.${i}.suffix`} label="Suffix" hint="For example: x or %" />
                </div>
                <TextField name={`metrics.${i}.description`} label="Context" hint="What this number measures, and over what period." />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--color-signal)]"
                    {...form.register(`metrics.${i}.is_primary`, { onChange: (e) => e.target.checked && makePrimary(i) })}
                  />
                  Primary metric
                </label>
                <MetricPreview index={i} />
              </>
            )}
          />
        </FormSection>

        <FormSection title="Relations" id="relations">
          <ChipsField name="platform_ids" label="Platforms" options={options.platforms.map((p) => ({ value: p.id, label: p.name }))} emptyText="Add platforms in Settings." />
          <ChipsField
            name="category_ids"
            label="Campaign types"
            options={options.categories.map((p) => ({ value: p.id, label: p.name }))}
            emptyText="Add campaign types in Settings."
            hint="Used for the filters on the case studies page."
          />
          <ChipsField
            name="service_ids"
            label="Related services"
            options={options.services.map((s) => ({ value: s.id, label: s.title, note: s.status !== "published" ? s.status : undefined }))}
          />
        </FormSection>

        <FormSection title="Images" id="images">
          <ImageField name="cover_image_url" label="Cover image" altName="cover_image_alt" entity="case-studies" />
          <TextField name="cover_image_alt" label="Cover image alt text" />
          <ImageField name="hero_media_url" label="Hero media" entity="case-studies" imagesOnly={false} hint="Optional image, video file or YouTube/Vimeo/Loom link." />
        </FormSection>

        <FormSection title="Campaign story" id="story" description="Each section appears only when it has content.">
          <MarkdownField name="challenge" label="The challenge" rows={5} />
          <MarkdownField name="strategy" label="Strategy" rows={5} />
          <MarkdownField name="creative_approach" label="Creative approach" rows={5} />
          <MarkdownField name="targeting_summary" label="Audience and targeting" rows={4} hint="Summarize without exposing anything confidential." />
          <MarkdownField name="tracking_setup" label="Funnel and tracking" rows={4} />
          <MarkdownField name="execution_summary" label="Execution" rows={4} />
          <MarkdownField name="optimization_summary" label="Optimization" rows={4} />
          <MarkdownField name="results_summary" label="Results" rows={4} />
          <MarkdownField name="learnings" label="What I learned" rows={4} />
        </FormSection>

        <FormSection title="Gallery" id="gallery" description="Ad creative, dashboards and screenshots. Blur anything confidential before uploading.">
          <MediaRepeater entity="case-studies" />
        </FormSection>

        <FormSection title="Display" id="display">
          <SwitchField name="is_featured" label="Feature this case study" description="The first featured case study appears on the homepage unless one is chosen there." />
          {featured ? <NumberField name="featured_order" label="Featured order" hint="Lower numbers appear first." /> : null}
        </FormSection>

        <SeoFields entity="case-studies" />

        <EditorBar
          status={status}
          dirty={formState.isDirty}
          submitting={submitting}
          onSubmit={submit}
          entityLabel="case study"
          previewHref={caseStudy ? `/api/preview?type=case_study&id=${caseStudy.id}` : null}
          onDelete={
            caseStudy
              ? async () => {
                  const r = await deleteCaseStudy(caseStudy.id);
                  if (!r.ok) {
                    toast.error(r.error);
                    return false;
                  }
                  toast.success(r.message ?? "Deleted");
                  reset(toForm(caseStudy));
                  router.replace("/admin/case-studies");
                  return true;
                }
              : undefined
          }
        />
      </form>
    </FormProvider>
  );
}
