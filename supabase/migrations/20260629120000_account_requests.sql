create table if not exists public.account_requests (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  name text not null default '',
  rank text not null default '',
  service_number text not null default '',
  unit text not null default '',
  capbadge text not null default '',
  qualification text not null default '',
  formation_senior_requested boolean not null default false,
  status text not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  approved_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_requests_username_format check (username ~ '^[a-z0-9][a-z0-9._-]{0,62}$'),
  constraint account_requests_status_check check (status in ('pending', 'approved', 'rejected'))
);

create unique index if not exists account_requests_pending_username_idx
on public.account_requests (lower(username))
where status = 'pending';

create index if not exists account_requests_status_created_idx
on public.account_requests (status, created_at desc);

alter table public.account_requests enable row level security;

grant select, insert, update on public.account_requests to anon, authenticated;

drop policy if exists "Anyone can submit account requests" on public.account_requests;
create policy "Anyone can submit account requests"
on public.account_requests
for insert
to anon, authenticated
with check (
  status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and approved_user_id is null
);

drop policy if exists "Admins can view account requests" on public.account_requests;
create policy "Admins can view account requests"
on public.account_requests
for select
to authenticated
using (exists (
  select 1
  from public.app_admins
  where app_admins.user_id = (select auth.uid())
));

drop policy if exists "Admins can update account requests" on public.account_requests;
create policy "Admins can update account requests"
on public.account_requests
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
