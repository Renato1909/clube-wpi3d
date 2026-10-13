-- Estrutura inicial do Clube WPI3D.
-- Este arquivo pode ser executado novamente com segurança no SQL Editor do Supabase.

create schema if not exists private;

-- A opção "Enable automatic RLS" cria esta função no schema público.
-- O gatilho interno continua funcionando sem permitir chamadas pela API.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text check (phone is null or char_length(phone) <= 25),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_email text not null check (char_length(customer_email) <= 254),
  customer_phone text not null check (char_length(customer_phone) between 10 and 25),
  postal_code text check (postal_code is null or char_length(postal_code) <= 9),
  city text check (city is null or char_length(city) <= 100),
  address text check (address is null or char_length(address) <= 200),
  address_number text check (address_number is null or char_length(address_number) <= 20),
  address_extra text check (address_extra is null or char_length(address_extra) <= 100),
  description text not null check (char_length(description) between 10 and 5000),
  quantity integer not null check (quantity between 1 and 10000),
  color text check (color is null or char_length(color) <= 100),
  material text not null default 'recomendacao'
    check (material in ('recomendacao', 'pla', 'petg', 'abs', 'outro')),
  desired_date date,
  notes text check (notes is null or char_length(notes) <= 3000),
  status text not null default 'recebido'
    check (status in ('recebido', 'em_analise', 'aguardando_cliente', 'aprovado', 'recusado', 'concluido')),
  submission_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quotes
  add column if not exists submission_complete boolean not null default false;

create table if not exists public.quote_files (
  id bigint generated always as identity primary key,
  quote_id bigint not null references public.quotes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null unique check (char_length(storage_path) <= 500),
  original_name text not null check (char_length(original_name) between 1 and 255),
  mime_type text check (mime_type is null or char_length(mime_type) <= 150),
  size_bytes bigint not null check (size_bytes between 1 and 20971520),
  created_at timestamptz not null default now()
);

create index if not exists quotes_user_id_idx on public.quotes (user_id);
create index if not exists quotes_created_at_idx on public.quotes (created_at desc);
create index if not exists quote_files_quote_id_idx on public.quote_files (quote_id);
create index if not exists quote_files_user_id_idx on public.quote_files (user_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
before update on public.quotes
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_name text;
begin
  candidate_name := trim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  if char_length(candidate_name) < 2 then
    candidate_name := split_part(coalesce(new.email, 'Cliente'), '@', 1);
  end if;

  insert into public.profiles (id, full_name)
  values (new.id, left(candidate_name, 120))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

insert into public.profiles (id, full_name)
select
  id,
  left(
    case
      when char_length(trim(coalesce(raw_user_meta_data ->> 'full_name', ''))) >= 2
        then trim(raw_user_meta_data ->> 'full_name')
      else split_part(coalesce(email, 'Cliente'), '@', 1)
    end,
    120
  )
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_files enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "quotes_select_own" on public.quotes;
create policy "quotes_select_own"
on public.quotes for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "quotes_insert_own" on public.quotes;
create policy "quotes_insert_own"
on public.quotes for insert
to authenticated
with check ((select auth.uid()) = user_id and status = 'recebido');

drop policy if exists "quotes_delete_own" on public.quotes;
create policy "quotes_delete_own"
on public.quotes for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "quotes_update_submission_own" on public.quotes;
create policy "quotes_update_submission_own"
on public.quotes for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "quote_files_select_own" on public.quote_files;
create policy "quote_files_select_own"
on public.quote_files for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "quote_files_insert_own" on public.quote_files;
create policy "quote_files_insert_own"
on public.quote_files for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.quotes
    where quotes.id = quote_id
      and quotes.user_id = (select auth.uid())
  )
);

drop policy if exists "quote_files_delete_own" on public.quote_files;
create policy "quote_files_delete_own"
on public.quote_files for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.profiles, public.quotes, public.quote_files from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;
grant select, insert, delete on public.quotes to authenticated;
grant update (submission_complete) on public.quotes to authenticated;
grant select, insert, delete on public.quote_files to authenticated;
grant usage, select on sequence public.quotes_id_seq to authenticated;
grant usage, select on sequence public.quote_files_id_seq to authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values ('quote-files', 'quote-files', false, 20971520)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "quote_storage_select_own" on storage.objects;
create policy "quote_storage_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'quote-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "quote_storage_insert_own" on storage.objects;
create policy "quote_storage_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'quote-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "quote_storage_delete_own" on storage.objects;
create policy "quote_storage_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'quote-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

