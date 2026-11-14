import { homeConfigSchemas, type HomeConfig, type HomeConfigKey } from "@/lib/validations/content";
import type { HomeSection } from "@/types/content";

export const HOME_CONFIG_DEFAULTS: { [K in HomeConfigKey]: HomeConfig<K> } = {
  hero: {
    primary_cta: { label: "Start a project", url: "/contact" },
    secondary_cta: { label: "View my work", url: "/work" },
    show_availability: true,
  },
  brands: {},
  intro: { cta: { label: "More about me", url: "/about" } },
  expertise: {
    items: [
      { key: "build", label: "Development", description: "Web apps, internal systems and SaaS" },
      { key: "automate", label: "Automation", description: "GoHighLevel, workflows and AI assistants" },
      { key: "grow", label: "Advertising", description: "Meta and TikTok campaigns" },
      { key: "create", label: "Creative", description: "Video and design for the feed" },
    ],
  },
  services: { service_ids: [] },
  work: { project_ids: [], limit: 6 },
  case_study: { case_study_id: null },
  process: { steps: [] },
  stack: {},
  video: { video_url: "", poster_url: "", caption: "" },
  testimonials: { testimonial_ids: [] },
  cta: {
    primary_cta: { label: "Let's work together", url: "/contact" },
    secondary_cta: { label: "", url: "" },
  },
};

/** Parses a section's JSON config, falling back to defaults when it is missing or malformed. */
export function readHomeConfig<K extends HomeConfigKey>(key: K, section: HomeSection | undefined): HomeConfig<K> {
  const parsed = homeConfigSchemas[key].safeParse({ ...HOME_CONFIG_DEFAULTS[key], ...(section?.config ?? {}) });
  return parsed.success ? (parsed.data as HomeConfig<K>) : HOME_CONFIG_DEFAULTS[key];
}
