alter table public.account_requests
add column if not exists contact_email text not null default '';

alter table public.profiles
add column if not exists contact_email text not null default '',
add column if not exists require_password_change boolean not null default false;

alter table public.account_requests
drop constraint if exists account_requests_contact_email_format;

alter table public.account_requests
add constraint account_requests_contact_email_format
check (contact_email = '' or contact_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');

alter table public.profiles
drop constraint if exists profiles_contact_email_format;

alter table public.profiles
add constraint profiles_contact_email_format
check (contact_email = '' or contact_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');
