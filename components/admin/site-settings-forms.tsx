"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/admin/page-header";
import { TextField, TextareaField } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import { applyResult, onInvalid, useUnsavedChanges } from "@/components/admin/editor";
import { savePageSettings, saveSiteSettings } from "@/lib/actions/admin/site";
import {
  pageSettingsSchema,
  siteSettingsSchema,
  type PageSettingsInput,
  type SiteSettingsInput,
} from "@/lib/validations/content";
import type { PageKey, PageSettings, SiteSettings } from "@/types/content";

function siteDefaults(site: SiteSettings | null): SiteSettingsInput {
  return {
    site_name: site?.site_name ?? "",
    site_description: site?.site_description ?? "",
    default_seo_title: site?.default_seo_title ?? "",
    default_seo_description: site?.default_seo_description ?? "",
    default_og_image: site?.default_og_image ?? "",
    primary_cta_label: site?.primary_cta_label ?? "Start a project",
    primary_cta_url: site?.primary_cta_url ?? "/contact",
    footer_text: site?.footer_text ?? "",
    twitter_handle: site?.twitter_handle ?? "",
  };
}

/** Both forms submit the complete settings object; each shows only its own fields. */
function useSiteSettingsForm(site: SiteSettings | null) {
  const router = useRouter();
  const form = useForm<SiteSettingsInput>({ resolver: zodResolver(siteSettingsSchema), defaultValues: siteDefaults(site) });
  useUnsavedChanges(form.formState.isDirty);
  const submit = form.handleSubmit(async (values) => {
    const res = await saveSiteSettings(values);
    if (applyResult(res, form.setError)) {
      form.reset(values);
      router.refresh();
    }
  }, onInvalid);
  return { form, submit };
}

