import type { CaseStudyMetric, ClientDisplayMode } from "@/types/content";

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const fullDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function toDate(value: string): Date | null {
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatMonthYear(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = toDate(value);
  return d ? monthYear.format(d) : null;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = toDate(value);
  return d ? fullDate.format(d) : "";
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const d = toDate(value);
  return d ? dateTime.format(d) : "";
}

export function formatDateRange(start: string | null, end: string | null): string | null {
  const s = formatMonthYear(start);
  const e = formatMonthYear(end);
  if (s && e) return s === e ? s : `${s} to ${e}`;
  if (s) return `From ${s}`;
  if (e) return `Until ${e}`;
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Decimals present in a value, so count-up animations land on the exact figure. */
export function decimalsOf(value: number): number {
  const s = String(value);
  const i = s.indexOf(".");
  return i === -1 ? 0 : Math.min(s.length - i - 1, 2);
}

export function formatNumber(value: number, decimals = decimalsOf(value)): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** "5.2x", "₱1,200,000", "3.4%". Falls back to value_text when not numeric. */
export function formatMetric(
  metric: Pick<CaseStudyMetric, "value_numeric" | "value_text" | "prefix" | "suffix">,
): string {
  const core = metric.value_numeric != null ? formatNumber(Number(metric.value_numeric)) : metric.value_text;
  return `${metric.prefix ?? ""}${core}${metric.suffix ?? ""}`;
}

/** Applies the client privacy setting. Returns null when nothing should be shown. */
export function displayClient(
  name: string | null,
  mode: ClientDisplayMode,
  descriptor?: string | null,
): string | null {
  if (mode === "hidden") return null;
  if (mode === "anonymized") return descriptor?.trim() || "Confidential client";
  return name?.trim() || descriptor?.trim() || null;
}

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
