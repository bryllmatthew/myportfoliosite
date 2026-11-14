"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { StatusBadge, Badge } from "@/components/ui/misc";
import { SelectField, SwitchField, TextField, TextareaField } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import { applyResult, onInvalid } from "@/components/admin/editor";
import { CollectionList } from "@/components/admin/collection-list";
import { saveCollectionItem } from "@/lib/actions/admin/site";
import { testimonialSchema, type TestimonialInput } from "@/lib/validations/content";
import type { Testimonial } from "@/types/content";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft: hidden from the site" },
  { value: "published", label: "Published: shown on the site" },
  { value: "archived", label: "Archived" },
];

function TestimonialForm({ item, nextSort, close }: { item: Testimonial | null; nextSort: number; close: () => void }) {
  const router = useRouter();
  const form = useForm<TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: item?.name ?? "",
      role: item?.role ?? "",
      company: item?.company ?? "",
      quote: item?.quote ?? "",
      avatar_url: item?.avatar_url ?? "",
      status: item?.status ?? "draft",
      is_featured: item?.is_featured ?? false,
      sort_order: item?.sort_order ?? nextSort,
    },
  });

  const onValid = async (values: TestimonialInput) => {
    const res = await saveCollectionItem("testimonials", item?.id ?? null, values);
    if (applyResult(res, form.setError)) {
      close();
      router.refresh();
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onValid, onInvalid)} noValidate className="flex flex-col gap-5">
        <h3 className="font-display text-lg font-semibold">{item ? "Edit testimonial" : "New testimonial"}</h3>
        <TextareaField name="quote" label="Quote" required rows={4} hint="Use the client's own words. Only publish testimonials you have permission to share." />
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField name="name" label="Name" required />
          <TextField name="role" label="Role" />
          <TextField name="company" label="Company" />
        </div>
        <ImageField name="avatar_url" label="Photo" entity="testimonials" hint="Optional. A square image works best." />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField name="status" label="Status" options={STATUS_OPTIONS} />
          <SwitchField name="is_featured" label="Featured" description="Featured testimonials are preferred on the homepage." className="sm:pt-7" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={form.formState.isSubmitting}>
            {item ? "Save changes" : "Add testimonial"}
          </Button>
          <Button variant="ghost" onClick={close} disabled={form.formState.isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export function TestimonialsManager({ items }: { items: Testimonial[] }) {
  const byId = new Map(items.map((t) => [t.id, t]));
  const nextSort = items.reduce((m, t) => Math.max(m, t.sort_order), 0) + 1;
  return (
    <CollectionList
      table="testimonials"
      entityLabel="testimonial"
      addLabel="Add testimonial"
      emptyTitle="No testimonials yet"
      emptyDescription="Add a quote from a client. The homepage section stays hidden until at least one testimonial is published."
      rows={items.map((t) => ({
        id: t.id,
        title: t.name,
        meta: (
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={t.status} />
            {t.is_featured ? <Badge tone="signal">Featured</Badge> : null}
            <span className="line-clamp-1">{[t.role, t.company].filter(Boolean).join(", ") || t.quote.slice(0, 80)}</span>
          </span>
        ),
      }))}
      renderForm={(id, close) => <TestimonialForm item={id ? (byId.get(id) ?? null) : null} nextSort={nextSort} close={close} />}
    />
  );
}
