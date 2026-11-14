import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { AccentKey, ContentStatus } from "@/types/content";

export const ACCENT_CLASS: Record<AccentKey, { text: string; bg: string; border: string; dot: string }> = {
  build: { text: "text-build", bg: "bg-build/10", border: "border-build/40", dot: "bg-build" },
  automate: { text: "text-automate", bg: "bg-automate/10", border: "border-automate/40", dot: "bg-automate" },
  grow: { text: "text-grow", bg: "bg-grow/10", border: "border-grow/40", dot: "bg-grow" },
  create: { text: "text-create", bg: "bg-create/10", border: "border-create/40", dot: "bg-create" },
};

export function accentFor(key: AccentKey | null | undefined) {
  return ACCENT_CLASS[key ?? "build"];
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "signal" | "success" | "danger" | "muted" }) {
  const tones = {
    neutral: "border-line-strong bg-surface text-paper",
    signal: "border-signal/40 bg-signal/10 text-signal",
    success: "border-success/40 bg-success/10 text-success",
    danger: "border-danger/40 bg-danger/10 text-danger",
    muted: "border-line bg-transparent text-muted",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const STATUS_LABEL: Record<ContentStatus, string> = { draft: "Draft", published: "Published", archived: "Archived" };

export function StatusBadge({ status }: { status: ContentStatus }) {
  const tone = status === "published" ? "success" : status === "draft" ? "signal" : "muted";
  return (
    <Badge tone={tone}>
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          status === "published" ? "bg-success" : status === "draft" ? "bg-signal" : "bg-subtle",
        )}
      />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

/** Small technology / platform tag. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-ink-raised px-3 py-1 text-[0.8125rem] text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-surface", className)} />;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "dot-grid flex flex-col items-start gap-3 rounded-[var(--radius-card)] border border-dashed border-line-strong p-8 sm:p-10",
        className,
      )}
    >
      {icon ? <div className="text-signal [&_svg]:size-6">{icon}</div> : null}
      <h3 className="type-h3 text-paper">{title}</h3>
      {description ? <p className="max-w-prose text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
