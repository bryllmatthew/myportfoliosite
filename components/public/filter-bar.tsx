"use client";

import { cn } from "@/lib/utils/cn";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

/** A labelled group of toggle chips. "All" clears the group. */
export function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  if (!options.length) return null;
  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors",
      active
        ? "border-paper bg-paper text-ink"
        : "border-line text-muted hover:border-line-strong hover:text-paper",
    );
  return (
    <fieldset className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <legend className="sr-only">{label}</legend>
      <span aria-hidden className="w-20 shrink-0 text-sm text-subtle">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={value === null} className={chip(value === null)} onClick={() => onChange(null)}>
          All
        </button>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            className={chip(value === o.value)}
            onClick={() => onChange(value === o.value ? null : o.value)}
          >
            {o.label}
            {o.count != null ? <span className="text-xs opacity-60">{o.count}</span> : null}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Reads and writes filter state in the URL without a navigation or scroll jump. */
export function writeQuery(params: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
    else url.searchParams.delete(k);
  }
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
}
