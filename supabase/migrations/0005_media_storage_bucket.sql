-- Public "media" bucket for admin-uploaded photos (gallery, story, etc.).
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Anyone can read media objects (the bucket is public; this also enables listing).
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select
  using (bucket_id = 'media');

-- Only signed-in admins may upload / replace / delete.
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
