create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_options (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 60),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  description text not null check (char_length(description) between 1 and 260),
  image_url text not null,
  redirect_url text not null check (redirect_url ~* '^https?://'),
  platforms text[] not null default '{}',
  accent text not null default 'pink' check (accent in ('pink','cyan')),
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.platform_options enable row level security;
alter table public.tools enable row level security;

create or replace function public.is_humble_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_humble_admin() from public;
grant execute on function public.is_humble_admin() to authenticated;

-- Platform options: public visitors do not need access. Admins manage the list.
drop policy if exists "Admins can read platform options" on public.platform_options;
create policy "Admins can read platform options"
on public.platform_options for select to authenticated
using (public.is_humble_admin());

drop policy if exists "Admins can insert platform options" on public.platform_options;
create policy "Admins can insert platform options"
on public.platform_options for insert to authenticated
with check (public.is_humble_admin());

drop policy if exists "Admins can update platform options" on public.platform_options;
create policy "Admins can update platform options"
on public.platform_options for update to authenticated
using (public.is_humble_admin())
with check (public.is_humble_admin());

-- Tools: visitors can only read published tools.
drop policy if exists "Public can read published tools" on public.tools;
create policy "Public can read published tools"
on public.tools for select to anon, authenticated
using (published = true);

drop policy if exists "Admins can read all tools" on public.tools;
create policy "Admins can read all tools"
on public.tools for select to authenticated
using (public.is_humble_admin());

drop policy if exists "Admins can insert tools" on public.tools;
create policy "Admins can insert tools"
on public.tools for insert to authenticated
with check (public.is_humble_admin());

drop policy if exists "Admins can update tools" on public.tools;
create policy "Admins can update tools"
on public.tools for update to authenticated
using (public.is_humble_admin())
with check (public.is_humble_admin());

drop policy if exists "Admins can delete tools" on public.tools;
create policy "Admins can delete tools"
on public.tools for delete to authenticated
using (public.is_humble_admin());

insert into public.platform_options (name, sort_order, active) values
  ('Adobe After Effects', 1, true),
  ('Adobe Premiere Pro', 2, true),
  ('Adobe Photoshop', 3, true),
  ('Adobe Illustrator', 4, true),
  ('Adobe Media Encoder', 5, true),
  ('DaVinci Resolve', 6, true),
  ('Final Cut Pro', 7, true),
  ('CapCut', 8, true),
  ('Blender', 9, true),
  ('Unreal Engine', 10, true),
  ('Windows', 11, true),
  ('macOS', 12, true)
on conflict (name) do update set sort_order = excluded.sort_order, active = excluded.active;

insert into storage.buckets (id, name, public)
values ('tool-images', 'tool-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read tool images" on storage.objects;
create policy "Public can read tool images"
on storage.objects for select to public
using (bucket_id = 'tool-images');

drop policy if exists "Humble admins can upload tool images" on storage.objects;
create policy "Humble admins can upload tool images"
on storage.objects for insert to authenticated
with check (bucket_id = 'tool-images' and public.is_humble_admin());

drop policy if exists "Humble admins can update tool images" on storage.objects;
create policy "Humble admins can update tool images"
on storage.objects for update to authenticated
using (bucket_id = 'tool-images' and public.is_humble_admin())
with check (bucket_id = 'tool-images' and public.is_humble_admin());

drop policy if exists "Humble admins can delete tool images" on storage.objects;
create policy "Humble admins can delete tool images"
on storage.objects for delete to authenticated
using (bucket_id = 'tool-images' and public.is_humble_admin());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tools_set_updated_at on public.tools;
create trigger tools_set_updated_at
before update on public.tools
for each row execute function public.set_updated_at();

-- ==========================================================
-- FIRST-TIME SETUP
-- ==========================================================
-- 1) Create an admin user in Supabase Authentication > Users.
-- 2) Copy that user's UUID and run:
--    insert into public.admin_users (user_id) values ('AUTH_USER_UUID_HERE');
-- 3) Set supabase-config.js with the project URL and anon/publishable key.
-- 4) Seed the two original HUMBLE tools below after the domain is final.
--
-- Replace YOUR_PUBLIC_SITE with your final HTTPS domain.
-- ==========================================================
-- Example original-tool seeds (run once):
-- insert into public.tools
-- (name, description, image_url, redirect_url, platforms, accent, published, sort_order)
-- values
-- ('Humble Studio Tool',
--  'Discord RPC, editing timer, streaks, community features and Adobe workflow utilities.',
--  'YOUR_PUBLIC_SITE/assets/tools/humble-studio-tool.png',
--  'https://humblelyy.github.io/HumbleStudioTool/',
--  ARRAY['Adobe After Effects','Adobe Premiere Pro','Windows','macOS'],
--  'pink', true, 1),
-- ('Humble AE Downgrader',
--  'Convert After Effects projects to older versions with the Humble AE Downgrader.',
--  'YOUR_PUBLIC_SITE/assets/tools/humble-ae-downgrader.png',
--  'https://humblelyy.github.io/HUMBLE-ae-Downgrader/',
--  ARRAY['Adobe After Effects','Windows','macOS'],
--  'cyan', true, 2);
