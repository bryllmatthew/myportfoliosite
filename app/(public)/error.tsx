"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[public] render error", error.digest ?? "");
  }, [error]);

  return (
    <section className="flex min-h-[70dvh] items-center pt-24">
      <div className="container-page">
        <h1 className="type-h2">This page did not load</h1>
        <p className="type-lead mt-4 max-w-lg">Something went wrong while loading content. Try again, or head back to the homepage.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/" variant="secondary">
            Go to the homepage
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
