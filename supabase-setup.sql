-- =====================================================================
-- Lumine Studio — Supabase setup
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run
-- It is safe to run again (idempotent).
-- =====================================================================

-- ---------- Tables ----------
create table if not exists public.session_items (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null check (session_id in ('models', 'locations')),
  title       text not null default '',
  note        text not null default '',
  image_url   text not null,
  video_url   text,
  details     text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists public.session_item_photos (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.session_items (id) on delete cascade,
  image_url   text not null,
  created_at  timestamptz not null default now()
);

create index if not exists session_items_session_created_idx
  on public.session_items (session_id, created_at);
create index if not exists session_item_photos_item_created_idx
  on public.session_item_photos (item_id, created_at);

-- ---------- Row Level Security ----------
-- Everyone (anon + logged in) can READ. Only a signed-in user can WRITE.
-- IMPORTANT: Authentication → Providers → Email → turn OFF "Allow new users to sign up",
-- then create your single admin user manually (Authentication → Users → Add user).
alter table public.session_items       enable row level security;
alter table public.session_item_photos enable row level security;

drop policy if exists "items: public read"   on public.session_items;
drop policy if exists "items: admin insert"  on public.session_items;
drop policy if exists "items: admin update"  on public.session_items;
drop policy if exists "items: admin delete"  on public.session_items;

create policy "items: public read"  on public.session_items
  for select to anon, authenticated using (true);
create policy "items: admin insert" on public.session_items
  for insert to authenticated with check (true);
create policy "items: admin update" on public.session_items
  for update to authenticated using (true) with check (true);
create policy "items: admin delete" on public.session_items
  for delete to authenticated using (true);

drop policy if exists "photos: public read"   on public.session_item_photos;
drop policy if exists "photos: admin insert"  on public.session_item_photos;
drop policy if exists "photos: admin update"  on public.session_item_photos;
drop policy if exists "photos: admin delete"  on public.session_item_photos;

create policy "photos: public read"  on public.session_item_photos
  for select to anon, authenticated using (true);
create policy "photos: admin insert" on public.session_item_photos
  for insert to authenticated with check (true);
create policy "photos: admin update" on public.session_item_photos
  for update to authenticated using (true) with check (true);
create policy "photos: admin delete" on public.session_item_photos
  for delete to authenticated using (true);

-- Stricter alternative: replace `true` in the insert/update/delete policies above with
--   (auth.jwt() ->> 'email') = 'your-admin@email.com'
-- so that only that exact account can write, even if sign-ups are ever enabled by mistake.

-- ---------- Storage: public bucket "lumine-media" ----------
-- file_size_limit is 50 MB (the free-plan maximum). Raise it on a paid plan if you need bigger videos
-- (and raise MAX_VIDEO_BYTES in main.js to match).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lumine-media', 'lumine-media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media: public read"   on storage.objects;
drop policy if exists "media: admin upload"  on storage.objects;
drop policy if exists "media: admin update"  on storage.objects;
drop policy if exists "media: admin delete"  on storage.objects;

create policy "media: public read"  on storage.objects
  for select to anon, authenticated using (bucket_id = 'lumine-media');
create policy "media: admin upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'lumine-media');
create policy "media: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'lumine-media') with check (bucket_id = 'lumine-media');
create policy "media: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'lumine-media');
