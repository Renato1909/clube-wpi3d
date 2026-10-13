-- Acesso administrativo do Clube WPI3D.
-- Aplicado no Supabase pelas migrations add_admin_access e combine_admin_select_policies.

alter table public.profiles
  add column if not exists role text not null default 'customer'
  check (role in ('customer', 'admin'));

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "quotes_select_own" on public.quotes;
drop policy if exists "quotes_select_admin" on public.quotes;
drop policy if exists "quotes_select_own_or_admin" on public.quotes;
create policy "quotes_select_own_or_admin" on public.quotes for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()));

drop policy if exists "quotes_update_admin" on public.quotes;
drop policy if exists "quotes_update_submission_own" on public.quotes;
drop policy if exists "quotes_update_own_or_admin" on public.quotes;
create policy "quotes_update_own_or_admin" on public.quotes for update to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()))
with check ((select auth.uid()) = user_id or (select private.is_admin()));

drop policy if exists "quote_files_select_own" on public.quote_files;
drop policy if exists "quote_files_select_admin" on public.quote_files;
drop policy if exists "quote_files_select_own_or_admin" on public.quote_files;
create policy "quote_files_select_own_or_admin" on public.quote_files for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()));

drop policy if exists "quote_storage_select_admin" on storage.objects;
create policy "quote_storage_select_admin" on storage.objects for select to authenticated
using (bucket_id = 'quote-files' and (select private.is_admin()));

grant update (status) on public.quotes to authenticated;

-- Execute after schema.sql and admin-access.sql.
-- Prevent customer updates to status even when the shared authenticated role
-- needs that column for the web administrator.
create or replace function private.guard_quote_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  if not coalesce(private.is_admin(), false) then
    if (to_jsonb(new) - 'submission_complete' - 'updated_at')
       is distinct from
       (to_jsonb(old) - 'submission_complete' - 'updated_at') then
      raise exception 'Customers may only finalize their own quote submission'
        using errcode = '42501';
    end if;
    if old.submission_complete and not new.submission_complete then
      raise exception 'A completed submission cannot be reopened'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.guard_quote_update() from public, anon, authenticated;
drop trigger if exists quotes_guard_update on public.quotes;
create trigger quotes_guard_update
before update on public.quotes
for each row execute function private.guard_quote_update();

-- Explicit grants also remove table-wide defaults from older projects.
revoke update on public.quotes from public, anon, authenticated;
revoke update (id, user_id, customer_name, customer_email, customer_phone,
  postal_code, city, address, address_number, address_extra, description,
  quantity, color, material, desired_date, notes, status, submission_complete,
  created_at, updated_at) on public.quotes from public, anon, authenticated;
grant update (status, submission_complete) on public.quotes to authenticated;

revoke update on public.profiles from public, anon, authenticated;
revoke update (id, full_name, phone, role, created_at, updated_at)
  on public.profiles from public, anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;


-- Promova uma conta existente somente após confirmar o usuário correto:
-- update public.profiles set role = 'admin' where id = '<uuid confirmado>';

