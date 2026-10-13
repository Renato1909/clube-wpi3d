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

