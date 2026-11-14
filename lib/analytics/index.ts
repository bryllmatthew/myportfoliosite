/**
 * Vendor-neutral analytics.
 *
 * `track()` fans an event out to:
 *   1. window.dataLayer (Google Tag Manager / GA4) when present
 *   2. a `portfolio:analytics` DOM CustomEvent, so any vendor script
 *      (Plausible, PostHog, Vercel Analytics, Meta Pixel...) can subscribe
 *      without touching application code
 *   3. the console in development
 *
 * To add a vendor, subscribe in one place:
 *   window.addEventListener("portfolio:analytics", (e) => vendor.capture(e.detail.event, e.detail.props))
 */

export const ANALYTICS_EVENTS = [
  "cta_click",
  "contact_click",
  "service_view",
  "project_view",
  "case_study_view",
  "external_portfolio_link",
  "email_click",
  "phone_click",
  "inquiry_submitted",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];
export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function isAnalyticsEvent(value: string | undefined): value is AnalyticsEvent {
  return !!value && (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}): void {
  if (typeof window === "undefined") return;
  const payload = { ...props, path: window.location.pathname };
  try {
    window.dataLayer?.push({ event, ...payload });
    window.dispatchEvent(new CustomEvent("portfolio:analytics", { detail: { event, props: payload } }));
    if (process.env.NODE_ENV === "development") console.debug("[analytics]", event, payload);
  } catch {
    // Analytics must never break the page.
  }
}
