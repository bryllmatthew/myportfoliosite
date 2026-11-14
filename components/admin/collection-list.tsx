"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/misc";
import { deleteCollectionItem, reorderCollection } from "@/lib/actions/admin/site";

export type CollectionTable = "testimonials" | "navigation_items" | "social_links";

export interface CollectionRow {
  id: string;
  title: string;
  meta?: ReactNode;
}

interface CollectionListProps {
  table: CollectionTable;
  rows: CollectionRow[];
  entityLabel: string;
  addLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  /** Renders the editor for an existing row (id) or a new one (null). Call close() after saving or cancelling. */
  renderForm: (id: string | null, close: () => void) => ReactNode;
}

/**
 * Ordered list with inline editing, keyboard-accessible reordering and
 * confirmed deletion. Remount it (via `key`) when server data changes.
 */
export function CollectionList({ table, rows, entityLabel, addLabel, emptyTitle, emptyDescription, renderForm }: CollectionListProps) {
  const router = useRouter();
  const [order, setOrder] = useState(rows);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CollectionRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const close = () => setEditing(null);

  const move = async (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const previous = order;
    const next = [...order];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    setOrder(next);
    const res = await reorderCollection(table, next.map((r) => r.id));
    if (res.ok) {
      toast.success("Order saved");
      router.refresh();
    } else {
      setOrder(previous);
      toast.error(res.error);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await deleteCollectionItem(table, pendingDelete.id);
    setDeleting(false);
    if (res.ok) {
      toast.success(`${entityLabel[0]?.toUpperCase()}${entityLabel.slice(1)} deleted`);
      setOrder((o) => o.filter((r) => r.id !== pendingDelete.id));
      setPendingDelete(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {order.length ? (
        <ol className="flex flex-col gap-2">
          {order.map((row, i) => (
            <li key={row.id} className="rounded-xl border border-line bg-surface/40">
              {editing === row.id ? (
                <div className="p-4 sm:p-5">{renderForm(row.id, close)}</div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 p-3 sm:px-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-paper">{row.title}</p>
                    {row.meta ? <div className="mt-0.5 text-sm text-muted">{row.meta}</div> : null}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" aria-label={`Move ${row.title} up`} disabled={i === 0} onClick={() => void move(i, i - 1)}>
                      <ArrowUp aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Move ${row.title} down`}
                      disabled={i === order.length - 1}
                      onClick={() => void move(i, i + 1)}
                    >
                      <ArrowDown aria-hidden />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(row.id)} disabled={editing !== null}>
                      <Pencil aria-hidden />
                      Edit
                      <span className="sr-only"> {row.title}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${row.title}`}
                      className="text-danger hover:text-danger"
                      onClick={() => setPendingDelete(row)}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      ) : editing !== "new" ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : null}

      {editing === "new" ? (
        <div className={cn("rounded-xl border border-signal/40 bg-surface/40 p-4 sm:p-5")}>{renderForm(null, close)}</div>
      ) : (
        <div>
          <Button variant="secondary" onClick={() => setEditing("new")} disabled={editing !== null}>
            <Plus aria-hidden />
            {addLabel}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete this ${entityLabel}?`}
        description={pendingDelete ? `“${pendingDelete.title}” will be removed from the site. This cannot be undone.` : undefined}
        confirmLabel={`Delete ${entityLabel}`}
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
