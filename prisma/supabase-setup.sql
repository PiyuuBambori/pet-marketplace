-- Doom — Supabase setup
-- Run once in Supabase Studio → SQL Editor → New query → Run.
-- Idempotent: safe to run again.
--
-- Prisma already created the tables from schema.prisma (public schema).
-- This adds what Prisma cannot express: triggers, RLS and grants.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Auto-create a profile row whenever a Supabase Auth user is created
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public."User" (id, email, name, phone, avatar, role, "createdAt", "updatedAt")
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'avatar', '🐾'),
    'buyer',
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep the profile in step with email / metadata changes
create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public."User"
     set email = new.email,
         name  = coalesce(new.raw_user_meta_data->>'name', "name"),
         "updatedAt" = now()
   where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, raw_user_meta_data on auth.users
  for each row execute function public.handle_user_update();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
-- The browser (PostgREST) uses the anon/authenticated roles, so RLS applies.
-- Prisma connects as `postgres`, which bypasses RLS — therefore the API routes
-- remain the real enforcement boundary (see lib/auth.ts requireAdmin).
-- Enabled via a script so quoting is handled for you (the "User" table needs
-- double quotes; the rest do not).
alter table public."User"     enable row level security;
alter table public."Design"   enable row level security;
alter table public."Order"    enable row level security;
alter table public."OrderItem" enable row level security;

-- IMPORTANT: Supabase grants table privileges to the anon/authenticated roles
-- independently of RLS. RLS with zero policies blocks row access, but we also
-- revoke the grants so the browser has no path in at all.
revoke all on public."User"     from anon, authenticated;
revoke all on public."Design"   from anon, authenticated;
revoke all on public."Order"    from anon, authenticated;
revoke all on public."OrderItem" from anon, authenticated;

-- Prisma connects as `postgres`, which owns these tables and bypasses RLS.
-- That is deliberate: all app data access goes through the Next.js server,
-- and authorisation is enforced there (see lib/auth.ts requireAdmin).
-- The anon/authenticated roles having no access means the public Supabase
-- REST endpoint cannot read or write application data.

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Helper: promote an email to admin
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.promote_to_admin(user_email text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public."User" set role = 'admin' where email = lower(user_email);
end;
$$;

-- usage:  select public.promote_to_admin('admin@doom.shop');

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Storage bucket for catalogue photography
-- ─────────────────────────────────────────────────────────────────────────────
-- Must match lib/images.ts. Public so next/image can serve it, but with no
-- INSERT policy: the browser has no write path, uploads go through
-- /api/upload using the service-role client.
--
-- The MIME allow-list has to be widened here or Uploads fail at runtime with
-- "mime type image/... is not supported".
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'doom-images',
  'doom-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Adopt any auth users that predate this trigger
-- ─────────────────────────────────────────────────────────────────────────────
insert into public."User" (id, email, name, avatar, role, "createdAt", "updatedAt")
select id, email,
       coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1)),
       coalesce(raw_user_meta_data->>'avatar', '🐾'),
       'buyer', created_at, now()
  from auth.users
on conflict (id) do nothing;
