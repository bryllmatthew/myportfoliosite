import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { adminListTestimonials } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  const ctx = await requireAdmin();
  const items = await adminListTestimonials(ctx);
  return (
    <>
      <AdminPageHeader
        title="Testimonials"
        description="Quotes from clients. Only published testimonials appear on the site, in the order shown here."
      />
      <TestimonialsManager key={items.map((t) => `${t.id}:${t.updated_at}`).join("|")} items={items} />
    </>
  );
}
