"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { applyResult, onInvalid } from "@/components/admin/editor";
import { deleteTaxonomy, saveTaxonomy } from "@/lib/actions/admin/site";
import { taxonomySchema, type TaxonomyInput } from "@/lib/validations/content";
import { slugify } from "@/lib/utils/format";
import type { Taxonomy } from "@/types/content";

export type TaxonomyTable = "project_categories" | "technologies" | "ad_platforms" | "case_study_categories";

function TaxonomyForm({
  table,
  item,
  singular,
  onDone,
}: {
  table: TaxonomyTable;
  item: Taxonomy | null;
  singular: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const form = useForm<TaxonomyInput>({
    resolver: zodResolver(taxonomySchema),
    defaultValues: { name: item?.name ?? "", slug: item?.slug ?? "" },
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(item));
  const prefix = `${table}-${item?.id ?? "new"}`;

  const submit = form.handleSubmit(async (values) => {
    const res = await saveTaxonomy(table, item?.id ?? null, values);
    if (applyResult(res, form.setError)) {
      form.reset({ name: "", slug: "" });
      setSlugTouched(false);
      onDone();
      router.refresh();
    }
  }, onInvalid);

  // Input ids are namespaced per row so they stay unique on the page.
  const nameField = form.register("name", {
    onChange: (e: { target: { value: string } }) => {
      if (!slugTouched) form.setValue("slug", slugify(e.target.value), { shouldValidate: form.formState.isSubmitted });
    },
  });

  return (
      <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end" aria-label={item ? `Edit ${item.name}` : `Add ${singular}`}>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor={`${prefix}-name`} className="text-sm font-medium">
            Name
          </label>
          <input
            id={`${prefix}-name`}
            {...nameField}
            aria-invalid={Boolean(form.formState.errors.name)}
            className="h-11 w-full rounded-[var(--radius-control)] border border-line bg-ink-raised px-3.5 text-[0.9375rem] text-paper focus-visible:border-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/35 aria-[invalid=true]:border-danger"
          />
          {form.formState.errors.name?.message ? (
            <p className="text-meta text-danger" role="alert">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor={`${prefix}-slug`} className="text-sm font-medium">
            Slug
          </label>
          <input
            id={`${prefix}-slug`}
            {...form.register("slug", { onChange: () => setSlugTouched(true) })}
            aria-invalid={Boolean(form.formState.errors.slug)}
            className="h-11 w-full rounded-[var(--radius-control)] border border-line bg-ink-raised px-3.5 text-[0.9375rem] text-paper focus-visible:border-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/35 aria-[invalid=true]:border-danger"
          />
          {form.formState.errors.slug?.message ? (
            <p className="text-meta text-danger" role="alert">
              {form.formState.errors.slug.message}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button type="submit" loading={form.formState.isSubmitting}>
            {item ? "Save" : (
              <>
                <Plus aria-hidden />
                Add
              </>
            )}
          </Button>
          {item ? (
            <Button variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
  );
}

export function TaxonomyManager({
  table,
  singular,
  items,
  usageNote,
}: {
  table: TaxonomyTable;
  singular: string;
  items: Taxonomy[];
  usageNote: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Taxonomy | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await deleteTaxonomy(table, pendingDelete.id);
    setDeleting(false);
    if (res.ok) {
      toast.success(res.message ?? "Deleted");
      setPendingDelete(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {items.length ? (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {items.map((item) => (
            <li key={item.id} className="p-3 sm:px-4">
              {editing === item.id ? (
                <TaxonomyForm table={table} item={item} singular={singular} onDone={() => setEditing(null)} />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="truncate text-sm text-subtle">{item.slug}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(item.id)}>
                    <Pencil aria-hidden />
                    Edit
                    <span className="sr-only"> {item.name}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${item.name}`}
                    className="text-danger hover:text-danger"
                    onClick={() => setPendingDelete(item)}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line p-4 text-sm text-subtle">Nothing here yet. Add the first {singular} below.</p>
      )}
      <div className="rounded-xl border border-line bg-ink-raised/60 p-4">
        <p className="mb-3 text-sm font-medium">Add {singular}</p>
        <TaxonomyForm table={table} item={null} singular={singular} onDone={() => undefined} />
      </div>
      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete this ${singular}?`}
        description={pendingDelete ? `“${pendingDelete.name}” will be removed from every item that uses it. ${usageNote}` : undefined}
        confirmLabel={`Delete ${singular}`}
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
