-- =============================================================================
-- Brands ("Brands I've worked with") and the homepage introduction section.
-- =============================================================================

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  logo_url text,
  website_url text check (website_url is null or website_url ~* '^https?://'),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index brands_active_sort_idx on public.brands (is_active, sort_order);

create trigger brands_set_updated_at before update on public.brands
  for each row execute function public.set_updated_at();

alter table public.brands enable row level security;

grant select on public.brands to anon, authenticated;
grant insert, update, delete on public.brands to authenticated;

create policy "brands: read active or admin" on public.brands
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "brands: admin insert" on public.brands
  for insert to authenticated with check ((select public.is_admin()));
create policy "brands: admin update" on public.brands
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "brands: admin delete" on public.brands
  for delete to authenticated using ((select public.is_admin()));

-- Homepage modules: add "intro" (photo + short bio) and "brands".
alter table public.home_sections drop constraint if exists home_sections_section_key_check;
alter table public.home_sections add constraint home_sections_section_key_check check (section_key in (
  'hero', 'brands', 'expertise', 'intro', 'services', 'work', 'case_study', 'process', 'stack', 'testimonials', 'cta'
));

-- Place the new modules after the hero when the original order is untouched;
-- otherwise append them so a customised order is respected.
do $$
declare
  untouched boolean;
begin
  select coalesce(bool_and(sort_order = case section_key
    when 'hero' then 1 when 'expertise' then 2 when 'services' then 3 when 'work' then 4
    when 'case_study' then 5 when 'process' then 6 when 'stack' then 7 when 'testimonials' then 8
    when 'cta' then 9 end), true)
  into untouched
  from public.home_sections;

  if untouched then
    update public.home_sections set sort_order = case section_key
      when 'hero' then 1 when 'expertise' then 3 when 'services' then 5 when 'work' then 6
      when 'case_study' then 7 when 'process' then 8 when 'stack' then 9 when 'testimonials' then 10
      when 'cta' then 11 else sort_order end;
    insert into public.home_sections (section_key, heading, is_visible, sort_order, config) values
      ('brands', 'Brands I''ve worked with', true, 2, '{}'::jsonb),
      ('intro', 'Hi, I''m Bryll Matthew', true, 4, '{"cta": {"label": "More about me", "url": "/about"}}'::jsonb)
    on conflict (section_key) do nothing;
  else
    insert into public.home_sections (section_key, heading, is_visible, sort_order, config) values
      ('brands', 'Brands I''ve worked with', true, 100, '{}'::jsonb),
      ('intro', 'Hi, I''m Bryll Matthew', true, 101, '{"cta": {"label": "More about me", "url": "/about"}}'::jsonb)
    on conflict (section_key) do nothing;
  end if;
end;
$$;
