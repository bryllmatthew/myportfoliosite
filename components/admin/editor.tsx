"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ArrowDown, ArrowUp, Eye, GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/misc";
import type { ActionResult, ContentStatus } from "@/types/content";
import type { SaveIntent } from "@/lib/validations/common";

// ---------------------------------------------------------------------------
// Unsaved changes guard: browser close/reload + in-app link clicks.
// ---------------------------------------------------------------------------
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (!window.confirm("You have unsaved changes. Leave this page and discard them?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);
}

/** Copies server-side field errors onto the form and shows the summary as a toast. */
export function applyResult<T extends FieldValues, D>(result: ActionResult<D>, setError: UseFormSetError<T>): result is Extract<ActionResult<D>, { ok: true }> {
  if (result.ok) {
    toast.success(result.message ?? "Saved");
    return true;
  }
  for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
    if (messages?.[0]) setError(field as Path<T>, { type: "server", message: messages[0] });
  }
  toast.error(result.error);
  return false;
}

/** Shows a toast and focuses the first invalid field when client validation fails. */
export function onInvalid() {
  toast.error("Some fields need attention. Check the highlighted fields.");
  requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>("[aria-invalid='true']");
    el?.focus();
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}

// ---------------------------------------------------------------------------
// Sticky editor action bar
// ---------------------------------------------------------------------------
interface EditorBarProps {
  status: ContentStatus | null;
  dirty: boolean;
  submitting: SaveIntent | null;
  onSubmit: (intent: SaveIntent) => void;
  previewHref?: string | null;
  onDelete?: () => Promise<boolean>;
  entityLabel: string;
}

export function EditorBar({ status, dirty, submitting, onSubmit, previewHref, onDelete, entityLabel }: EditorBarProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const busy = submitting !== null || deleting;
  const isPublished = status === "published";

  return (
    <>
      <div className="sticky bottom-0 z-20 -mx-4 mt-10 border-t border-line bg-ink/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-auto flex items-center gap-3 text-sm">
            {status ? <StatusBadge status={status} /> : <span className="text-subtle">Not saved yet</span>}
            {dirty ? (
              <span className="text-signal" role="status">
                Unsaved changes
              </span>
            ) : null}
          </div>
          {onDelete ? (
            <Button variant="ghost" onClick={() => setConfirmDelete(true)} disabled={busy} className="text-danger hover:text-danger">
              <Trash2 aria-hidden />
              Delete
            </Button>
          ) : null}
          {previewHref ? (
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm text-muted hover:bg-surface hover:text-paper"
              title={dirty ? "Preview shows the last saved version" : undefined}
            >
              <Eye className="size-4" aria-hidden />
              Preview
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}
          {status && status !== "archived" ? (
            <Button variant="ghost" onClick={() => onSubmit("archive")} loading={submitting === "archive"} disabled={busy}>
              Archive
            </Button>
          ) : null}
          {isPublished ? (
            <>
              <Button variant="secondary" onClick={() => onSubmit("draft")} loading={submitting === "draft"} disabled={busy}>
                Unpublish
              </Button>
              <Button onClick={() => onSubmit("save")} loading={submitting === "save"} disabled={busy}>
                Update
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => onSubmit("draft")} loading={submitting === "draft"} disabled={busy}>
                Save draft
              </Button>
              <Button onClick={() => onSubmit("publish")} loading={submitting === "publish"} disabled={busy}>
                Publish
              </Button>
            </>
          )}
        </div>
      </div>
      {onDelete ? (
        <ConfirmDialog
          open={confirmDelete}
          title={`Delete this ${entityLabel}?`}
          description={`This permanently removes the ${entityLabel} and its details. It cannot be undone. Archive it instead if you might need it later.`}
          confirmLabel={`Delete ${entityLabel}`}
          loading={deleting}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            setDeleting(true);
            const ok = await onDelete();
            setDeleting(false);
            if (!ok) setConfirmDelete(false);
          }}
        />
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Repeater: ordered list of sub-forms with drag or keyboard reordering.
// ---------------------------------------------------------------------------
interface RepeaterProps {
  items: { key: string }[];
  renderItem: (index: number) => ReactNode;
  itemLabel: (index: number) => string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  addLabel: string;
  emptyText: string;
  max?: number;
}

export function Repeater({ items, renderItem, itemLabel, onAdd, onRemove, onMove, addLabel, emptyText, max = 50 }: RepeaterProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {items.length ? (
        <ol className="flex flex-col gap-3">
          {items.map((item, i) => (
            <li
              key={item.key}
              onDragOver={(e) => {
                if (dragIndex === null) return;
                e.preventDefault();
                setOverIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== i) onMove(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn(
                "rounded-xl border border-line bg-ink-raised/70 p-4 transition-colors",
                overIndex === i && dragIndex !== i && "border-signal",
                dragIndex === i && "opacity-60",
              )}
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  draggable
                  onDragStart={(e) => {
                    setDragIndex(i);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  className="cursor-grab text-subtle active:cursor-grabbing"
                  aria-hidden
                  title="Drag to reorder"
                >
                  <GripVertical className="size-4" />
                </span>
                <span className="mr-auto truncate text-sm font-medium text-paper">{itemLabel(i)}</span>
                <Button variant="ghost" size="icon-sm" aria-label={`Move ${itemLabel(i)} up`} disabled={i === 0} onClick={() => onMove(i, i - 1)}>
                  <ArrowUp aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move ${itemLabel(i)} down`}
                  disabled={i === items.length - 1}
                  onClick={() => onMove(i, i + 1)}
                >
                  <ArrowDown aria-hidden />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label={`Remove ${itemLabel(i)}`} onClick={() => onRemove(i)} className="text-danger hover:text-danger">
                  <Trash2 aria-hidden />
                </Button>
              </div>
              <div className="flex flex-col gap-4">{renderItem(i)}</div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-xl border border-dashed border-line p-4 text-sm text-subtle">{emptyText}</p>
      )}
      {items.length < max ? (
        <div>
          <Button variant="secondary" size="sm" onClick={onAdd}>
            <Plus aria-hidden />
            {addLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
