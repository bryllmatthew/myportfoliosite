-- =============================================================================
-- Portfolio CMS — authorization, grants and Row Level Security
--
-- Model:
--   * anon / authenticated (non-admin) may read ONLY published / active content.
--   * Users listed in public.admin_users may manage CMS content.
--   * Inquiries are write-only for the public, through public.submit_inquiry().
--
-- Table privileges are granted explicitly (defense in depth) instead of relying
-- on platform default privileges. RLS is enabled on every table.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Authorization helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = (select auth.uid())
  );
$$;

comment on function public.is_admin() is
  'True when the current JWT subject is an allowlisted CMS user. Extend with role checks when editor permissions diverge.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Baseline privileges
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
revoke all on all tables in schema public from anon, authenticated;

-- Public-readable content tables (rows are still filtered by RLS).
grant select on
  public.site_settings,
  public.profiles,
  public.contact_settings,
  public.services,
  public.service_capabilities,
  public.service_process_steps,
  public.service_faqs,
  public.project_categories,
  public.technologies,
  public.ad_platforms,
  public.case_study_categories,
  public.projects,
  public.project_services,
  public.project_category_map,
  public.project_technologies,
  public.project_media,
  public.case_studies,
  public.case_study_services,
  public.case_study_platforms,
  public.case_study_category_map,
  public.case_study_metrics,
  public.case_study_media,
  public.testimonials,
  public.social_links,
  public.navigation_items,
  public.home_sections,
  public.page_settings
to anon, authenticated;

-- CMS write access is only ever exercised by authenticated admins (RLS enforces it).
grant insert, update, delete on
  public.site_settings,
  public.profiles,
  public.contact_settings,
  public.services,
  public.service_capabilities,
  public.service_process_steps,
  public.service_faqs,
  public.project_categories,
  public.technologies,
  public.ad_platforms,
  public.case_study_categories,
  public.projects,
  public.project_services,
  public.project_category_map,
  public.project_technologies,
  public.project_media,
  public.case_studies,
  public.case_study_services,
  public.case_study_platforms,
  public.case_study_category_map,
  public.case_study_metrics,
  public.case_study_media,
  public.testimonials,
  public.social_links,
  public.navigation_items,
  public.home_sections,
  public.page_settings
to authenticated;

-- Admin-only tables: no anon privileges at all.
grant select, update, delete on public.inquiries to authenticated;
grant select, insert, update, delete on public.media_library to authenticated;
grant select, insert on public.audit_logs to authenticated;
grant select on public.admin_users to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'admin_users', 'site_settings', 'profiles', 'contact_settings',
    'services', 'service_capabilities', 'service_process_steps', 'service_faqs',
    'project_categories', 'technologies', 'ad_platforms', 'case_study_categories',
    'projects', 'project_services', 'project_category_map', 'project_technologies', 'project_media',
    'case_studies', 'case_study_services', 'case_study_platforms', 'case_study_category_map',
    'case_study_metrics', 'case_study_media',
    'testimonials', 'social_links', 'navigation_items', 'home_sections', 'page_settings',
    'inquiries', 'media_library', 'audit_logs'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_users: a signed-in user may see only their own allowlist row.
-- No insert/update/delete policies: membership is managed with the service
-- role (scripts/create-admin.mjs) or the SQL editor.
-- ---------------------------------------------------------------------------
create policy "admin_users: read own row" on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Generic admin write policy for every CMS table
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'profiles', 'contact_settings',
    'services', 'service_capabilities', 'service_process_steps', 'service_faqs',
    'project_categories', 'technologies', 'ad_platforms', 'case_study_categories',
    'projects', 'project_services', 'project_category_map', 'project_technologies', 'project_media',
    'case_studies', 'case_study_services', 'case_study_platforms', 'case_study_category_map',
    'case_study_metrics', 'case_study_media',
    'testimonials', 'social_links', 'navigation_items', 'home_sections', 'page_settings',
    'media_library'
  ]
  loop
    execute format($f$
      create policy "%1$s: admin insert" on public.%1$I
        for insert to authenticated with check ((select public.is_admin()));
      create policy "%1$s: admin update" on public.%1$I
        for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
      create policy "%1$s: admin delete" on public.%1$I
        for delete to authenticated using ((select public.is_admin()));
    $f$, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Public read policies
-- ---------------------------------------------------------------------------

-- Singletons & always-public configuration.
create policy "site_settings: public read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "profiles: public read" on public.profiles
  for select to anon, authenticated using (true);
create policy "contact_settings: public read" on public.contact_settings
  for select to anon, authenticated using (true);
create policy "home_sections: public read" on public.home_sections
  for select to anon, authenticated using (true);
create policy "page_settings: public read" on public.page_settings
  for select to anon, authenticated using (true);

-- Taxonomies.
create policy "project_categories: public read" on public.project_categories
  for select to anon, authenticated using (true);
create policy "technologies: public read" on public.technologies
  for select to anon, authenticated using (true);
create policy "ad_platforms: public read" on public.ad_platforms
  for select to anon, authenticated using (true);
create policy "case_study_categories: public read" on public.case_study_categories
  for select to anon, authenticated using (true);

-- Status-gated content: published rows for everyone, everything for admins.
create policy "services: read published or admin" on public.services
  for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

create policy "projects: read published or admin" on public.projects
  for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

create policy "case_studies: read published or admin" on public.case_studies
  for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

create policy "testimonials: read published or admin" on public.testimonials
  for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

-- Active-gated content.
create policy "social_links: read active or admin" on public.social_links
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));

