-- =============================================================================
-- Portfolio CMS — core schema
-- Tables, enums, constraints, indexes and updated_at triggers.
-- Row Level Security policies live in the next migration.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.client_display_mode as enum ('public', 'anonymized', 'hidden');
create type public.media_kind as enum ('image', 'video', 'embed');
create type public.inquiry_status as enum ('new', 'read', 'replied', 'archived');
create type public.nav_area as enum ('header', 'footer');
create type public.admin_role as enum ('admin', 'editor');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Slug format shared by every slugged table.
-- lowercase letters/digits separated by single hyphens, 1–120 chars.

-- ---------------------------------------------------------------------------
-- Authorization: allowlisted CMS users.
-- Public sign-up never creates a row here, so signing up grants no access.
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.admin_role not null default 'admin',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Singletons: site settings, profile, contact settings
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton),
  site_name text not null default 'Portfolio' check (char_length(site_name) <= 120),
  site_description text not null default '' check (char_length(site_description) <= 500),
  default_seo_title text not null default '' check (char_length(default_seo_title) <= 120),
  default_seo_description text not null default '' check (char_length(default_seo_description) <= 320),
  default_og_image text,
  primary_cta_label text not null default 'Start a project' check (char_length(primary_cta_label) <= 60),
  primary_cta_url text not null default '/contact',
  footer_text text not null default '' check (char_length(footer_text) <= 500),
  twitter_handle text check (twitter_handle is null or char_length(twitter_handle) <= 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton),
  display_name text not null default '' check (char_length(display_name) <= 120),
  headline text not null default '' check (char_length(headline) <= 200),
  short_bio text not null default '' check (char_length(short_bio) <= 600),
  long_bio text not null default '' check (char_length(long_bio) <= 20000),
  avatar_url text,
  resume_url text,
  location_label text,
  availability_label text,
  is_available boolean not null default true,
  email_public text,
  phone_public text,
  skills text[] not null default '{}',
  -- [{ "category": "Development", "items": ["Next.js", "PostgreSQL"] }]
  stack_groups jsonb not null default '[]'::jsonb check (jsonb_typeof(stack_groups) = 'array'),
  -- [{ "role": "", "organization": "", "period": "", "description": "" }]
  experience jsonb not null default '[]'::jsonb check (jsonb_typeof(experience) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton),
  primary_email text not null default '',
  phone text,
  location_label text,
  calendar_url text,
  contact_intro text not null default '' check (char_length(contact_intro) <= 1000),
  response_time_text text,
  show_budget boolean not null default true,
  budget_ranges text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  short_description text not null default '' check (char_length(short_description) <= 400),
  overview text not null default '' check (char_length(overview) <= 20000),
  icon text,
  hero_media_url text,
  accent_key text check (accent_key is null or accent_key in ('build', 'automate', 'grow', 'create')),
  outcomes text[] not null default '{}',
  deliverables text[] not null default '{}',
  tools text[] not null default '{}',
  cta_label text check (cta_label is null or char_length(cta_label) <= 60),
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  og_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_capabilities (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 1000),
  icon text,
  sort_order integer not null default 0
);

create table public.service_process_steps (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  step_number integer not null default 1,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 1000),
  sort_order integer not null default 0
);

create table public.service_faqs (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  question text not null check (char_length(question) between 1 and 300),
  answer text not null default '' check (char_length(answer) <= 4000),
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Taxonomies
-- ---------------------------------------------------------------------------
create table public.project_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  icon_url text,
  created_at timestamptz not null default now()
);

