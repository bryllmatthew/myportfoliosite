"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, get, useFieldArray, useForm, useFormContext, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowDown, ArrowUp, ChevronDown, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Select, Switch } from "@/components/ui/form-controls";
import { Badge } from "@/components/ui/misc";
import { NumberField, SelectField, SwitchField, TextField, TextareaField } from "@/components/admin/fields";
import { Repeater, applyResult, onInvalid } from "@/components/admin/editor";
import { ImageField } from "@/components/admin/image-field";
import { reorderHomeSections, saveHomeSection, setHomeSectionVisibility } from "@/lib/actions/admin/site";
import { homeConfigSchemas, homeSectionBaseSchema, type HomeConfigKey } from "@/lib/validations/content";
import type { AccentKey, ContentStatus, HomeSectionKey } from "@/types/content";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Cta {
  label: string;
  url: string;
}

/** Union of every section's config fields; each form only uses its own subset. */
interface AnyConfig {
  primary_cta?: Cta;
  secondary_cta?: Cta;
  show_availability?: boolean;
  items?: { key: AccentKey; label: string; description: string }[];
  service_ids?: string[];
  project_ids?: string[];
  limit?: number;
  case_study_id?: string | null;
  steps?: { title: string; description: string }[];
  testimonial_ids?: string[];
}

interface SectionValues {
  base: { eyebrow: string; heading: string; description: string; is_visible: boolean };
  config: AnyConfig;
}

export interface HomeEditorSection {
  key: HomeSectionKey;
  exists: boolean;
  base: SectionValues["base"];
  config: Record<string, unknown>;
}

export interface PickOption {
  id: string;
  title: string;
  status: ContentStatus;
}

interface Options {
  services: PickOption[];
  projects: PickOption[];
  caseStudies: PickOption[];
  testimonials: PickOption[];
}

const META: Record<HomeSectionKey, { title: string; description: string; fields: ("eyebrow" | "heading" | "description")[] }> = {
  hero: { title: "Hero", description: "The first thing visitors see: headline, intro and buttons.", fields: ["heading", "description"] },
  brands: {
    title: "Brands I've worked with",
    description: "Logos of brands you have worked with. Manage the logos in Brands.",
    fields: ["eyebrow", "heading", "description"],
  },
  intro: {
    title: "Introduction",
    description: "Your photo and short bio from Profile, with a link to the About page.",
    fields: ["eyebrow", "heading", "description"],
  },
  expertise: { title: "Expertise strip", description: "The four disciplines under the hero.", fields: [] },
  services: { title: "Services", description: "Your services as a connected list.", fields: ["eyebrow", "heading", "description"] },
  work: { title: "Selected work", description: "A grid of chosen or featured projects.", fields: ["eyebrow", "heading", "description"] },
  reels: {
    title: "Vertical video slider",
    description: "Vertical (9:16) videos that slide automatically. Six show at a time on desktop. Hidden until you add a video.",
    fields: ["eyebrow", "heading", "description"],
  },
  case_study: { title: "Featured case study", description: "One advertising case study, led by its main result.", fields: ["eyebrow", "heading", "description"] },
  process: { title: "Process", description: "How a project runs, step by step.", fields: ["eyebrow", "heading", "description"] },
  stack: { title: "Tools", description: "Your tools by discipline. The tools themselves are edited in Profile.", fields: ["eyebrow", "heading", "description"] },
  video: {
    title: "Featured video",
    description: "One video, such as a client review. Hidden automatically until a video is chosen.",
    fields: ["eyebrow", "heading", "description"],
  },
  testimonials: {
    title: "Testimonials",
    description: "Client quotes. Hidden automatically until a testimonial is published.",
    fields: ["eyebrow", "heading", "description"],
  },
  cta: { title: "Final call to action", description: "The closing section before the footer.", fields: ["heading", "description"] },
};

