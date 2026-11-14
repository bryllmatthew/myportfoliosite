"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reorderServices } from "@/lib/actions/admin/content";

/** Reorders services (the order used across the public site). */
export function ServiceOrder({ services }: { services: { id: string; title: string }[] }) {
  const [list, setList] = useState(services);
  const [saving, setSaving] = useState(false);
  const changed = list.some((s, i) => s.id !== services[i]?.id);

  const move = (from: number, to: number) => {
    setList((l) => {
      const next = [...l];
      const [item] = next.splice(from, 1);
      if (item) next.splice(to, 0, item);
      return next;
    });
  };

  return (
    <section aria-labelledby="order-title" className="mt-10 rounded-[var(--radius-card)] border border-line bg-surface/40 p-5 sm:p-6">
      <h2 id="order-title" className="font-display text-lg font-semibold">
        Display order
      </h2>
      <p className="mt-1 text-sm text-muted">The order services appear on the homepage and the services page.</p>
      <ol className="mt-5 flex flex-col gap-2">
        {list.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2 rounded-xl border border-line bg-ink-raised px-3 py-2 text-sm">
            <span className="w-6 text-subtle">{i + 1}</span>
            <span className="mr-auto">{s.title}</span>
            <Button variant="ghost" size="icon-sm" aria-label={`Move ${s.title} up`} disabled={i === 0} onClick={() => move(i, i - 1)}>
              <ArrowUp aria-hidden />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label={`Move ${s.title} down`} disabled={i === list.length - 1} onClick={() => move(i, i + 1)}>
              <ArrowDown aria-hidden />
            </Button>
          </li>
        ))}
      </ol>
      <Button
        className="mt-4"
        size="sm"
        disabled={!changed}
        loading={saving}
        onClick={async () => {
          setSaving(true);
          const r = await reorderServices(list.map((s) => s.id));
          setSaving(false);
          if (r.ok) toast.success(r.message ?? "Order saved");
          else toast.error(r.error);
        }}
      >
        Save order
      </Button>
    </section>
  );
}
