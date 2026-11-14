-- Homepage module: a featured video (for example a client video review).
-- Config: { "video_url": "", "poster_url": "", "caption": "" }. The section renders nothing until a video is set.

alter table public.home_sections drop constraint if exists home_sections_section_key_check;
alter table public.home_sections add constraint home_sections_section_key_check check (section_key in (
  'hero', 'brands', 'expertise', 'intro', 'services', 'work', 'case_study', 'process', 'stack', 'video', 'testimonials', 'cta'
));

-- Place the video just before the testimonials when the order is still the default;
-- otherwise append it so a customised order is respected.
do $$
declare
  untouched boolean;
begin
  select coalesce(bool_and(sort_order = case section_key
    when 'hero' then 1 when 'brands' then 2 when 'expertise' then 3 when 'intro' then 4 when 'services' then 5
    when 'work' then 6 when 'case_study' then 7 when 'process' then 8 when 'stack' then 9 when 'testimonials' then 10
    when 'cta' then 11 end), true)
  into untouched
  from public.home_sections;

  if untouched then
    update public.home_sections set sort_order = case section_key
      when 'testimonials' then 11 when 'cta' then 12 else sort_order end;
    insert into public.home_sections (section_key, eyebrow, heading, is_visible, sort_order, config) values
      ('video', 'Client review', 'Hear it from a client', true, 10, '{"video_url": "", "poster_url": "", "caption": ""}'::jsonb)
    on conflict (section_key) do nothing;
  else
    insert into public.home_sections (section_key, eyebrow, heading, is_visible, sort_order, config) values
      ('video', 'Client review', 'Hear it from a client', true, 102, '{"video_url": "", "poster_url": "", "caption": ""}'::jsonb)
    on conflict (section_key) do nothing;
  end if;
end;
$$;
