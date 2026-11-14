import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, FilePenLine, Inbox, Layers, LineChart, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState, StatusBadge } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth/admin";
import { getDashboardData } from "@/lib/queries/admin";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { ContentStatus } from "@/types/content";

export const metadata: Metadata = { title: "Dashboard" };

const ACTION_LABEL: Record<string, string> = {
  create: "created",
  update: "updated",
  publish: "published",
  archive: "archived",
  delete: "deleted",
  upload: "uploaded",
  status_change: "changed the status of",
};

export default async function DashboardPage() {
  const ctx = await requireAdmin();
  const { counts, inquiries, recent, audit } = await getDashboardData(ctx);

  const cards = [
    { label: "Published services", value: counts.services, href: "/admin/services", icon: Layers },
    { label: "Published projects", value: counts.projects, href: "/admin/projects", icon: Briefcase },
    { label: "Published case studies", value: counts.caseStudies, href: "/admin/case-studies", icon: LineChart },
    { label: "Drafts", value: counts.drafts, href: "/admin/projects?status=draft", icon: FilePenLine },
    { label: "New inquiries", value: counts.newInquiries, href: "/admin/contact?status=new", icon: Inbox, highlight: counts.newInquiries > 0 },
  ];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={ctx.email ? `Signed in as ${ctx.email}` : undefined}
        actions={
          <>
            <ButtonLink href="/admin/projects/new" size="sm">
              <Plus aria-hidden />
              New project
            </ButtonLink>
            <ButtonLink href="/admin/case-studies/new" size="sm" variant="secondary">
              <Plus aria-hidden />
              New case study
            </ButtonLink>
            <ButtonLink href="/admin/services/new" size="sm" variant="secondary">
              <Plus aria-hidden />
              New service
            </ButtonLink>
          </>
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <li key={c.label}>
            <Link
              href={c.href}
              className={cn(
                "flex h-full flex-col gap-4 rounded-[var(--radius-card)] border bg-surface/40 p-5 transition-colors hover:border-line-strong",
                c.highlight ? "border-signal/50" : "border-line",
              )}
            >
              <c.icon className={cn("size-5", c.highlight ? "text-signal" : "text-subtle")} aria-hidden />
              <span className="mt-auto">
                <span className="block font-display text-3xl font-semibold tabular-nums">{c.value}</span>
                <span className="text-sm text-muted">{c.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="recent-inquiries" className="rounded-[var(--radius-card)] border border-line bg-surface/40 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-inquiries" className="font-display text-lg font-semibold">
              Recent inquiries
            </h2>
            <Link href="/admin/contact" className="text-sm text-muted hover:text-paper">
              View all
            </Link>
          </div>
          {inquiries.length ? (
            <ul className="divide-y divide-line">
              {inquiries.map((i) => (
                <li key={i.id}>
                  <Link href={`/admin/contact/inquiries/${i.id}`} className="flex items-center gap-3 py-3 hover:text-signal">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{i.name}</span>
                      <span className="block truncate text-sm text-muted">
                        {[i.company, i.service?.title].filter(Boolean).join(", ") || i.email}
                      </span>
                    </span>
                    {i.status === "new" ? <Badge tone="signal">New</Badge> : null}
                    <span className="whitespace-nowrap text-xs text-subtle">{formatDateTime(i.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState className="p-6 sm:p-6" title="No inquiries yet" description="Messages from the contact form appear here." />
          )}
        </section>

        <section aria-labelledby="recent-content" className="rounded-[var(--radius-card)] border border-line bg-surface/40 p-5 sm:p-6">
          <h2 id="recent-content" className="mb-4 font-display text-lg font-semibold">
            Recently edited
          </h2>
          {recent.length ? (
            <ul className="divide-y divide-line">
              {recent.map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <Link href={r.href} className="flex items-center gap-3 py-3 hover:text-signal">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.title}</span>
                      <span className="text-sm text-muted">{r.type}</span>
                    </span>
                    <StatusBadge status={r.status as ContentStatus} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState className="p-6 sm:p-6" title="No content yet" description="Create a service, project or case study to get started." />
          )}
        </section>
      </div>

      {audit.length ? (
        <section aria-labelledby="activity" className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface/40 p-5 sm:p-6">
          <h2 id="activity" className="mb-4 font-display text-lg font-semibold">
            Recent activity
          </h2>
          <ul className="space-y-2 text-sm">
            {audit.map((a) => (
              <li key={a.id} className="flex flex-wrap gap-x-2 text-muted">
                <span className="text-paper">You {ACTION_LABEL[a.action] ?? a.action}</span>
                <span>
                  {a.entity_type.replace(/_/g, " ")}
                  {typeof a.metadata?.title === "string" ? `: ${a.metadata.title}` : ""}
                </span>
                <span className="ml-auto text-xs text-subtle">{formatDateTime(a.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
