"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { NumberField, SwitchField, TextField } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import { applyResult, onInvalid } from "@/components/admin/editor";
import { CollectionList } from "@/components/admin/collection-list";
import { saveCollectionItem } from "@/lib/actions/admin/site";
import { brandSchema, type BrandInput } from "@/lib/validations/content";
import type { Brand } from "@/types/content";

function BrandForm({ item, nextSort, close }: { item: Brand | null; nextSort: number; close: () => void }) {
  const router = useRouter();
  const form = useForm<BrandInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: item?.name ?? "",
      logo_url: item?.logo_url ?? "",
      website_url: item?.website_url ?? "",
      is_active: item?.is_active ?? true,
      sort_order: item?.sort_order ?? nextSort,
    },
  });

  const onValid = async (values: BrandInput) => {
    const res = await saveCollectionItem("brands", item?.id ?? null, values);
    if (applyResult(res, form.setError)) {
      close();
      router.refresh();
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onValid, onInvalid)} noValidate className="flex flex-col gap-5">
        <h3 className="font-display text-lg font-semibold">{item ? "Edit brand" : "New brand"}</h3>
        <TextField name="name" label="Brand name" required hint="Also used as the logo's alt text." />
        <ImageField
          name="logo_url"
          label="Logo"
          entity="brands"
          hint="A dark logo on a white or transparent background works best: the site shows it as a white mark. Without a logo, the name is shown instead."
        />
        <TextField name="website_url" label="Website" type="url" placeholder="https://" hint="Optional. Makes the logo a link." />
        <div className="grid gap-5 sm:grid-cols-2">
          <SwitchField name="is_active" label="Show on the site" />
          <NumberField name="sort_order" label="Sort order" hint="Lower numbers appear first." />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={form.formState.isSubmitting}>
            {item ? "Save changes" : "Add brand"}
          </Button>
          <Button variant="ghost" onClick={close} disabled={form.formState.isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export function BrandsManager({ items }: { items: Brand[] }) {
  const byId = new Map(items.map((b) => [b.id, b]));
  const nextSort = items.reduce((m, b) => Math.max(m, b.sort_order), 0) + 1;
  return (
    <CollectionList
      table="brands"
      entityLabel="brand"
      addLabel="Add brand"
      emptyTitle="No brands yet"
      emptyDescription="Add the brands you have worked with. The homepage section stays hidden until at least one brand is shown."
      rows={items.map((b) => ({
        id: b.id,
        title: b.name,
        meta: (
          <span className="flex flex-wrap items-center gap-2">
            {b.is_active ? <Badge tone="success">Shown</Badge> : <Badge tone="muted">Hidden</Badge>}
            {b.logo_url ? null : <Badge tone="signal">No logo</Badge>}
            {b.website_url ? <span className="line-clamp-1">{b.website_url}</span> : null}
          </span>
        ),
      }))}
      renderForm={(id, close) => <BrandForm item={id ? (byId.get(id) ?? null) : null} nextSort={nextSort} close={close} />}
    />
  );
}
