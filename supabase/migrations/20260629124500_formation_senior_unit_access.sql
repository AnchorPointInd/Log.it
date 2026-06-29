create table if not exists public.app_formation_seniors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unit text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_formation_seniors_unit_not_blank check (length(trim(unit)) > 0)
);

alter table public.app_formation_seniors enable row level security;

grant select, insert, update, delete on public.app_formation_seniors to authenticated;

drop policy if exists "Admins can manage formation seniors" on public.app_formation_seniors;
create policy "Admins can manage formation seniors"
on public.app_formation_seniors
for all
to authenticated
using (exists (
  select 1
  from public.app_admins
  where app_admins.user_id = (select auth.uid())
))
with check (exists (
  select 1
  from public.app_admins
  where app_admins.user_id = (select auth.uid())
));

drop policy if exists "Formation seniors can view own role" on public.app_formation_seniors;
create policy "Formation seniors can view own role"
on public.app_formation_seniors
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Formation seniors can view unit profiles" on public.profiles;
create policy "Formation seniors can view unit profiles"
on public.profiles
for select
to authenticated
using (exists (
  select 1
  from public.app_formation_seniors
  where app_formation_seniors.user_id = (select auth.uid())
    and app_formation_seniors.unit = profiles.unit
));

drop policy if exists "Formation seniors can update unit profiles" on public.profiles;
create policy "Formation seniors can update unit profiles"
on public.profiles
for update
to authenticated
using (exists (
  select 1
  from public.app_formation_seniors
  where app_formation_seniors.user_id = (select auth.uid())
    and app_formation_seniors.unit = profiles.unit
))
with check (exists (
  select 1
  from public.app_formation_seniors
  where app_formation_seniors.user_id = (select auth.uid())
    and app_formation_seniors.unit = profiles.unit
));

drop policy if exists "Formation seniors can view unit controls" on public.controls;
create policy "Formation seniors can view unit controls"
on public.controls
for select
to authenticated
using (exists (
  select 1
  from public.app_formation_seniors
  join public.profiles on profiles.user_id = controls.user_id
  where app_formation_seniors.user_id = (select auth.uid())
    and app_formation_seniors.unit = profiles.unit
));

drop policy if exists "Formation seniors can update unit controls" on public.controls;
create policy "Formation seniors can update unit controls"
on public.controls
for update
to authenticated
using (exists (
  select 1
  from public.app_formation_seniors
  join public.profiles on profiles.user_id = controls.user_id
  where app_formation_seniors.user_id = (select auth.uid())
    and app_formation_seniors.unit = profiles.unit
))
with check (exists (
  select 1
  from public.app_formation_seniors
  join public.profiles on profiles.user_id = controls.user_id
  where app_formation_seniors.user_id = (select auth.uid())
    and app_formation_seniors.unit = profiles.unit
));

drop policy if exists "Formation seniors can delete unit controls" on public.controls;
create policy "Formation seniors can delete unit controls"
on public.controls
for delete
to authenticated
using (exists (
  select 1
  from public.app_formation_seniors
  join public.profiles on profiles.user_id = controls.user_id
  where app_formation_seniors.user_id = (select auth.uid())
    and app_formation_seniors.unit = profiles.unit
));
