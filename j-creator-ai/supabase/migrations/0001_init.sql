-- ============================================================
-- J-Creator AI Sync — initial schema (Phase 2)
--
-- Apply via the Supabase SQL editor, or:
--   supabase db push
--
-- Tables:
--   public.profiles              — 1 row per auth.users row
--   public.content_generations   — 1 row per generated result set
--
-- Security:
--   Row Level Security is enabled on both tables.
--   Each user can only see / mutate their own rows.
-- ============================================================

-- ---- profiles ----------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: users can read own row" on public.profiles;
create policy "profiles: users can read own row"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles: users can update own row" on public.profiles;
create policy "profiles: users can update own row"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new auth.users row appears.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---- content_generations -----------------------------------------
create table if not exists public.content_generations (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  original_filename text,
  transcription     text,
  note_content      text,
  line_content      text,
  x_content         text,
  created_at        timestamptz not null default now()
);

create index if not exists content_generations_user_id_created_at_idx
  on public.content_generations (user_id, created_at desc);

alter table public.content_generations enable row level security;

drop policy if exists "content_generations: users can read own rows"
  on public.content_generations;
create policy "content_generations: users can read own rows"
  on public.content_generations
  for select
  using (auth.uid() = user_id);

drop policy if exists "content_generations: users can insert own rows"
  on public.content_generations;
create policy "content_generations: users can insert own rows"
  on public.content_generations
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "content_generations: users can update own rows"
  on public.content_generations;
create policy "content_generations: users can update own rows"
  on public.content_generations
  for update
  using (auth.uid() = user_id);

drop policy if exists "content_generations: users can delete own rows"
  on public.content_generations;
create policy "content_generations: users can delete own rows"
  on public.content_generations
  for delete
  using (auth.uid() = user_id);
