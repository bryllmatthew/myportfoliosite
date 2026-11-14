import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ServiceEditor } from "@/components/admin/service-editor";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "New service" };

export default async function NewServicePage() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader title="New service" crumbs={[{ label: "Services", href: "/admin/services" }]} />
      <ServiceEditor service={null} />
    </>
  );
}
