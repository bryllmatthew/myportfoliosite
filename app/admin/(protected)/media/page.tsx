import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { MediaLibrary } from "@/components/admin/media-library";
import { requireAdmin } from "@/lib/auth/admin";
import { adminListMedia } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").slice(0, 100);
  const ctx = await requireAdmin();
  const items = await adminListMedia(ctx, query);
  return (
    <>
      <AdminPageHeader
        title="Media library"
        description="Every uploaded file. Add alt text to images so screen readers and search engines can describe them."
      />
      <MediaLibrary key={`${query}|${items.map((i) => i.id).join(",")}`} items={items} query={query} />
    </>
  );
}
