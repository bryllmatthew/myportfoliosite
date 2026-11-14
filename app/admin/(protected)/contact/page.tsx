import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ContactSettingsForm } from "@/components/admin/contact-settings-form";
import { InquiryStatusBadge } from "@/components/admin/inquiry-actions";
import { EmptyState } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth/admin";
import { adminContactSettings, adminListInquiries } from "@/lib/queries/admin";
import { formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Contact and inquiries" };

const TABS = [
  { value: null, label: "Active" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
] as const;

export default async function ContactAdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: rawStatus } = await searchParams;
  const status = TABS.some((t) => t.value === rawStatus) ? (rawStatus ?? null) : null;
  const ctx = await requireAdmin();
  const [settings, inquiries] = await Promise.all([adminContactSettings(ctx), adminListInquiries(ctx, status)]);

  return (
    <>
      <AdminPageHeader title="Contact and inquiries" description="Messages sent through the contact form, and the contact details shown on the site." />

      <section aria-labelledby="inquiries-title" className="mb-10">
        <h2 id="inquiries-title" className="mb-4 font-display text-lg font-semibold">
          Inquiries
        </h2>
        <nav aria-label="Filter inquiries by status" className="mb-4">
          <ul className="flex flex-wrap gap-2">
            {TABS.map((t) => {
              const active = status === t.value;
              return (
                <li key={t.label}>
                  <Link
                    href={t.value ? `/admin/contact?status=${t.value}` : "/admin/contact"}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm transition-colors",
                      active ? "border-paper bg-paper text-ink" : "border-line text-muted hover:border-line-strong hover:text-paper",
                    )}
                  >
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {inquiries.length ? (
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <caption className="sr-only">Inquiries, newest first</caption>
              <thead className="border-b border-line bg-surface/60 text-subtle">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Date</th>
                  <th scope="col" className="px-4 py-3 font-medium">Name</th>
                  <th scope="col" className="px-4 py-3 font-medium">Email</th>
                  <th scope="col" className="px-4 py-3 font-medium">Company</th>
                  <th scope="col" className="px-4 py-3 font-medium">Service</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {inquiries.map((q) => (
                  <tr key={q.id} className={cn("hover:bg-surface/50", q.status === "new" && "font-medium")}>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDateTime(q.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/contact/inquiries/${q.id}`} className="text-paper underline-offset-4 hover:text-signal hover:underline">
                        {q.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{q.email}</td>
                    <td className="px-4 py-3 text-muted">{q.company || "None"}</td>
                    <td className="px-4 py-3 text-muted">{q.service?.title ?? "Not specified"}</td>
                    <td className="px-4 py-3">
                      <InquiryStatusBadge status={q.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Inbox />}
            title={status ? `No ${status} inquiries` : "No inquiries yet"}
            description="Messages from the contact form appear here as soon as they are sent."
          />
        )}
      </section>

      <ContactSettingsForm key={settings?.updated_at ?? "new"} settings={settings} />
    </>
  );
}
