import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { InquiryActions, InquiryStatusBadge } from "@/components/admin/inquiry-actions";
import { requireAdmin } from "@/lib/auth/admin";
import { adminGetInquiry } from "@/lib/queries/admin";
import { formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Inquiry" };

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const ctx = await requireAdmin();
  const inquiry = await adminGetInquiry(ctx, id);
  if (!inquiry) notFound();

  // Opening a new inquiry marks it as read.
  let status = inquiry.status;
  if (status === "new") {
    const { error } = await ctx.supabase.from("inquiries").update({ status: "read" }).eq("id", id);
    if (!error) status = "read";
  }

  const details = [
    { label: "Received", value: formatDateTime(inquiry.created_at) },
    { label: "Email", value: inquiry.email },
    { label: "Company", value: inquiry.company || "Not provided" },
    { label: "Service", value: inquiry.service?.title ?? "Not specified" },
    { label: "Budget", value: inquiry.budget_range || "Not provided" },
    { label: "Sent from", value: inquiry.source_page || "Unknown" },
  ];

  return (
    <>
      <AdminPageHeader
        title={inquiry.name}
        description={<InquiryStatusBadge status={status} />}
        crumbs={[{ label: "Contact and inquiries", href: "/admin/contact" }]}
      />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <section aria-labelledby="message-title" className="rounded-[var(--radius-card)] border border-line bg-surface/40 p-5 sm:p-6">
            <h2 id="message-title" className="mb-4 font-display text-lg font-semibold">
              Message
            </h2>
            <p className="whitespace-pre-wrap break-words leading-relaxed text-paper">{inquiry.message}</p>
          </section>
          <section aria-labelledby="details-title" className="rounded-[var(--radius-card)] border border-line bg-surface/40 p-5 sm:p-6">
            <h2 id="details-title" className="mb-4 font-display text-lg font-semibold">
              Details
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {details.map((d) => (
                <div key={d.label}>
                  <dt className="text-sm text-subtle">{d.label}</dt>
                  <dd className="mt-0.5 break-words text-paper">{d.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
        <aside className="lg:col-span-4">
          <div className="rounded-[var(--radius-card)] border border-line bg-surface/40 p-5 sm:p-6 lg:sticky lg:top-6">
            <InquiryActions id={inquiry.id} email={inquiry.email} status={status} />
          </div>
        </aside>
      </div>
    </>
  );
}
