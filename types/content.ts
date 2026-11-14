/**
 * Domain types for CMS content. These mirror the columns defined in
 * supabase/migrations. Query functions map raw rows into these shapes.
 */

export type ContentStatus = "draft" | "published" | "archived";
export type ClientDisplayMode = "public" | "anonymized" | "hidden";
export type MediaKind = "image" | "video" | "embed";
export type InquiryStatus = "new" | "read" | "replied" | "archived";
export type NavArea = "header" | "footer";
export type AccentKey = "build" | "automate" | "grow" | "create";

export interface CtaLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  default_seo_title: string;
  default_seo_description: string;
  default_og_image: string | null;
  primary_cta_label: string;
  primary_cta_url: string;
  footer_text: string;
  twitter_handle: string | null;
  updated_at: string;
}

export interface StackGroup {
  category: string;
  items: string[];
}

export interface ExperienceItem {
  role: string;
  organization: string;
  period: string;
  description: string;
}

export interface Profile {
  id: string;
  display_name: string;
  headline: string;
  short_bio: string;
  long_bio: string;
  avatar_url: string | null;
  resume_url: string | null;
  location_label: string | null;
  availability_label: string | null;
  is_available: boolean;
  email_public: string | null;
  phone_public: string | null;
  skills: string[];
  stack_groups: StackGroup[];
  experience: ExperienceItem[];
  updated_at: string;
}

export interface ContactSettings {
  id: string;
  primary_email: string;
  phone: string | null;
  location_label: string | null;
  calendar_url: string | null;
  contact_intro: string;
  response_time_text: string | null;
  show_budget: boolean;
  budget_ranges: string[];
  updated_at: string;
}

export interface ServiceCapability {
  id: string;
  service_id: string;
  title: string;
  description: string;
  icon: string | null;
  sort_order: number;
}

export interface ServiceProcessStep {
  id: string;
  service_id: string;
  step_number: number;
  title: string;
  description: string;
  sort_order: number;
}

export interface ServiceFaq {
  id: string;
  service_id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  overview: string;
  icon: string | null;
  hero_media_url: string | null;
  accent_key: AccentKey | null;
  outcomes: string[];
  deliverables: string[];
  tools: string[];
  cta_label: string | null;
  status: ContentStatus;
  sort_order: number;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceWithChildren extends Service {
  capabilities: ServiceCapability[];
  process_steps: ServiceProcessStep[];
  faqs: ServiceFaq[];
}

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
}

export interface MediaItem {
  id: string;
  media_type: MediaKind;
  url: string;
  thumbnail_url: string | null;
  alt_text: string;
  caption: string | null;
  sort_order: number;
}

export interface ServiceRef {
  id: string;
  title: string;
  slug: string;
  accent_key: AccentKey | null;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  client_name: string | null;
  client_display_mode: ClientDisplayMode;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  hero_media_url: string | null;
  project_type: string;
  challenge: string;
  solution: string;
  role_description: string;
  responsibilities: string[];
  outcome: string;
  status: ContentStatus;
  is_featured: boolean;
  featured_order: number | null;
  project_date: string | null;
  external_url: string | null;
  github_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithRelations extends Project {
  services: ServiceRef[];
  categories: Taxonomy[];
  technologies: Taxonomy[];
  media: MediaItem[];
}

export interface CaseStudyMetric {
  id: string;
  case_study_id: string;
  metric_key: string;
  label: string;
  value_numeric: number | null;
  value_text: string;
  prefix: string | null;
  suffix: string | null;
  description: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  result_headline: string | null;
  client_name: string | null;
  client_display_mode: ClientDisplayMode;
  client_descriptor: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  hero_media_url: string | null;
  campaign_objective: string;
  challenge: string;
  strategy: string;
  creative_approach: string;
  targeting_summary: string;
  tracking_setup: string;
  execution_summary: string;
  optimization_summary: string;
  results_summary: string;
  learnings: string;
  date_start: string | null;
  date_end: string | null;
  currency_code: string | null;
  status: ContentStatus;
  is_featured: boolean;
  featured_order: number | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseStudyWithRelations extends CaseStudy {
  services: ServiceRef[];
  platforms: Taxonomy[];
  categories: Taxonomy[];
  metrics: CaseStudyMetric[];
  media: MediaItem[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  avatar_url: string | null;
  status: ContentStatus;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface NavigationItem {
  id: string;
  area: NavArea;
  label: string;
  url: string;
  is_external: boolean;
  is_active: boolean;
  sort_order: number;
}

export type HomeSectionKey =
  | "hero"
  | "brands"
  | "intro"
  | "expertise"
  | "services"
  | "work"
  | "case_study"
  | "process"
  | "stack"
  | "video"
  | "testimonials"
  | "cta";

export interface HomeSection {
  id: string;
  section_key: HomeSectionKey;
  heading: string | null;
  eyebrow: string | null;
  description: string | null;
  is_visible: boolean;
  sort_order: number;
  config: Record<string, unknown>;
  updated_at: string;
}

export type PageKey = "home" | "services" | "work" | "case_studies" | "about" | "contact";

export interface PageSettings {
  id: string;
  page_key: PageKey;
  heading: string | null;
  intro: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service_id: string | null;
  budget_range: string | null;
  message: string;
  status: InquiryStatus;
  source_page: string | null;
  created_at: string;
  updated_at: string;
  service?: { title: string } | null;
}

export interface MediaLibraryItem {
  id: string;
  storage_path: string;
  public_url: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/** Result shape returned by every server action. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export type ActionFailure = Extract<ActionResult, { ok: false }>;
