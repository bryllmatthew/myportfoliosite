"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { SwitchField, TextField } from "@/components/admin/fields";
import { applyResult, onInvalid } from "@/components/admin/editor";
import { CollectionList } from "@/components/admin/collection-list";
import { saveCollectionItem } from "@/lib/actions/admin/site";
import { navItemSchema, socialLinkSchema, type NavItemInput, type SocialLinkInput } from "@/lib/validations/content";
import type { NavArea, NavigationItem, SocialLink } from "@/types/content";

const nextSortOf = (items: { sort_order: number }[]) => items.reduce((m, i) => Math.max(m, i.sort_order), 0) + 1;

function NavItemForm({ item, area, nextSort, close }: { item: NavigationItem | null; area: NavArea; nextSort: number; close: () => void }) {
  const router = useRouter();
  const form = useForm<NavItemInput>({
    resolver: zodResolver(navItemSchema),
    defaultValues: {
      area,
      label: item?.label ?? "",
      url: item?.url ?? "",
      is_external: item?.is_external ?? false,
      is_active: item?.is_active ?? true,
      sort_order: item?.sort_order ?? nextSort,
    },
  });

  const onValid = async (values: NavItemInput) => {
    const res = await saveCollectionItem("navigation_items", item?.id ?? null, values);
    if (applyResult(res, form.setError)) {
      close();
      router.refresh();
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onValid, onInvalid)} noValidate className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="label" label="Label" required />
          <TextField name="url" label="Link" required hint="A site path like /work, or a full https:// URL." />
        </div>
        <div className="flex flex-wrap gap-6">
          <SwitchField name="is_active" label="Show this link" />
          <SwitchField name="is_external" label="Open in a new tab" description="Use for links to other websites." />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={form.formState.isSubmitting}>
            {item ? "Save changes" : "Add link"}
          </Button>
          <Button variant="ghost" onClick={close} disabled={form.formState.isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

function SocialForm({ item, nextSort, close }: { item: SocialLink | null; nextSort: number; close: () => void }) {
  const router = useRouter();
  const form = useForm<SocialLinkInput>({
    resolver: zodResolver(socialLinkSchema),
    defaultValues: {
      platform: item?.platform ?? "",
      label: item?.label ?? "",
      url: item?.url ?? "",
      is_active: item?.is_active ?? true,
      sort_order: item?.sort_order ?? nextSort,
    },
  });

  const onValid = async (values: SocialLinkInput) => {
    const res = await saveCollectionItem("social_links", item?.id ?? null, values);
    if (applyResult(res, form.setError)) {
      close();
      router.refresh();
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onValid, onInvalid)} noValidate className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField name="platform" label="Platform" required placeholder="LinkedIn" hint="Used for analytics." />
          <TextField name="label" label="Label" required placeholder="LinkedIn" hint="Text shown on the site." />
          <TextField name="url" label="URL" required type="url" placeholder="https://" />
        </div>
        <SwitchField name="is_active" label="Show this link" />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={form.formState.isSubmitting}>
            {item ? "Save changes" : "Add social link"}
          </Button>
          <Button variant="ghost" onClick={close} disabled={form.formState.isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export function NavigationList({ area, items }: { area: NavArea; items: NavigationItem[] }) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const nextSort = nextSortOf(items);
  return (
    <CollectionList
      table="navigation_items"
      entityLabel="link"
      addLabel="Add link"
      emptyTitle={area === "header" ? "No header links" : "No footer links"}
      emptyDescription="Add a link to show it in this menu."
      rows={items.map((i) => ({
        id: i.id,
        title: i.label,
        meta: (
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate">{i.url}</span>
            {!i.is_active ? <Badge tone="muted">Hidden</Badge> : null}
            {i.is_external ? <Badge tone="muted">New tab</Badge> : null}
          </span>
        ),
      }))}
      renderForm={(id, close) => <NavItemForm item={id ? (byId.get(id) ?? null) : null} area={area} nextSort={nextSort} close={close} />}
    />
  );
}

export function SocialList({ items }: { items: SocialLink[] }) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const nextSort = nextSortOf(items);
  return (
    <CollectionList
      table="social_links"
      entityLabel="social link"
      addLabel="Add social link"
      emptyTitle="No social links"
      emptyDescription="Add your LinkedIn, GitHub, Instagram or other profiles. They appear in the footer and on the contact page."
      rows={items.map((i) => ({
        id: i.id,
        title: i.label,
        meta: (
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate">{i.url}</span>
            {!i.is_active ? <Badge tone="muted">Hidden</Badge> : null}
          </span>
        ),
      }))}
      renderForm={(id, close) => <SocialForm item={id ? (byId.get(id) ?? null) : null} nextSort={nextSort} close={close} />}
    />
  );
}
