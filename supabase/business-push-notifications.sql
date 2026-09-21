-- Push operacional para administradores.
-- O segredo permanece somente no banco. Nunca coloque credenciais em código cliente.
-- Executar após schema.sql e push-notifications.sql.

create table if not exists public.business_webhook_secrets (
  key text primary key,
  secret text not null,
  created_at timestamptz not null default now()
);

alter table public.business_webhook_secrets enable row level security;
revoke all on public.business_webhook_secrets from anon, authenticated;

insert into public.business_webhook_secrets (key, secret)
values ('notify-business-event', encode(gen_random_bytes(32), 'hex'))
on conflict (key) do nothing;

grant select on table public.business_webhook_secrets to service_role;

create or replace function private.queue_business_event_webhook()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  webhook_secret text;
  payload jsonb;
begin
  select secret
    into webhook_secret
    from public.business_webhook_secrets
   where key = 'notify-business-event';

  if webhook_secret is null then
    raise warning 'Business webhook secret is not configured';
    return new;
  end if;

  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', case when TG_OP = 'DELETE' then null else to_jsonb(NEW) end,
    'old_record', case when TG_OP = 'INSERT' then null else to_jsonb(OLD) end
  );

  perform net.http_post(
    url := 'https://zrmtoiovvxkrakqfhzhp.supabase.co/functions/v1/notify-business-event',
    body := payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-clube-wpi3d-webhook-secret', webhook_secret
    ),
    timeout_milliseconds := 2000
  );

  return new;
end;
$$;

revoke all on function private.queue_business_event_webhook() from public, anon, authenticated;

drop trigger if exists business_webhook_profiles_insert on public.profiles;
create trigger business_webhook_profiles_insert
after insert on public.profiles
for each row
execute function private.queue_business_event_webhook();

drop trigger if exists business_webhook_quotes_insert on public.quotes;
create trigger business_webhook_quotes_insert
after insert on public.quotes
for each row
when (new.submission_complete is true)
execute function private.queue_business_event_webhook();

drop trigger if exists business_webhook_quotes_ready_update on public.quotes;
create trigger business_webhook_quotes_ready_update
after update of submission_complete on public.quotes
for each row
when (
  new.submission_complete is true
  and old.submission_complete is distinct from true
)
execute function private.queue_business_event_webhook();
