import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BrandsManager } from "@/components/admin/brands-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { adminListBrands } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage() {
  const ctx = await requireAdmin();
  const items = await adminListBrands(ctx);
  return (
    <>
      <AdminPageHeader
        title="Brands"
        description="Brands you have worked with, shown as a logo wall on the homepage in the order below."
      />
      <BrandsManager key={items.map((b) => `${b.id}:${b.sort_order}:${b.is_active}:${b.name}:${b.logo_url}`).join("|")} items={items} />
    </>
  );
}
