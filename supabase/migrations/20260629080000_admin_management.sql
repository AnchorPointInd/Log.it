insert into public.app_admins (user_id)
select id
from auth.users
where lower(email) = 'admin@jtac.it'
on conflict (user_id) do nothing;

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
on public.profiles
for update
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

drop policy if exists "Admins can update controls" on public.controls;
create policy "Admins can update controls"
on public.controls
for update
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

drop policy if exists "Admins can delete controls" on public.controls;
create policy "Admins can delete controls"
on public.controls
for delete
to authenticated
using (exists (
  select 1
  from public.app_admins
  where app_admins.user_id = (select auth.uid())
));
