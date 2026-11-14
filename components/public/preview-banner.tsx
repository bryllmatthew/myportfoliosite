import { Eye } from "lucide-react";

/** Shown while an admin is previewing drafts (Next.js Draft Mode). */
export function PreviewBanner() {
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border border-signal/50 bg-ink/95 py-2 pl-4 pr-2 text-sm shadow-2xl backdrop-blur"
    >
      <Eye className="size-4 text-signal" aria-hidden />
      <span>Preview mode: drafts are visible to you only.</span>
      <form action="/api/preview/exit" method="post">
        <button
          type="submit"
          className="rounded-full bg-signal px-3 py-1 text-sm font-medium text-signal-ink hover:bg-signal-strong"
        >
          Exit preview
        </button>
      </form>
    </div>
  );
}
