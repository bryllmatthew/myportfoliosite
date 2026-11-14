"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceInput } from "@/lib/validations/content";
import { deleteService, saveService } from "@/lib/actions/admin/content";
import type { SaveIntent } from "@/lib/validations/common";
import type { ContentStatus, ServiceWithChildren } from "@/types/content";
import { FormSection } from "./page-header";
import { EditorBar, Repeater, applyResult, onInvalid, useUnsavedChanges } from "./editor";
import { LinesField, MarkdownField, NumberField, SelectField, SlugField, SwitchField, TextField, TextareaField } from "./fields";
import { ImageField } from "./image-field";
import { SeoFields } from "./seo-fields";
import { toast } from "sonner";

function toForm(s: ServiceWithChildren | null): ServiceInput {
  return {
    title: s?.title ?? "",
    slug: s?.slug ?? "",
    confirm_slug_change: false,
    short_description: s?.short_description ?? "",
    overview: s?.overview ?? "",
    icon: s?.icon ?? "",
    hero_media_url: s?.hero_media_url ?? "",
    accent_key: s?.accent_key ?? "",
    outcomes: (s?.outcomes ?? []).join("\n"),
    deliverables: (s?.deliverables ?? []).join("\n"),
    tools: (s?.tools ?? []).join("\n"),
    cta_label: s?.cta_label ?? "",
    is_featured: s?.is_featured ?? true,
    sort_order: s?.sort_order ?? 0,
    seo_title: s?.seo_title ?? "",
    seo_description: s?.seo_description ?? "",
    og_image_url: s?.og_image_url ?? "",
    capabilities: (s?.capabilities ?? []).map((c) => ({ id: c.id, title: c.title, description: c.description })),
    process_steps: (s?.process_steps ?? []).map((p) => ({ id: p.id, title: p.title, description: p.description })),
    faqs: (s?.faqs ?? []).map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
  };
}

export function ServiceEditor({ service }: { service: ServiceWithChildren | null }) {
  const router = useRouter();
  const [status, setStatus] = useState<ContentStatus | null>(service?.status ?? null);
  const [submitting, setSubmitting] = useState<SaveIntent | null>(null);
  const form = useForm<ServiceInput>({ resolver: zodResolver(serviceSchema), defaultValues: toForm(service) });
  const { control, handleSubmit, setError, reset, formState } = form;
  const [capValues, stepValues, faqValues] = useWatch({ control, name: ["capabilities", "process_steps", "faqs"] });
  useUnsavedChanges(formState.isDirty);

  const capabilities = useFieldArray({ control, name: "capabilities", keyName: "key" });
  const steps = useFieldArray({ control, name: "process_steps", keyName: "key" });
  const faqs = useFieldArray({ control, name: "faqs", keyName: "key" });

  const submit = (intent: SaveIntent) =>
    handleSubmit(async (values) => {
      setSubmitting(intent);
      const result = await saveService(service?.id ?? null, values, intent);
      setSubmitting(null);
      if (!applyResult(result, setError)) return;
      setStatus(result.data.status);
      reset({ ...values, confirm_slug_change: false });
      if (!service) router.replace(`/admin/services/${result.data.id}`);
      else router.refresh();
    }, onInvalid)();

  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-6">
        <FormSection title="Basics" id="basics">
          <TextField name="title" label="Title" required />
          <SlugField published={service?.status === "published"} basePath="/services" />
          <TextareaField name="short_description" label="Short description" rows={3} hint="One or two sentences, shown on cards and in search results." />
          <MarkdownField name="overview" label="Overview" rows={10} />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              name="accent_key"
              label="Accent"
              hint="The colour marker used for this service."
              options={[
                { value: "", label: "Default" },
                { value: "build", label: "Blue (build)" },
                { value: "automate", label: "Violet (automate)" },
                { value: "grow", label: "Mint (grow)" },
                { value: "create", label: "Pink (create)" },
              ]}
            />
            <TextField name="cta_label" label="Call-to-action label" hint="For example: Discuss a software project" />
          </div>
          <ImageField name="hero_media_url" label="Hero image" entity="services" hint="Optional wide image shown below the page header." />
        </FormSection>

        <FormSection title="Who it is for and what they get" id="value">
          <LinesField name="outcomes" label="Problems this solves" rows={5} />
          <LinesField name="deliverables" label="What you get" rows={5} />
          <LinesField name="tools" label="Tools and technology" rows={5} />
        </FormSection>

        <FormSection title="Capabilities" id="capabilities" description="Shown as a grid on the service page; the first few also appear on cards.">
          <Repeater
            items={capabilities.fields}
            itemLabel={(i) => capValues?.[i]?.title || `Capability ${i + 1}`}
            onAdd={() => capabilities.append({ title: "", description: "" })}
            onRemove={(i) => capabilities.remove(i)}
            onMove={(a, b) => capabilities.move(a, b)}
            addLabel="Add capability"
            emptyText="No capabilities yet."
            max={30}
            renderItem={(i) => (
              <>
                <TextField name={`capabilities.${i}.title`} label="Title" required />
                <TextareaField name={`capabilities.${i}.description`} label="Description" rows={2} />
              </>
            )}
          />
        </FormSection>

        <FormSection title="Process" id="process" description="The steps a client goes through. Numbered in this order.">
          <Repeater
            items={steps.fields}
            itemLabel={(i) => `Step ${i + 1}: ${stepValues?.[i]?.title || "Untitled"}`}
            onAdd={() => steps.append({ title: "", description: "" })}
            onRemove={(i) => steps.remove(i)}
            onMove={(a, b) => steps.move(a, b)}
            addLabel="Add step"
            emptyText="No process steps yet."
            max={12}
            renderItem={(i) => (
              <>
                <TextField name={`process_steps.${i}.title`} label="Title" required />
                <TextareaField name={`process_steps.${i}.description`} label="Description" rows={2} />
              </>
            )}
          />
        </FormSection>

        <FormSection title="Questions" id="faqs" description="Frequently asked questions. Also added to search results as structured data.">
          <Repeater
            items={faqs.fields}
            itemLabel={(i) => faqValues?.[i]?.question || `Question ${i + 1}`}
            onAdd={() => faqs.append({ question: "", answer: "" })}
            onRemove={(i) => faqs.remove(i)}
            onMove={(a, b) => faqs.move(a, b)}
            addLabel="Add question"
            emptyText="No questions yet."
            max={30}
            renderItem={(i) => (
              <>
                <TextField name={`faqs.${i}.question`} label="Question" required />
                <TextareaField name={`faqs.${i}.answer`} label="Answer" rows={3} />
              </>
            )}
          />
        </FormSection>

        <FormSection title="Display" id="display">
          <SwitchField name="is_featured" label="Feature on the homepage" description="Featured services appear in the homepage services list." />
          <NumberField name="sort_order" label="Sort order" hint="Lower numbers appear first." />
        </FormSection>

        <SeoFields entity="services" />

        <EditorBar
          status={status}
          dirty={formState.isDirty}
          submitting={submitting}
          onSubmit={submit}
          entityLabel="service"
          previewHref={service ? `/api/preview?type=service&id=${service.id}` : null}
          onDelete={
            service
              ? async () => {
                  const r = await deleteService(service.id);
                  if (!r.ok) {
                    toast.error(r.error);
                    return false;
                  }
                  toast.success(r.message ?? "Deleted");
                  reset(toForm(service));
                  router.replace("/admin/services");
                  return true;
                }
              : undefined
          }
        />
      </form>
    </FormProvider>
  );
}