// ---------------------------------------------------------------------------
// Ordered multi-pick (services, projects, testimonials)
// ---------------------------------------------------------------------------
function OrderedPicker({ name, label, hint, options, emptyText }: { name: string; label: string; hint: string; options: PickOption[]; emptyText: string }) {
  const { control, setValue } = useFormContext<SectionValues>();
  const selected = (useWatch({ control, name: name as "config.service_ids" }) as string[] | undefined) ?? [];
  const [toAdd, setToAdd] = useState("");
  const selectId = useId();
  const byId = new Map(options.map((o) => [o.id, o]));
  const remaining = options.filter((o) => !selected.includes(o.id));

  const update = (next: string[]) => setValue(name as "config.service_ids", next, { shouldDirty: true, shouldValidate: true });
  const move = (from: number, to: number) => {
    if (to < 0 || to >= selected.length) return;
    const next = [...selected];
    const [id] = next.splice(from, 1);
    if (id) next.splice(to, 0, id);
    update(next);
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-medium">{label}</legend>
      <p className="text-meta text-subtle">{hint}</p>
      {selected.length ? (
        <ol className="flex flex-col gap-1.5">
          {selected.map((id, i) => {
            const opt = byId.get(id);
            const title = opt?.title ?? "Deleted item";
            return (
              <li key={id} className="flex items-center gap-2 rounded-lg border border-line bg-ink-raised px-3 py-1.5">
                <span className="w-5 text-sm text-subtle">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{title}</span>
                {opt && opt.status !== "published" ? <Badge tone="muted">{opt.status}: not shown</Badge> : null}
                <Button variant="ghost" size="icon-sm" aria-label={`Move ${title} up`} disabled={i === 0} onClick={() => move(i, i - 1)}>
                  <ArrowUp aria-hidden />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label={`Move ${title} down`} disabled={i === selected.length - 1} onClick={() => move(i, i + 1)}>
                  <ArrowDown aria-hidden />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label={`Remove ${title}`} onClick={() => update(selected.filter((s) => s !== id))}>
                  <X aria-hidden />
                </Button>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="rounded-lg border border-dashed border-line p-3 text-sm text-subtle">{emptyText}</p>
      )}
      {remaining.length ? (
        <div className="flex flex-wrap gap-2">
          <label htmlFor={selectId} className="sr-only">
            Choose an item to add
          </label>
          <Select id={selectId} value={toAdd} onChange={(e) => setToAdd(e.target.value)} className="max-w-xs">
            <option value="">Choose an item to add</option>
            {remaining.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
                {o.status !== "published" ? ` (${o.status})` : ""}
              </option>
            ))}
          </Select>
          <Button
            variant="secondary"
            disabled={!toAdd}
            onClick={() => {
              if (!toAdd) return;
              update([...selected, toAdd]);
              setToAdd("");
            }}
          >
            <Plus aria-hidden />
            Add
          </Button>
        </div>
      ) : null}
    </fieldset>
  );
}

function CtaFields({ name, label }: { name: "config.primary_cta" | "config.secondary_cta" | "config.cta"; label: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name={`${name}.label`} label={`${label} label`} hint="Leave empty to hide the button." />
      <TextField name={`${name}.url`} label={`${label} link`} hint="A site path like /contact, or a full URL." />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-section config editors
// ---------------------------------------------------------------------------
function ExpertiseItems() {
  const { control } = useFormContext<SectionValues>();
  const items = useFieldArray({ control, name: "config.items" });
  const values = useWatch({ control, name: "config.items" });
  return (
    <Repeater
      items={items.fields.map((f) => ({ key: f.id }))}
      itemLabel={(i) => values?.[i]?.label || `Item ${i + 1}`}
      onAdd={() => items.append({ key: "build", label: "", description: "" })}
      onRemove={(i) => items.remove(i)}
      onMove={(a, b) => items.move(a, b)}
      addLabel="Add item"
      emptyText="No items. The strip is hidden until you add one."
      max={8}
      renderItem={(i) => (
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            name={`config.items.${i}.key`}
            label="Colour"
            options={[
              { value: "build", label: "Blue (development)" },
              { value: "automate", label: "Violet (automation)" },
              { value: "grow", label: "Green (advertising)" },
              { value: "create", label: "Pink (creative)" },
            ]}
          />
          <TextField name={`config.items.${i}.label`} label="Label" required />
          <TextField name={`config.items.${i}.description`} label="Short description" />
        </div>
      )}
    />
  );
}

interface ReelItem {
  video_url: string;
  poster_url: string;
  title: string;
  link: string;
}

function ReelItems() {
  // "config.items" means something else for the expertise strip, so this form gets its own typing.
  const { control } = useFormContext<{ config: { items: ReelItem[] } }>();
  const items = useFieldArray({ control, name: "config.items" });
  const values = useWatch({ control, name: "config.items" });
  return (
    <Repeater
      items={items.fields.map((f) => ({ key: f.id }))}
      itemLabel={(i) => `Video ${i + 1}${values?.[i]?.title ? `: ${values[i]?.title}` : ""}`}
      onAdd={() => items.append({ video_url: "", poster_url: "", title: "", link: "" })}
      onRemove={(i) => items.remove(i)}
      onMove={(a, b) => items.move(a, b)}
      addLabel="Add video"
      emptyText="No videos. The slider is hidden until you add one."
      max={40}
      renderItem={(i) => (
        <div className="grid gap-4">
          <ImageField
            name={`config.items.${i}.video_url`}
            label="Video"
            imagesOnly={false}
            entity="home"
            hint="A vertical (9:16) MP4 or WebM. Upload one, choose from the library, or paste a full https:// link."
          />
          <ImageField name={`config.items.${i}.poster_url`} label="Cover image" entity="home" hint="Optional, but recommended: shown until the video plays." />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name={`config.items.${i}.title`} label="Title" hint="Shown on the card, e.g. the brand." />
            <TextField name={`config.items.${i}.link`} label="Link" hint="Optional. A page like /work/ai-video-commercials." />
          </div>
        </div>
      )}
    />
  );
}

function ProcessSteps() {
  const { control } = useFormContext<SectionValues>();
  const steps = useFieldArray({ control, name: "config.steps" });
  const values = useWatch({ control, name: "config.steps" });
  return (
    <Repeater
      items={steps.fields.map((f) => ({ key: f.id }))}
      itemLabel={(i) => `Step ${i + 1}${values?.[i]?.title ? `: ${values[i]?.title}` : ""}`}
      onAdd={() => steps.append({ title: "", description: "" })}
      onRemove={(i) => steps.remove(i)}
      onMove={(a, b) => steps.move(a, b)}
      addLabel="Add step"
      emptyText="No steps. The section is hidden until you add one."
      max={8}
      renderItem={(i) => (
        <>
          <TextField name={`config.steps.${i}.title`} label="Step title" required />
          <TextareaField name={`config.steps.${i}.description`} label="Description" rows={2} />
        </>
      )}
    />
  );
}

function CaseStudySelect({ options }: { options: PickOption[] }) {
  const { register, formState } = useFormContext<SectionValues>();
  const error = (get(formState.errors, "config.case_study_id") as { message?: string } | undefined)?.message;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="f-case-study" className="text-sm font-medium">
        Case study to feature
      </label>
      <Select
        id="f-case-study"
        aria-invalid={Boolean(error)}
        {...register("config.case_study_id", { setValueAs: (v: string | null) => (v ? v : null) })}
      >
        <option value="">Automatic: the first featured case study</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.title}
            {o.status !== "published" ? ` (${o.status}, not shown)` : ""}
          </option>
        ))}
      </Select>
      {error ? (
        <p className="text-meta text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ConfigFields({ sectionKey, options }: { sectionKey: HomeSectionKey; options: Options }) {
  switch (sectionKey) {
    case "hero":
      return (
        <>
          <CtaFields name="config.primary_cta" label="Primary button" />
          <CtaFields name="config.secondary_cta" label="Secondary button" />
          <SwitchField name="config.show_availability" label="Show availability badge" description="Uses the availability text from Profile." />
        </>
      );
    case "brands":
      return <p className="text-sm text-muted">Logos come from Brands in the sidebar. Hidden automatically until a brand is active.</p>;
    case "intro":
      return (
        <>
          <p className="text-sm text-muted">The photo and short bio come from Profile. Leave the description empty to use the short bio.</p>
          <CtaFields name="config.cta" label="Button" />
        </>
      );
    case "expertise":
      return <ExpertiseItems />;
    case "services":
      return (
        <OrderedPicker
          name="config.service_ids"
          label="Services to show"
          hint="Pick and order services, or leave empty to show every published service in its normal order."
          options={options.services}
          emptyText="Showing all published services."
        />
      );
    case "work":
      return (
        <>
          <OrderedPicker
            name="config.project_ids"
            label="Projects to show"
            hint="Pick and order projects, or leave empty to show featured projects."
            options={options.projects}
            emptyText="Showing featured projects (or the newest, if none are featured)."
          />
          <NumberField name="config.limit" label="Maximum number of projects" hint="Between 1 and 12." />
        </>
      );
    case "reels":
      return (
        <>
          <SwitchField name="config.autoplay" label="Slide automatically" description="Visitors can always pause it. It never moves for people who prefer reduced motion." />
          <ReelItems />
        </>
      );
    case "case_study":
      return <CaseStudySelect options={options.caseStudies} />;
    case "process":
      return <ProcessSteps />;
    case "stack":
      return <p className="text-sm text-muted">This section lists the tool groups from Profile. Edit them there.</p>;
    case "video":
      return (
        <>
          <ImageField
            name="config.video_url"
            label="Video"
            imagesOnly={false}
            entity="home"
            hint="Upload an MP4 or WebM (up to 50 MB), choose one from the library, or paste a full https:// link to a video file."
          />
          <ImageField name="config.poster_url" label="Cover image" entity="home" hint="Shown before the video plays. A frame from the video works well." />
          <TextField name="config.caption" label="Caption" hint="Optional. Shown under the video, for example who is speaking." />
        </>
      );
    case "testimonials":
      return (
        <OrderedPicker
          name="config.testimonial_ids"
          label="Testimonials to show"
          hint="Pick and order testimonials, or leave empty to show featured ones (or all published)."
          options={options.testimonials}
          emptyText="Showing featured testimonials, or all published ones."
        />
      );
    case "cta":
      return (
        <>
          <CtaFields name="config.primary_cta" label="Primary button" />
          <CtaFields name="config.secondary_cta" label="Secondary button" />
        </>
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Section form
// ---------------------------------------------------------------------------
function SectionForm({ section, visible, options, onSaved }: { section: HomeEditorSection; visible: boolean; options: Options; onSaved: () => void }) {
  const router = useRouter();
  const meta = META[section.key];
  const resolver = useMemo(
    () =>
      // The per-key schema is chosen at runtime, so the resolver is cast to the
      // shared form shape (validation is still exact for this section).
      zodResolver(
        z.object({ base: homeSectionBaseSchema, config: homeConfigSchemas[section.key as HomeConfigKey] }),
      ) as unknown as Resolver<SectionValues>,
    [section.key],
  );
  const form = useForm<SectionValues>({
    resolver,
    defaultValues: { base: { ...section.base, is_visible: visible }, config: section.config as AnyConfig },
  });

  const submit = form.handleSubmit(async (values) => {
    const res = await saveHomeSection(section.key, { ...values.base, is_visible: visible }, values.config);
    if (applyResult(res, form.setError)) {
      form.reset(values);
      onSaved();
      router.refresh();
    }
  }, onInvalid);

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5 border-t border-line p-5">
        {meta.fields.includes("eyebrow") ? (
          <TextField name="base.eyebrow" label="Small line above the heading" hint="Optional. Leave empty for a cleaner look." />
        ) : null}
        {meta.fields.includes("heading") ? <TextField name="base.heading" label="Heading" /> : null}
        {meta.fields.includes("description") ? <TextareaField name="base.description" label="Description" rows={3} /> : null}
        <ConfigFields sectionKey={section.key} options={options} />
        <div className="flex items-center gap-3">
          <Button type="submit" loading={form.formState.isSubmitting}>
            Save section
          </Button>
          {form.formState.isDirty ? (
            <span className="text-sm text-signal" role="status">
              Unsaved changes
            </span>
          ) : null}
        </div>
      </form>
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------
export function HomeEditor({ sections, options }: { sections: HomeEditorSection[]; options: Options }) {
  const router = useRouter();
  const [order, setOrder] = useState(sections);
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.key, s.base.is_visible])),
  );
  const [open, setOpen] = useState<HomeSectionKey | null>(null);
  const [busy, setBusy] = useState(false);

  const move = async (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const previous = order;
    const next = [...order];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    setOrder(next);
    setBusy(true);
    const res = await reorderHomeSections(next.map((s) => s.key));
    setBusy(false);
    if (res.ok) {
      toast.success("Order saved");
      router.refresh();
    } else {
      setOrder(previous);
      toast.error(res.error);
    }
  };

  const toggle = async (section: HomeEditorSection, value: boolean) => {
    setVisibility((v) => ({ ...v, [section.key]: value }));
    const res = section.exists
      ? await setHomeSectionVisibility(section.key, value)
      : await saveHomeSection(section.key, { ...section.base, is_visible: value }, section.config);
    if (res.ok) {
      toast.success(value ? "Section shown" : "Section hidden");
      router.refresh();
    } else {
      setVisibility((v) => ({ ...v, [section.key]: !value }));
      toast.error(res.error);
    }
  };

  return (
    <ol className="flex flex-col gap-3">
      {order.map((section, i) => {
        const meta = META[section.key];
        const isOpen = open === section.key;
        const visible = visibility[section.key] ?? true;
        const panelId = `section-panel-${section.key}`;
        return (
          <li key={section.key} className={cn("rounded-[var(--radius-card)] border bg-surface/40", isOpen ? "border-line-strong" : "border-line")}>
            <div className="flex flex-wrap items-center gap-3 p-4">
              <span className="w-6 text-sm text-subtle">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {meta.title}
                  {!visible ? <Badge tone="muted">Hidden</Badge> : null}
                </p>
                <p className="text-sm text-muted">{meta.description}</p>
              </div>
              <Switch
                id={`visible-${section.key}`}
                label={<span className="sr-only">Show {meta.title} on the homepage</span>}
                checked={visible}
                onChange={(e) => void toggle(section, e.target.checked)}
              />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" aria-label={`Move ${meta.title} up`} disabled={i === 0 || busy} onClick={() => void move(i, i - 1)}>
                  <ArrowUp aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move ${meta.title} down`}
                  disabled={i === order.length - 1 || busy}
                  onClick={() => void move(i, i + 1)}
                >
                  <ArrowDown aria-hidden />
                </Button>
                <Button variant="secondary" size="sm" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : section.key)}>
                  {isOpen ? "Close" : "Edit"}
                  <span className="sr-only"> {meta.title}</span>
                  <ChevronDown className={cn("transition-transform", isOpen && "rotate-180")} aria-hidden />
                </Button>
              </div>
            </div>
            <div id={panelId} hidden={!isOpen}>
              {isOpen ? <SectionForm section={section} visible={visible} options={options} onSaved={() => undefined} /> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
