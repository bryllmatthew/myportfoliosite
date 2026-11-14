import { z } from "zod";
import {
  displayModeField,
  linesField,
  optionalDate,
  optionalEmail,
  optionalLink,
  optionalUrl,
  requiredText,
  requiredUrl,
  linkField,
  seoFields,
  slugField,
  sortOrder,
  statusField,
  text,
  uuid,
} from "./common";

const childId = z.string().optional();

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
export const serviceSchema = z.object({
  title: requiredText(120, "Title"),
  slug: slugField,
  confirm_slug_change: z.boolean().optional(),
  short_description: text(400),
  overview: text(20000),
  icon: text(40),
  hero_media_url: optionalUrl,
  accent_key: z.enum(["", "build", "automate", "grow", "create"]),
  outcomes: linesField(20, 200),
  deliverables: linesField(20, 200),
  tools: linesField(30, 80),
  cta_label: text(60),
  is_featured: z.boolean(),
  sort_order: sortOrder,
  ...seoFields,
  capabilities: z
    .array(z.object({ id: childId, title: requiredText(160, "Capability title"), description: text(1000) }))
    .max(30),
  process_steps: z
    .array(z.object({ id: childId, title: requiredText(160, "Step title"), description: text(1000) }))
    .max(12),
  faqs: z
    .array(z.object({ id: childId, question: requiredText(300, "Question"), answer: text(4000) }))
    .max(30),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

// ---------------------------------------------------------------------------
// Media items shared by projects and case studies
// ---------------------------------------------------------------------------
export const mediaItemSchema = z
  .object({
    id: childId,
    media_type: z.enum(["image", "video", "embed"]),
    url: requiredUrl,
    thumbnail_url: optionalUrl,
    alt_text: text(300),
    caption: text(500),
  })
  .refine((m) => m.media_type !== "image" || m.alt_text.length > 0, {
    message: "Describe the image for screen readers.",
    path: ["alt_text"],
  });

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export const projectSchema = z
  .object({
    title: requiredText(160, "Title"),
    slug: slugField,
    confirm_slug_change: z.boolean().optional(),
    short_description: text(400),
    client_name: text(160),
    client_display_mode: displayModeField,
    cover_image_url: optionalUrl,
    cover_image_alt: text(300),
    hero_media_url: optionalUrl,
    project_type: text(120),
    challenge: text(20000),
    solution: text(20000),
    role_description: text(4000),
    responsibilities: linesField(20, 200),
    outcome: text(20000),
    is_featured: z.boolean(),
    featured_order: sortOrder,
    project_date: optionalDate,
    external_url: optionalUrl,
    github_url: optionalUrl,
    ...seoFields,
    service_ids: z.array(uuid).max(20),
    category_ids: z.array(uuid).max(20),
    technology_ids: z.array(uuid).max(50),
    media: z.array(mediaItemSchema).max(40),
  })
  .refine((p) => !p.cover_image_url || p.cover_image_alt.length > 0, {
    message: "Describe the cover image for screen readers.",
    path: ["cover_image_alt"],
  });
export type ProjectInput = z.infer<typeof projectSchema>;

// ---------------------------------------------------------------------------
// Case studies
// ---------------------------------------------------------------------------
export const metricSchema = z.object({
  id: childId,
  label: requiredText(80, "Label"),
  value: requiredText(60, "Value"),
  prefix: text(12),
  suffix: text(12),
  description: text(300),
  is_primary: z.boolean(),
});

export const caseStudySchema = z
  .object({
    title: requiredText(160, "Title"),
    slug: slugField,
    confirm_slug_change: z.boolean().optional(),
    short_description: text(400),
    result_headline: text(200),
    client_name: text(160),
    client_display_mode: displayModeField,
    client_descriptor: text(160),
    cover_image_url: optionalUrl,
    cover_image_alt: text(300),
    hero_media_url: optionalUrl,
    campaign_objective: text(200),
    challenge: text(20000),
    strategy: text(20000),
    creative_approach: text(20000),
    targeting_summary: text(20000),
    tracking_setup: text(20000),
    execution_summary: text(20000),
    optimization_summary: text(20000),
    results_summary: text(20000),
    learnings: text(20000),
    date_start: optionalDate,
    date_end: optionalDate,
    currency_code: z
      .string()
      .trim()
      .toUpperCase()
      .refine((v) => v === "" || /^[A-Z]{3}$/.test(v), { message: "Use a 3-letter code like USD or PHP." }),
    is_featured: z.boolean(),
    featured_order: sortOrder,
    ...seoFields,
    service_ids: z.array(uuid).max(20),
    platform_ids: z.array(uuid).max(20),
    category_ids: z.array(uuid).max(20),
    metrics: z.array(metricSchema).max(24),
    media: z.array(mediaItemSchema).max(40),
  })
  .refine((c) => !c.date_start || !c.date_end || c.date_end >= c.date_start, {
    message: "End date must be on or after the start date.",
    path: ["date_end"],
  })
  .refine((c) => !c.cover_image_url || c.cover_image_alt.length > 0, {
    message: "Describe the cover image for screen readers.",
    path: ["cover_image_alt"],
  });
export type CaseStudyInput = z.infer<typeof caseStudySchema>;

// ---------------------------------------------------------------------------
// Testimonials, social links, navigation
// ---------------------------------------------------------------------------
export const testimonialSchema = z.object({
  name: requiredText(120, "Name"),
  role: text(120),
  company: text(120),
  quote: requiredText(2000, "Quote"),
  avatar_url: optionalUrl,
  status: statusField,
  is_featured: z.boolean(),
  sort_order: sortOrder,
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const socialLinkSchema = z.object({
  platform: requiredText(40, "Platform"),
  label: requiredText(80, "Label"),
  url: z
    .string()
    .trim()
    .min(1, { message: "URL is required." })
    .max(500)
    .refine((v) => /^(https?:\/\/|mailto:)/i.test(v), { message: "Use a full https:// URL or mailto: link." }),
  is_active: z.boolean(),
  sort_order: sortOrder,
});
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;

export const navItemSchema = z.object({
  area: z.enum(["header", "footer"]),
  label: requiredText(60, "Label"),
  url: linkField,
  is_external: z.boolean(),
  is_active: z.boolean(),
  sort_order: sortOrder,
});
export type NavItemInput = z.infer<typeof navItemSchema>;

// ---------------------------------------------------------------------------
// Settings & profile
// ---------------------------------------------------------------------------
export const siteSettingsSchema = z.object({
  site_name: requiredText(120, "Site name"),
  site_description: text(500),
  default_seo_title: text(120),
  default_seo_description: text(320),
  default_og_image: optionalUrl,
  primary_cta_label: requiredText(60, "Button label"),
  primary_cta_url: linkField,
  footer_text: text(500),
  twitter_handle: z
    .string()
    .trim()
    .max(40)
    .refine((v) => v === "" || /^@?\w{1,30}$/.test(v), { message: "Use a handle like @yourname." }),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export const profileSchema = z.object({
  display_name: requiredText(120, "Name"),
  headline: text(200),
  short_bio: text(600),
  long_bio: text(20000),
  avatar_url: optionalUrl,
  resume_url: optionalUrl,
  location_label: text(120),
  availability_label: text(120),
  is_available: z.boolean(),
  email_public: optionalEmail,
  phone_public: text(40),
  skills: linesField(40, 80),
  stack_groups: z
    .array(z.object({ category: requiredText(80, "Category"), items: linesField(30, 80) }))
    .max(12),
  experience: z
    .array(
      z.object({
        role: requiredText(120, "Role"),
        organization: text(120),
        period: text(60),
        description: text(1000),
      }),
    )
    .max(30),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const contactSettingsSchema = z.object({
  primary_email: optionalEmail,
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((v) => v === "" || /^\+?[\d\s()-]{5,}$/.test(v), { message: "Use digits, spaces, +, ( ) or -." }),
  location_label: text(120),
  calendar_url: optionalUrl,
  contact_intro: text(1000),
  response_time_text: text(160),
  show_budget: z.boolean(),
  budget_ranges: linesField(12, 80),
});
export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>;

export const pageSettingsSchema = z.object({
  heading: text(200),
  intro: text(1000),
  ...seoFields,
});
export type PageSettingsInput = z.infer<typeof pageSettingsSchema>;

export const taxonomySchema = z.object({
  name: requiredText(80, "Name"),
  slug: slugField,
});
export type TaxonomyInput = z.infer<typeof taxonomySchema>;

export const inquiryStatusSchema = z.enum(["new", "read", "replied", "archived"]);

export const mediaRecordSchema = z.object({
  storage_path: z
    .string()
    .min(3)
    .max(500)
    .regex(/^[a-z-]+\/[0-9a-f-]{36}\/[\w.-]+$/i, { message: "Invalid storage path." }),
  file_name: requiredText(255, "File name"),
  mime_type: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
    "video/mp4",
    "video/webm",
    "application/pdf",
  ]),
  file_size: z.number().int().min(1).max(52428800),
  width: z.number().int().min(1).max(20000).nullable(),
  height: z.number().int().min(1).max(20000).nullable(),
  alt_text: text(300),
});
export type MediaRecordInput = z.infer<typeof mediaRecordSchema>;

// ---------------------------------------------------------------------------
// Homepage sections
// ---------------------------------------------------------------------------
const cta = z.object({ label: text(60), url: optionalLink });

export const homeSectionBaseSchema = z.object({
  eyebrow: text(80),
  heading: text(200),
  description: text(1000),
  is_visible: z.boolean(),
});

export const homeConfigSchemas = {
  hero: z.object({
    primary_cta: cta,
    secondary_cta: cta,
    show_availability: z.boolean(),
  }),
  expertise: z.object({
    items: z
      .array(
        z.object({
          key: z.enum(["build", "automate", "grow", "create"]),
          label: requiredText(60, "Label"),
          description: text(160),
        }),
      )
      .max(8),
  }),
  services: z.object({ service_ids: z.array(uuid).max(12) }),
  work: z.object({ project_ids: z.array(uuid).max(12), limit: z.number().int().min(1).max(12) }),
  case_study: z.object({ case_study_id: uuid.nullable() }),
  process: z.object({
    steps: z.array(z.object({ title: requiredText(80, "Step title"), description: text(400) })).max(8),
  }),
  stack: z.object({}),
  testimonials: z.object({ testimonial_ids: z.array(uuid).max(12) }),
  cta: z.object({ primary_cta: cta, secondary_cta: cta }),
} as const;

export type HomeConfigKey = keyof typeof homeConfigSchemas;
export type HomeConfig<K extends HomeConfigKey> = z.infer<(typeof homeConfigSchemas)[K]>;

// ---------------------------------------------------------------------------
// Public contact form
// ---------------------------------------------------------------------------
export const contactFormSchema = z.object({
  name: requiredText(120, "Your name"),
  email: z
    .string()
    .trim()
    .min(1, { message: "Your email is required." })
    .max(254)
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: "Enter a valid email address." }),
  company: text(160),
  service_id: z.union([z.literal(""), uuid]),
  budget_range: text(80),
  message: z
    .string()
    .trim()
    .min(10, { message: "Add a little more detail (at least 10 characters)." })
    .max(5000, { message: "Keep the message under 5,000 characters." }),
  // Anti-spam: hidden honeypot must stay empty; timestamp proves a human-speed fill.
  website: z.string().max(500).optional(),
  started_at: z.number().int(),
  source_page: text(300),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;
