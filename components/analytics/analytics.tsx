"use client";

import { useEffect } from "react";
import { isAnalyticsEvent, track, type AnalyticsEvent } from "@/lib/analytics";

/**
 * One delegated click listener for the whole public site.
 *  - Elements with data-track="cta_click" (etc.) report that event, with
 *    data-track-label / data-track-id as properties.
 *  - mailto: and tel: links report email_click / phone_click automatically.
 * Keeps Server Components free of client-side click handlers.
 */
export function AnalyticsListener() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el = target?.closest<HTMLElement>("[data-track], a[href^='mailto:'], a[href^='tel:']");
      if (!el) return;
      const explicit = el.dataset.track;
      const href = el.getAttribute("href") ?? "";
      const props = { label: el.dataset.trackLabel ?? el.textContent?.trim().slice(0, 80), id: el.dataset.trackId, href };
      if (isAnalyticsEvent(explicit)) track(explicit, props);
      if (href.startsWith("mailto:") && explicit !== "email_click") track("email_click", props);
      if (href.startsWith("tel:") && explicit !== "phone_click") track("phone_click", props);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}

/** Fires a view event once when a detail page mounts. */
export function TrackView({ event, id, label }: { event: AnalyticsEvent; id: string; label: string }) {
  useEffect(() => {
    track(event, { id, label });
  }, [event, id, label]);
  return null;
}
