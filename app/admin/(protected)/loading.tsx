import { Skeleton } from "@/components/ui/misc";

export default function AdminLoading() {
  return (
    <div role="status" aria-label="Loading">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-80" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-[var(--radius-card)]" />
        ))}
      </div>
      <Skeleton className="mt-8 h-64 rounded-[var(--radius-card)]" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
