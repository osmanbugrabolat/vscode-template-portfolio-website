-- Instant cache refresh: any change to site content (from the admin panel,
-- the Supabase dashboard or the SQL editor) asks the site to drop its cache.
--
-- The endpoint URL and bearer token live in private.app_config, a schema that
-- is not exposed through the Data API. Insert them once per environment:
--   insert into private.app_config (key, value) values
--     ('revalidate_url', 'https://<site>/api/revalidate'),
--     ('revalidate_token', '<token derived from APP_SECRET>')
--   on conflict (key) do update set value = excluded.value;
-- Without that row the trigger does nothing (e.g. local development).

create extension if not exists pg_net with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_config (
  key   text primary key,
  value text not null
);
revoke all on private.app_config from public, anon, authenticated;

create or replace function private.request_revalidate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url   text;
  v_token text;
begin
  select value into v_url from private.app_config where key = 'revalidate_url';
  select value into v_token from private.app_config where key = 'revalidate_token';
  if v_url is null or v_token is null then
    return null;
  end if;
  -- pg_net is asynchronous: the request is sent after the transaction commits
  -- and never blocks or fails the write itself.
  perform net.http_post(
    url := v_url,
    body := '{}'::jsonb,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_token),
    timeout_milliseconds := 5000
  );
  return null;
end;
$$;

revoke all on function private.request_revalidate() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['site_settings', 'explorer_nodes', 'skill_categories', 'skills', 'experiences', 'chat_intents', 'chat_patterns'] loop
    execute format('drop trigger if exists %I_request_revalidate on public.%I', t, t);
    -- One call per statement, not per row.
    execute format('create trigger %I_request_revalidate after insert or update or delete on public.%I for each statement execute function private.request_revalidate()', t, t);
  end loop;
end;
$$;
