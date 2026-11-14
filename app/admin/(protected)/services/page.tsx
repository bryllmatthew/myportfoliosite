import type { Metadata } from "next";
import { Layers, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ContentTable, StatusTabs, countByStatus } from "@/components/admin/content-table";
import { ServiceOrder } from "@/components/admin/service-order";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth/admin";
import { adminListServices } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Services" };

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const ctx = await requireAdmin();
  const { status } = await searchParams;
  const all = await adminListServices(ctx);
  const filtered = status ? all.filter((s) => s.status === status) : all;
  const active = all.filter((s) => s.status !== "archived");

  return (
    <>
      <AdminPageHeader
        title="Services"
        description="Each service gets its own page. New services appear on the site automatically once published."
        actions={
          <ButtonLink href="/admin/services/new">
            <Plus aria-hidden />
            New service
          </ButtonLink>
        }
      />
      {all.length ? (
        <>
          <StatusTabs basePath="/admin/services" current={status ?? null} counts={countByStatus(all)} />
          {filtered.length ? (
            <ContentTable
              metaLabel="Order"
              rows={filtered.map((s) => ({
                id: s.id,
                title: s.title,
                href: `/admin/services/${s.id}`,
                status: s.status,
                is_featured: s.is_featured,
                updated_at: s.updated_at,
                meta: s.sort_order,
              }))}
            />
          ) : (
            <EmptyState title="Nothing here" description="No services have this status." />
          )}
          {active.length > 1 ? <ServiceOrder services={active.map((s) => ({ id: s.id, title: s.title }))} /> : null}
        </>
      ) : (
        <EmptyState
          icon={<Layers />}
          title="No services yet"
          description="Add the services you offer. Each one gets a page with capabilities, process and FAQs."
          action={<ButtonLink href="/admin/services/new">Create a service</ButtonLink>}
        />
      )}
    </>
  );
}
