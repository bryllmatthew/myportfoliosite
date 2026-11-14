-- =============================================================================
-- Portfolio CMS — Storage
-- Bucket "public-media": public read, admin-only write/delete.
-- Size and MIME limits are enforced by Storage itself (not only the UI).
-- Paths follow {entity}/{uuid}/{filename}.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-media',
  'public-media',
  true,
  52428800, -- 50 MB (images are further limited to 10 MB in the app)
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
    'video/mp4', 'video/webm',
    'application/pdf'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public buckets serve objects through the public URL without a select policy.
-- Listing objects through the API is restricted to admins.
create policy "public-media: admin list"
  on storage.objects for select to authenticated
  using (bucket_id = 'public-media' and (select public.is_admin()));

create policy "public-media: admin upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'public-media' and (select public.is_admin()));

create policy "public-media: admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'public-media' and (select public.is_admin()))
  with check (bucket_id = 'public-media' and (select public.is_admin()));

create policy "public-media: admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'public-media' and (select public.is_admin()));
