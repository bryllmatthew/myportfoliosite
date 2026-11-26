-- Homepage module: an auto-sliding carousel of vertical (9:16) videos.
-- Config: { "items": [{ "video_url", "poster_url", "title", "link" }], "autoplay": true }.
-- The section renders nothing until it has at least one video.

alter table public.home_sections drop constraint if exists home_sections_section_key_check;
alter table public.home_sections add constraint home_sections_section_key_check check (section_key in (
  'hero', 'brands', 'expertise', 'intro', 'services', 'work', 'reels', 'case_study', 'process', 'stack', 'video', 'testimonials', 'cta'
));

-- Place the carousel right after "Selected work" when the order is still the default;
-- otherwise append it so a customised order is respected.
do $$
declare
  untouched boolean;
begin
  select coalesce(bool_and(sort_order = case section_key
    when 'hero' then 1 when 'brands' then 2 when 'expertise' then 3 when 'intro' then 4 when 'services' then 5
    when 'work' then 6 when 'case_study' then 7 when 'process' then 8 when 'stack' then 9 when 'video' then 10
    when 'testimonials' then 11 when 'cta' then 12 end), true)
  into untouched
  from public.home_sections;

  if untouched then
    update public.home_sections set sort_order = sort_order + 1 where sort_order >= 7;
    insert into public.home_sections (section_key, eyebrow, heading, description, is_visible, sort_order, config) values
      ('reels', 'Short-form video', 'Made for TikTok, Reels and Shorts',
       'A selection of vertical videos: product ads, UGC edits and AI commercials.', true, 7,
       '{"items": [], "autoplay": true}'::jsonb)
    on conflict (section_key) do nothing;
  else
    insert into public.home_sections (section_key, eyebrow, heading, description, is_visible, sort_order, config) values
      ('reels', 'Short-form video', 'Made for TikTok, Reels and Shorts',
       'A selection of vertical videos: product ads, UGC edits and AI commercials.', true, 103,
       '{"items": [], "autoplay": true}'::jsonb)
    on conflict (section_key) do nothing;
  end if;
end;
$$;
