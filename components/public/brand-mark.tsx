import { cn } from "@/lib/utils/cn";

/** Four connected nodes: build, automate, grow, create. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden>
      <path d="M6 6 L18 6 L18 18 L6 18 Z" fill="none" stroke="var(--color-line-strong)" strokeWidth="1.5" />
      <circle cx="6" cy="6" r="3" fill="var(--color-build)" />
      <circle cx="18" cy="6" r="3" fill="var(--color-automate)" />
      <circle cx="18" cy="18" r="3" fill="var(--color-grow)" />
      <circle cx="6" cy="18" r="3" fill="var(--color-create)" />
    </svg>
  );
}
