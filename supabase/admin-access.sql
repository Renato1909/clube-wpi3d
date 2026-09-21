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

-- Promova uma conta existente somente após confirmar o usuário correto:
-- update public.profiles set role = 'admin' where id = '<uuid confirmado>';