create table public.ad_platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table public.case_study_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Projects (general portfolio work)
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  short_description text not null default '' check (char_length(short_description) <= 400),
  client_name text,
  client_display_mode public.client_display_mode not null default 'public',
  cover_image_url text,
  cover_image_alt text,
  hero_media_url text,
  project_type text not null default '' check (char_length(project_type) <= 120),
  challenge text not null default '' check (char_length(challenge) <= 20000),
  solution text not null default '' check (char_length(solution) <= 20000),
  role_description text not null default '' check (char_length(role_description) <= 4000),
  responsibilities text[] not null default '{}',
  outcome text not null default '' check (char_length(outcome) <= 20000),
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  featured_order integer,
  project_date date,
  external_url text,
  github_url text,
  seo_title text,
  seo_description text,
  og_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_services (
  project_id uuid not null references public.projects (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (project_id, service_id)
);

create table public.project_category_map (
  project_id uuid not null references public.projects (id) on delete cascade,
  category_id uuid not null references public.project_categories (id) on delete cascade,
  primary key (project_id, category_id)
);

create table public.project_technologies (
  project_id uuid not null references public.projects (id) on delete cascade,
  technology_id uuid not null references public.technologies (id) on delete cascade,
  primary key (project_id, technology_id)
);

create table public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  media_type public.media_kind not null default 'image',
  url text not null,
  thumbnail_url text,
  alt_text text not null default '' check (char_length(alt_text) <= 300),
  caption text check (caption is null or char_length(caption) <= 500),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Advertising case studies
-- ---------------------------------------------------------------------------
create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  short_description text not null default '' check (char_length(short_description) <= 400),
  result_headline text check (result_headline is null or char_length(result_headline) <= 200),
  client_name text,
  client_display_mode public.client_display_mode not null default 'anonymized',
  client_descriptor text check (client_descriptor is null or char_length(client_descriptor) <= 160),
  cover_image_url text,
  cover_image_alt text,
  hero_media_url text,
  campaign_objective text not null default '' check (char_length(campaign_objective) <= 200),
  challenge text not null default '' check (char_length(challenge) <= 20000),
  strategy text not null default '' check (char_length(strategy) <= 20000),
  creative_approach text not null default '' check (char_length(creative_approach) <= 20000),
  targeting_summary text not null default '' check (char_length(targeting_summary) <= 20000),
  tracking_setup text not null default '' check (char_length(tracking_setup) <= 20000),
  execution_summary text not null default '' check (char_length(execution_summary) <= 20000),
  optimization_summary text not null default '' check (char_length(optimization_summary) <= 20000),
  results_summary text not null default '' check (char_length(results_summary) <= 20000),
  learnings text not null default '' check (char_length(learnings) <= 20000),
  date_start date,
  date_end date,
  currency_code text check (currency_code is null or currency_code ~ '^[A-Z]{3}$'),
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  featured_order integer,
  seo_title text,
  seo_description text,
  og_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_study_dates check (date_end is null or date_start is null or date_end >= date_start)
);