create policy "navigation_items: read active or admin" on public.navigation_items
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));

-- Child rows inherit visibility from their published parent.
create policy "service_capabilities: read via published service" on public.service_capabilities
  for select to anon, authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.services s where s.id = service_id and s.status = 'published'));

create policy "service_process_steps: read via published service" on public.service_process_steps
  for select to anon, authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.services s where s.id = service_id and s.status = 'published'));

create policy "service_faqs: read via published service" on public.service_faqs
  for select to anon, authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.services s where s.id = service_id and s.status = 'published'));

create policy "project_services: read via published project" on public.project_services
  for select to anon, authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.projects p where p.id = project_id and p.status = 'published'));

create policy "project_category_map: read via published project" on public.project_category_map
  for select to anon, authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.projects p where p.id = project_id and p.status = 'published'));

create policy "project_technologies: read via published project" on public.project_technologies
  for select to anon, authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.projects p where p.id = project_id and p.status = 'published'));

create policy "project_media: read via published project" on public.project_media
  for select to anon, authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.projects p where p.id = project_id and p.status = 'published'));

create policy "case_study_services: read via published case study" on public.case_study_services
  for select to anon, authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.case_studies c where c.id = case_study_id and c.status = 'published'));

create policy "case_study_platforms: read via published case study" on public.case_study_platforms
  for select to anon, authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.case_studies c where c.id = case_study_id and c.status = 'published'));

create policy "case_study_category_map: read via published case study" on public.case_study_category_map
  for select to anon, authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.case_studies c where c.id = case_study_id and c.status = 'published'));

create policy "case_study_metrics: read via published case study" on public.case_study_metrics
  for select to anon, authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.case_studies c where c.id = case_study_id and c.status = 'published'));

create policy "case_study_media: read via published case study" on public.case_study_media
  for select to anon, authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.case_studies c where c.id = case_study_id and c.status = 'published'));

-- Admin-only reads.
create policy "media_library: admin read" on public.media_library
  for select to authenticated using ((select public.is_admin()));

create policy "inquiries: admin read" on public.inquiries
  for select to authenticated using ((select public.is_admin()));
create policy "inquiries: admin update" on public.inquiries
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "inquiries: admin delete" on public.inquiries
  for delete to authenticated using ((select public.is_admin()));

create policy "audit_logs: admin read" on public.audit_logs
  for select to authenticated using ((select public.is_admin()));
create policy "audit_logs: admin insert own" on public.audit_logs
  for insert to authenticated
  with check ((select public.is_admin()) and user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Public inquiry submission
--
-- There is intentionally NO insert policy on public.inquiries for anon.
-- The only public write path is this function, which validates input,
-- enforces per-client and global rate limits, and always stores status 'new'.
-- ---------------------------------------------------------------------------
create or replace function public.submit_inquiry(
  p_name text,
  p_email text,
  p_message text,
  p_company text default null,
  p_service_id uuid default null,
  p_budget_range text default null,
  p_source_page text default null,
  p_client_hash text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_service uuid;
begin
  p_name := nullif(btrim(coalesce(p_name, '')), '');
  p_email := lower(nullif(btrim(coalesce(p_email, '')), ''));
  p_message := nullif(btrim(coalesce(p_message, '')), '');
  p_company := nullif(btrim(coalesce(p_company, '')), '');
  p_budget_range := nullif(btrim(coalesce(p_budget_range, '')), '');
  p_source_page := nullif(left(btrim(coalesce(p_source_page, '')), 300), '');
  p_client_hash := nullif(left(btrim(coalesce(p_client_hash, '')), 128), '');

  if p_name is null or char_length(p_name) > 120 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if p_email is null or char_length(p_email) > 254 or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;
  if p_message is null or char_length(p_message) < 10 or char_length(p_message) > 5000 then
    raise exception 'invalid_message' using errcode = '22023';
  end if;
  if p_company is not null and char_length(p_company) > 160 then
    raise exception 'invalid_company' using errcode = '22023';
  end if;
  if p_budget_range is not null and char_length(p_budget_range) > 80 then
    raise exception 'invalid_budget' using errcode = '22023';
  end if;

  -- Never trust a client-provided foreign key: only published services are accepted.
  if p_service_id is not null then
    select s.id into v_service from public.services s
    where s.id = p_service_id and s.status = 'published';
  end if;

  -- Rate limits: 3 per client per 10 minutes, 60 site-wide per hour.
  if p_client_hash is not null and (
    select count(*) from public.inquiries i
    where i.ip_hash = p_client_hash and i.created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  if (
    select count(*) from public.inquiries i
    where i.created_at > now() - interval '1 hour'
  ) >= 60 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.inquiries (name, email, company, service_id, budget_range, message, status, source_page, ip_hash)
  values (p_name, p_email, p_company, v_service, p_budget_range, p_message, 'new', p_source_page, p_client_hash)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_inquiry(text, text, text, text, uuid, text, text, text) from public;
grant execute on function public.submit_inquiry(text, text, text, text, uuid, text, text, text) to anon, authenticated;
