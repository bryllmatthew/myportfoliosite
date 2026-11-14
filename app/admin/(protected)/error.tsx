"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin] render error", error.digest ?? "");
  }, [error]);
  return (
    <div role="alert" className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] border border-danger/40 bg-danger/5 p-8">
      <AlertTriangle className="size-6 text-danger" aria-hidden />
      <h1 className="font-display text-xl font-semibold">This page could not load</h1>
      <p className="max-w-lg text-sm text-muted">
        The data could not be fetched. Check your connection and try again. If it keeps happening, confirm the Supabase
        migrations have been applied.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
