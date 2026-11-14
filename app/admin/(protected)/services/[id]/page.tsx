import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ServiceEditor } from "@/components/admin/service-editor";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/admin";
import { adminGetService } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const service = await adminGetService(ctx, id);
  if (!service) notFound();

  return (
    <>
      <AdminPageHeader
        title={service.title}
        crumbs={[{ label: "Services", href: "/admin/services" }]}
        actions={
          service.status === "published" ? (
            <ButtonLink href={`/services/${service.slug}`} variant="secondary" size="sm" external>
              <ExternalLink aria-hidden />
              View live page
            </ButtonLink>
          ) : null
        }
      />
      <ServiceEditor key={service.updated_at} service={service} />
    </>
  );
}