create table public.case_study_services (
  case_study_id uuid not null references public.case_studies (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (case_study_id, service_id)
);

create table public.case_study_platforms (
  case_study_id uuid not null references public.case_studies (id) on delete cascade,
  platform_id uuid not null references public.ad_platforms (id) on delete cascade,
  primary key (case_study_id, platform_id)
);

create table public.case_study_category_map (
  case_study_id uuid not null references public.case_studies (id) on delete cascade,
  category_id uuid not null references public.case_study_categories (id) on delete cascade,
  primary key (case_study_id, category_id)
);

create table public.case_study_metrics (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references public.case_studies (id) on delete cascade,
  metric_key text not null default '' check (char_length(metric_key) <= 60),
  label text not null check (char_length(label) between 1 and 80),
  value_numeric numeric,
  value_text text not null default '' check (char_length(value_text) <= 60),
  prefix text check (prefix is null or char_length(prefix) <= 12),
  suffix text check (suffix is null or char_length(suffix) <= 12),
  description text check (description is null or char_length(description) <= 300),
  is_primary boolean not null default false,
  sort_order integer not null default 0
);

create table public.case_study_media (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references public.case_studies (id) on delete cascade,
  media_type public.media_kind not null default 'image',
  url text not null,
  thumbnail_url text,
  alt_text text not null default '' check (char_length(alt_text) <= 300),
  caption text check (caption is null or char_length(caption) <= 500),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Testimonials, social, navigation
-- ---------------------------------------------------------------------------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  role text check (role is null or char_length(role) <= 120),
  company text check (company is null or char_length(company) <= 120),
  quote text not null check (char_length(quote) between 1 and 2000),
  avatar_url text,
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (char_length(platform) between 1 and 40),
  label text not null check (char_length(label) between 1 and 80),
  url text not null check (url ~* '^(https?://|mailto:)'),
  icon text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  area public.nav_area not null,
  label text not null check (char_length(label) between 1 and 60),
  url text not null check (char_length(url) <= 500),
  is_external boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Homepage modules & per-page settings
-- ---------------------------------------------------------------------------
create table public.home_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique check (section_key in (
    'hero', 'expertise', 'services', 'work', 'case_study', 'process', 'stack', 'testimonials', 'cta'
  )),
  heading text,
  eyebrow text,
  description text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Static public pages: heading/intro copy and per-page SEO.
create table public.page_settings (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique check (page_key in (
    'home', 'services', 'work', 'case_studies', 'about', 'contact'
  )),
  heading text,
  intro text,
  seo_title text,
  seo_description text,
  og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Inquiries
-- ---------------------------------------------------------------------------
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company text check (company is null or char_length(company) <= 160),
  service_id uuid references public.services (id) on delete set null,
  budget_range text check (budget_range is null or char_length(budget_range) <= 80),
  message text not null check (char_length(message) between 10 and 5000),
  status public.inquiry_status not null default 'new',
  source_page text check (source_page is null or char_length(source_page) <= 300),
  ip_hash text check (ip_hash is null or char_length(ip_hash) <= 128),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Media library & audit log
-- ---------------------------------------------------------------------------
create table public.media_library (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text not null,
  file_name text not null check (char_length(file_name) <= 255),
  mime_type text not null,
  file_size bigint not null check (file_size >= 0),
  width integer,
  height integer,
  alt_text text check (alt_text is null or char_length(alt_text) <= 300),
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  action text not null check (char_length(action) <= 60),
  entity_type text not null check (char_length(entity_type) <= 60),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index services_status_sort_idx on public.services (status, sort_order);
create index services_featured_idx on public.services (is_featured) where is_featured;
create index service_capabilities_service_idx on public.service_capabilities (service_id, sort_order);
create index service_process_steps_service_idx on public.service_process_steps (service_id, sort_order);
create index service_faqs_service_idx on public.service_faqs (service_id, sort_order);

create index projects_status_idx on public.projects (status);
create index projects_featured_idx on public.projects (is_featured, featured_order) where is_featured;
create index projects_date_idx on public.projects (project_date desc nulls last);
create index projects_created_idx on public.projects (created_at desc);
create index project_services_service_idx on public.project_services (service_id);
create index project_category_map_category_idx on public.project_category_map (category_id);
create index project_technologies_technology_idx on public.project_technologies (technology_id);
create index project_media_project_idx on public.project_media (project_id, sort_order);

create index case_studies_status_idx on public.case_studies (status);
create index case_studies_featured_idx on public.case_studies (is_featured, featured_order) where is_featured;
create index case_studies_created_idx on public.case_studies (created_at desc);
create index case_study_services_service_idx on public.case_study_services (service_id);
create index case_study_platforms_platform_idx on public.case_study_platforms (platform_id);
create index case_study_category_map_category_idx on public.case_study_category_map (category_id);
create index case_study_metrics_case_idx on public.case_study_metrics (case_study_id, sort_order);
create index case_study_media_case_idx on public.case_study_media (case_study_id, sort_order);

create index testimonials_status_sort_idx on public.testimonials (status, sort_order);
create index social_links_active_sort_idx on public.social_links (is_active, sort_order);
create index navigation_items_area_sort_idx on public.navigation_items (area, is_active, sort_order);
create index home_sections_sort_idx on public.home_sections (sort_order);

create index inquiries_status_created_idx on public.inquiries (status, created_at desc);
create index inquiries_created_idx on public.inquiries (created_at desc);
create index inquiries_ip_hash_created_idx on public.inquiries (ip_hash, created_at desc);
create index inquiries_service_idx on public.inquiries (service_id);

create index media_library_created_idx on public.media_library (created_at desc);
create index media_library_uploaded_by_idx on public.media_library (uploaded_by);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_user_idx on public.audit_logs (user_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'profiles', 'contact_settings', 'services', 'projects', 'case_studies',
    'testimonials', 'social_links', 'navigation_items', 'home_sections', 'page_settings',
    'inquiries', 'media_library'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- published_at: stamp the first time a record is published.
-- ---------------------------------------------------------------------------
create or replace function public.set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger services_set_published_at before insert or update on public.services
  for each row execute function public.set_published_at();
create trigger projects_set_published_at before insert or update on public.projects
  for each row execute function public.set_published_at();
create trigger case_studies_set_published_at before insert or update on public.case_studies
  for each row execute function public.set_published_at();
