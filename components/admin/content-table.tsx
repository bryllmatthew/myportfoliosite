import Link from "next/link";
import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { StatusBadge } from "@/components/ui/misc";
import { formatDate } from "@/lib/utils/format";
import type { ContentStatus } from "@/types/content";

export interface ContentRow {
  id: string;
  title: string;
  href: string;
  status: ContentStatus;
  is_featured: boolean;
  updated_at: string;
  meta?: ReactNode;
}

const TABS: { value: string | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
];

/** Status filter tabs that work as plain links (shareable, no JS required). */
export function StatusTabs({ basePath, current, counts }: { basePath: string; current: string | null; counts: Record<string, number> }) {
  return (
    <nav aria-label="Filter by status" className="mb-5 flex flex-wrap gap-2">
      {TABS.map((t) => {
        const active = current === t.value;
        const n = t.value ? (counts[t.value] ?? 0) : Object.values(counts).reduce((a, b) => a + b, 0);
        return (
          <Link
            key={t.label}
            href={t.value ? `${basePath}?status=${t.value}` : basePath}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm",
              active ? "border-paper bg-paper text-ink" : "border-line text-muted hover:border-line-strong hover:text-paper",
            )}
          >
            {t.label}
            <span className="text-xs opacity-70">{n}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ContentTable({ rows, metaLabel }: { rows: ContentRow[]; metaLabel?: string }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-line bg-ink-raised text-xs text-subtle">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Title
            </th>
            {metaLabel ? (
              <th scope="col" className="px-4 py-3 font-medium">
                {metaLabel}
              </th>
            ) : null}
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Last updated
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-surface/50">
              <td className="px-4 py-3">
                <Link href={r.href} className="inline-flex items-center gap-2 font-medium text-paper hover:text-signal">
                  {r.title}
                  {r.is_featured ? (
                    <>
                      <Star className="size-3.5 fill-signal text-signal" aria-hidden />
                      <span className="sr-only">(featured)</span>
                    </>
                  ) : null}
                </Link>
              </td>
              {metaLabel ? <td className="px-4 py-3 text-muted">{r.meta}</td> : null}
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(r.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function countByStatus(items: { status: ContentStatus }[]) {
  return items.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});
}
