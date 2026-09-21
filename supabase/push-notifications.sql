-- Registro de tokens push do aplicativo móvel.
-- Executar após schema.sql. Seguro para reexecução.

create table if not exists public.push_tokens (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  token text not null check (char_length(token) between 10 and 500),
  platform text not null check (platform in ('android', 'ios')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

create index if not exists push_tokens_user_id_idx on public.push_tokens (user_id);

drop trigger if exists push_tokens_set_updated_at on public.push_tokens;
create trigger push_tokens_set_updated_at
before update on public.push_tokens
for each row execute function private.set_updated_at();

alter table public.push_tokens enable row level security;

drop policy if exists "push_tokens_select_own" on public.push_tokens;
create policy "push_tokens_select_own"
on public.push_tokens for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "push_tokens_insert_own" on public.push_tokens;
create policy "push_tokens_insert_own"
on public.push_tokens for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "push_tokens_update_own" on public.push_tokens;
create policy "push_tokens_update_own"
on public.push_tokens for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "push_tokens_delete_own" on public.push_tokens;
create policy "push_tokens_delete_own"
on public.push_tokens for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.push_tokens from anon;
grant select, insert, update, delete on public.push_tokens to authenticated;
grant usage, select on sequence public.push_tokens_id_seq to authenticated;
grant select on public.push_tokens to service_role;