export function BrandSettingsForm({ site }: { site: SiteSettings | null }) {
  const { form, submit } = useSiteSettingsForm(site);
  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <FormSection title="Brand" description="Your site name appears in the header, footer and browser tab.">
          <TextField name="site_name" label="Site name" required hint="Usually your name or studio name." />
          <TextareaField name="site_description" label="Short description" rows={2} hint="One or two sentences about what you do. Used as a fallback description." />
          <TextareaField name="footer_text" label="Footer text" rows={2} hint="A short line under your name in the footer." />
        </FormSection>
        <FormSection title="Main call to action" description="The button in the site header and the default button on inner pages.">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="primary_cta_label" label="Button label" required />
            <TextField name="primary_cta_url" label="Button link" required hint="A site path like /contact, or a full URL." />
          </div>
        </FormSection>
        <div>
          <Button type="submit" loading={form.formState.isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export function SeoDefaultsForm({ site, siteUrl }: { site: SiteSettings | null; siteUrl: string }) {
  const { form, submit } = useSiteSettingsForm(site);
  const title = useWatch({ control: form.control, name: "default_seo_title" });
  const description = useWatch({ control: form.control, name: "default_seo_description" });
  const name = useWatch({ control: form.control, name: "site_name" });
  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate>
        <FormSection title="Site-wide defaults" description="Used on the homepage and whenever a page has no SEO title or description of its own.">
          <TextField name="default_seo_title" label="Default title" hint="Around 50–60 characters works best in search results." />
          <TextareaField name="default_seo_description" label="Default description" rows={3} hint="Around 150–160 characters." />
          <ImageField
            name="default_og_image"
            label="Default social sharing image"
            entity="seo"
            hint="Shown when a link is shared on LinkedIn, X, WhatsApp and others. Use 1200 × 630 pixels."
          />
          <TextField name="twitter_handle" label="X (Twitter) handle" placeholder="@yourname" />
          <SearchPreview title={title || name} description={description} url={siteUrl} />
          <div>
            <Button type="submit" loading={form.formState.isSubmitting}>
              Save changes
            </Button>
          </div>
        </FormSection>
      </form>
    </FormProvider>
  );
}

export function SearchPreview({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="rounded-xl border border-line bg-ink-raised p-4" aria-label="Search result preview">
      <p className="text-xs text-subtle">Search result preview</p>
      <p className="mt-2 truncate text-sm text-muted">{url}</p>
      <p className="mt-0.5 line-clamp-1 text-lg text-build">{title || "Untitled page"}</p>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{description || "No description yet. Search engines will pick text from the page."}</p>
    </div>
  );
}

const PAGE_LABELS: Record<PageKey, { label: string; path: string; note: string }> = {
  home: { label: "Homepage", path: "/", note: "The homepage heading and copy are edited in Homepage. Set its SEO here." },
  services: { label: "Services", path: "/services", note: "Heading and intro appear at the top of the services page." },
  work: { label: "My work", path: "/work", note: "Heading and intro appear at the top of the work page." },
  case_studies: { label: "Advertising case studies", path: "/case-studies", note: "Heading and intro appear at the top of the case studies page." },
  about: { label: "About", path: "/about", note: "The rest of the page comes from Profile." },
  contact: { label: "Contact", path: "/contact", note: "The rest of the page comes from Contact and inquiries." },
};

export function PageSeoForm({
  pageKey,
  page,
  siteName,
  siteUrl,
}: {
  pageKey: PageKey;
  page: PageSettings | null;
  siteName: string;
  siteUrl: string;
}) {
  const router = useRouter();
  const meta = PAGE_LABELS[pageKey];
  const form = useForm<PageSettingsInput>({
    resolver: zodResolver(pageSettingsSchema),
    defaultValues: {
      heading: page?.heading ?? "",
      intro: page?.intro ?? "",
      seo_title: page?.seo_title ?? "",
      seo_description: page?.seo_description ?? "",
      og_image_url: page?.og_image_url ?? "",
    },
  });
  const [heading, intro, seoTitle, seoDescription] = useWatch({
    control: form.control,
    name: ["heading", "intro", "seo_title", "seo_description"],
  });
  const previewTitle = seoTitle || heading ? `${seoTitle || heading} | ${siteName}` : siteName;
  const prefix = `page-${pageKey}`;

  const submit = form.handleSubmit(async (values) => {
    const res = await savePageSettings(pageKey, values);
    if (applyResult(res, form.setError)) {
      form.reset(values);
      router.refresh();
    }
  }, onInvalid);

  return (
    <details className="group rounded-[var(--radius-card)] border border-line bg-surface/40 open:bg-surface/60">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="font-display font-semibold">{meta.label}</span>
          <span className="ml-2 text-sm text-subtle">{meta.path}</span>
        </span>
        <span className="text-sm text-muted group-open:hidden">Edit</span>
        <span className="hidden text-sm text-muted group-open:inline">Close</span>
      </summary>
      <FormProvider {...form}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-5 border-t border-line p-5" id={prefix}>
          <p className="text-sm text-muted">{meta.note}</p>
          {pageKey !== "home" ? (
            <>
              <TextField name="heading" label="Page heading" />
              <TextareaField name="intro" label="Intro" rows={3} />
            </>
          ) : null}
          <TextField name="seo_title" label="SEO title" hint="Leave empty to use the page heading." />
          <TextareaField name="seo_description" label="SEO description" rows={2} hint="Leave empty to use the intro." />
          <ImageField name="og_image_url" label="Social sharing image" entity="seo" hint="Optional. Falls back to the site-wide image." />
          <SearchPreview
            title={pageKey === "home" && !seoTitle ? siteName : previewTitle}
            description={seoDescription || intro}
            url={`${siteUrl}${meta.path === "/" ? "" : meta.path}`}
          />
          <div>
            <Button type="submit" loading={form.formState.isSubmitting}>
              Save {meta.label.toLowerCase()}
            </Button>
          </div>
        </form>
      </FormProvider>
    </details>
  );
}
