import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div className="container-page pb-24 pt-36" role="status" aria-label="Loading">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-8 h-14 w-full max-w-3xl" />
      <Skeleton className="mt-4 h-14 w-2/3 max-w-2xl" />
      <Skeleton className="mt-8 h-5 w-full max-w-xl" />
      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full rounded-[var(--radius-card)]" />
        ))}
      </div>
      <span className="sr-only">Loading content</span>
    </div>
  );
}
