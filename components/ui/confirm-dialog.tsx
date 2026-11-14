"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Accessible confirmation built on the native <dialog> element:
 * focus is trapped and restored by the browser, Escape closes it,
 * and the rest of the page is inert while open.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "danger",
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (!loading) onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[var(--radius-card)] border border-line-strong bg-surface p-0 text-paper shadow-2xl backdrop:bg-ink/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-3 p-6">
        <h2 id={titleId} className="type-h3">
          {title}
        </h2>
        {description ? (
          <div id={descId} className="text-sm text-muted">
            {description}
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={loading} autoFocus>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
