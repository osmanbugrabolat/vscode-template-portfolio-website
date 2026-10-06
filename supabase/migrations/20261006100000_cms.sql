-- ======================================================================
-- CMS + admin: every piece of site content lives here and is editable
-- from /admin. Security model:
--   * anon (public site)   -> read published content only
--   * authenticated admin  -> full CRUD, enforced by RLS via is_admin()
--   * service role (server)-> audit log, login throttling, chat logs
-- ======================================================================

create extension if not exists pgcrypto with schema extensions;

-- ----------------------------------------------------------------------
-- Admin identity
-- ----------------------------------------------------------------------

-- Emails that are allowed to exist as users at all. Anything else is
-- rejected at sign-up time, even if public sign-ups are accidentally on.
create table if not exists public.admin_allowlist (
  email       text primary key check (email = lower(email) and position('@' in email) > 1),
  created_at  timestamptz not null default now()
);

-- Admin rights are bound to the auth user id, not to the email string.
create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.admin_users a
    join auth.users u on u.id = a.user_id
    join public.admin_allowlist l on l.email = lower(u.email)
    where a.user_id = auth.uid()
      and u.email_confirmed_at is not null
      and (u.banned_until is null or u.banned_until < now())
      and u.deleted_at is null
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Reject sign-ups for anyone not on the allowlist.
create or replace function public.guard_auth_user_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null or not exists (
    select 1 from public.admin_allowlist where email = lower(new.email)
  ) then
    raise exception 'sign-ups are disabled' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_auth_user_insert on auth.users;
create trigger guard_auth_user_insert
before insert on auth.users
for each row execute function public.guard_auth_user_insert();

-- Grant admin once an allowlisted account has a confirmed email.
create or replace function public.sync_admin_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null
     and exists (select 1 from public.admin_allowlist where email = lower(new.email)) then
    insert into public.admin_users (user_id, email)
    values (new.id, lower(new.email))
    on conflict (user_id) do update set email = excluded.email;
  else
    delete from public.admin_users where user_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_admin_user on auth.users;
create trigger sync_admin_user
after insert or update of email, email_confirmed_at on auth.users
for each row execute function public.sync_admin_user();

-- Removing an email from the allowlist revokes admin rights immediately.
create or replace function public.revoke_admin_on_allowlist_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.admin_users where email = old.email;
  return old;
end;
$$;

drop trigger if exists revoke_admin_on_allowlist_delete on public.admin_allowlist;
create trigger revoke_admin_on_allowlist_delete
after delete on public.admin_allowlist
for each row execute function public.revoke_admin_on_allowlist_delete();

insert into public.admin_allowlist (email) values ('osmanbolat897@gmail.com')
on conflict do nothing;

-- ----------------------------------------------------------------------
-- Site settings (single row)
-- ----------------------------------------------------------------------
create table if not exists public.site_settings (
  id                   smallint primary key default 1 check (id = 1),
  name                 text not null,
  title_tr             text not null default '',
  title_en             text not null default '',
  subtitle_tr          text not null default '',
  subtitle_en          text not null default '',
  location_tr          text not null default '',
  location_en          text not null default '',
  email                text not null default '',
  github_url           text not null default '',
  linkedin_url         text not null default '',
  medium_url           text not null default '',
  website_url          text not null default '',
  avatar_url           text not null default '',
  available_for_work   boolean not null default false,
  current_focus_tr     text[] not null default '{}',
  current_focus_en     text[] not null default '{}',
  education_degree_tr  text not null default '',
  education_degree_en  text not null default '',
  education_school     text not null default '',
  education_years      text not null default '',
  education_gpa        text not null default '',
  seo_title            text not null default '',
  seo_description_tr   text not null default '',
  seo_description_en   text not null default '',
  chat_greeting_tr     text not null default '',
  chat_greeting_en     text not null default '',
  terminal_whoami      text not null default '',
  updated_at           timestamptz not null default now()
);

-- ----------------------------------------------------------------------
-- Explorer tree: folders and files shown in the VS Code style sidebar.
-- ----------------------------------------------------------------------
create table if not exists public.explorer_nodes (
  id                uuid primary key default gen_random_uuid(),
  parent_id         uuid references public.explorer_nodes(id) on delete cascade,
  kind              text not null check (kind in ('folder', 'file')),
  name              text not null check (char_length(name) between 1 and 120),
  name_en           text check (name_en is null or char_length(name_en) between 1 and 120),
  file_type         text check (file_type in ('markdown', 'home', 'experience', 'skills', 'pdf', 'image', 'embed', 'link')),
  route             text unique check (route is null or route ~ '^/([a-z0-9]+(-[a-z0-9]+)*(/[a-z0-9]+(-[a-z0-9]+)*)*)?$'),
  url               text check (url is null or url ~ '^(https://|mailto:)'),
  asset_url         text check (asset_url is null or asset_url ~ '^(https://|/|http://(127\.0\.0\.1|localhost)(:[0-9]+)?/)'),
  content_tr        text not null default '',
  content_en        text not null default '',
  icon              text,
  sort_order        integer not null default 0,
  is_published      boolean not null default true,
  show_in_explorer  boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint folder_has_no_file_fields check (
    kind = 'file' or (file_type is null and route is null and url is null and asset_url is null)
  ),
  constraint file_has_type check (kind = 'folder' or file_type is not null),
  constraint file_routing check (
    kind = 'folder'
    or (file_type = 'link' and url is not null and route is null)
    or (file_type <> 'link' and route is not null)
  ),
  constraint embed_has_url check (file_type is distinct from 'embed' or url ~ '^https://'),
  constraint not_own_parent check (parent_id is distinct from id),
  constraint route_not_reserved check (route is null or route !~ '^/(api|admin|admin-login|_next|auth)(/|$)'),
  constraint link_url_scheme check (file_type is distinct from 'link' or url ~ '^(https://|mailto:)')
);

create index if not exists explorer_nodes_parent_idx on public.explorer_nodes (parent_id, sort_order);

-- Folders only may contain children; a node may not be moved under its own subtree.
create or replace function public.check_explorer_parent()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_kind text;
  cursor_id uuid := new.parent_id;
  depth int := 0;
begin
  if new.parent_id is null then
    return new;
  end if;
  select kind into parent_kind from public.explorer_nodes where id = new.parent_id;
  if parent_kind is distinct from 'folder' then
    raise exception 'parent must be a folder' using errcode = '23514';
  end if;
  while cursor_id is not null loop
    if cursor_id = new.id then
      raise exception 'cannot move a folder into itself' using errcode = '23514';
    end if;
    depth := depth + 1;
    if depth > 32 then
      raise exception 'tree is too deep' using errcode = '23514';
    end if;
    select parent_id into cursor_id from public.explorer_nodes where id = cursor_id;
  end loop;
  return new;
end;
$$;

drop trigger if exists check_explorer_parent on public.explorer_nodes;
create trigger check_explorer_parent
before insert or update of parent_id on public.explorer_nodes
for each row execute function public.check_explorer_parent();

-- ----------------------------------------------------------------------
-- Skills and experience
-- ----------------------------------------------------------------------
create table if not exists public.skill_categories (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique check (key ~ '^[a-z][a-z0-9_]{0,39}$'),
  label_tr    text not null check (char_length(label_tr) between 1 and 60),
  label_en    text not null check (char_length(label_en) between 1 and 60),
  type_name   text not null default 'Skill[]' check (char_length(type_name) between 1 and 40),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.skills (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.skill_categories(id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 60),
  level        smallint not null check (level between 0 and 100),
  icon         text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists skills_category_idx on public.skills (category_id, sort_order);

create table if not exists public.experiences (
  id              uuid primary key default gen_random_uuid(),
  company         text not null check (char_length(company) between 1 and 120),
  position_tr     text not null default '',
  position_en     text not null default '',
  duration_tr     text not null default '',
  duration_en     text not null default '',
  location_tr     text not null default '',
  location_en     text not null default '',
  description_tr  text not null default '',
  description_en  text not null default '',
  highlights_tr   text[] not null default '{}',
  highlights_en   text[] not null default '{}',
  tech            text[] not null default '{}',
  sort_order      integer not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------
-- Operational tables (server-side only, no RLS policies)
-- ----------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  actor_id    uuid,
  actor_email text,
  action      text not null,
  entity      text not null,
  entity_id   text,
  ip_hash     text,
  details     jsonb not null default '{}'::jsonb
);
create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);

create table if not exists public.auth_login_attempts (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  email_hash  text not null,
  ip_hash     text not null,
  success     boolean not null
);
create index if not exists auth_login_attempts_email_idx on public.auth_login_attempts (email_hash, created_at desc);
create index if not exists auth_login_attempts_ip_idx on public.auth_login_attempts (ip_hash, created_at desc);

alter table public.chat_logs add column if not exists ip_hash text;
create index if not exists chat_logs_ip_idx on public.chat_logs (ip_hash, created_at desc);

-- ----------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['site_settings', 'explorer_nodes', 'skill_categories', 'skills', 'experiences'] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end;
$$;

-- ----------------------------------------------------------------------
-- Row level security
-- ----------------------------------------------------------------------
alter table public.admin_allowlist     enable row level security;
alter table public.admin_users         enable row level security;
alter table public.site_settings       enable row level security;
alter table public.explorer_nodes      enable row level security;
alter table public.skill_categories    enable row level security;
alter table public.skills              enable row level security;
alter table public.experiences         enable row level security;
alter table public.admin_audit_log     enable row level security;
alter table public.auth_login_attempts enable row level security;

-- Public read access (published content only).
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "public read published nodes" on public.explorer_nodes;
create policy "public read published nodes" on public.explorer_nodes
  for select to anon, authenticated using (is_published or public.is_admin());

drop policy if exists "public read skill categories" on public.skill_categories;
create policy "public read skill categories" on public.skill_categories
  for select to anon, authenticated using (true);

drop policy if exists "public read skills" on public.skills;
create policy "public read skills" on public.skills
  for select to anon, authenticated using (true);

drop policy if exists "public read published experiences" on public.experiences;
create policy "public read published experiences" on public.experiences
  for select to anon, authenticated using (is_published or public.is_admin());

drop policy if exists "public read active intents" on public.chat_intents;
create policy "public read active intents" on public.chat_intents
  for select to anon, authenticated using (is_active or public.is_admin());

drop policy if exists "public read patterns" on public.chat_patterns;
create policy "public read patterns" on public.chat_patterns
  for select to anon, authenticated using (true);

-- Admin write access.
do $$
declare t text;
begin
  foreach t in array array['site_settings', 'explorer_nodes', 'skill_categories', 'skills', 'experiences', 'chat_intents', 'chat_patterns'] loop
    execute format('drop policy if exists "admin insert" on public.%I', t);
    execute format('drop policy if exists "admin update" on public.%I', t);
    execute format('drop policy if exists "admin delete" on public.%I', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end;
$$;

-- Admins may read chat logs and the audit trail; nobody may write them through the API.
drop policy if exists "admin read chat logs" on public.chat_logs;
create policy "admin read chat logs" on public.chat_logs
  for select to authenticated using (public.is_admin());
drop policy if exists "admin delete chat logs" on public.chat_logs;
create policy "admin delete chat logs" on public.chat_logs
  for delete to authenticated using (public.is_admin());

drop policy if exists "admin read audit log" on public.admin_audit_log;
create policy "admin read audit log" on public.admin_audit_log
  for select to authenticated using (public.is_admin());

-- The settings row can never be deleted, only edited.
drop policy if exists "admin delete" on public.site_settings;

-- Table privileges: anon gets SELECT only on public content tables.
revoke all on public.admin_allowlist, public.admin_users, public.admin_audit_log, public.auth_login_attempts from anon, authenticated;
grant select on public.admin_audit_log to authenticated;
revoke insert, update, delete, truncate on public.site_settings, public.explorer_nodes, public.skill_categories,
  public.skills, public.experiences, public.chat_intents, public.chat_patterns, public.chat_logs from anon;
revoke truncate on public.site_settings, public.explorer_nodes, public.skill_categories, public.skills,
  public.experiences, public.chat_intents, public.chat_patterns, public.chat_logs from authenticated;
revoke all on public.chat_logs from anon;
revoke insert, update on public.chat_logs from authenticated;
revoke all on public.chat_unanswered from anon;

-- ----------------------------------------------------------------------
-- Storage: public bucket for uploaded media (images, PDFs).
-- ----------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin list" on storage.objects;
create policy "media admin list" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_admin());

-- ----------------------------------------------------------------------
-- Admin RPCs. SECURITY INVOKER: they run as the calling user, so RLS
-- applies to every statement; the explicit is_admin() check is a second gate.
-- ----------------------------------------------------------------------

-- Save an intent and replace its patterns in one transaction.
create or replace function public.admin_save_intent(p_intent jsonb, p_patterns jsonb, p_original_id text default null)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id text := p_intent->>'id';
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_id is null or v_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(v_id) > 64 then
    raise exception 'invalid intent id' using errcode = '22023';
  end if;

  if p_original_id is not null and p_original_id <> v_id then
    -- Renaming: chat_patterns.intent_id and chat_logs follow via ON UPDATE CASCADE.
    update public.chat_intents set id = v_id where id = p_original_id;
    -- Follow-up references are plain text, update them too.
    update public.chat_intents set follow_ups = array_replace(follow_ups, p_original_id, v_id)
    where p_original_id = any(follow_ups);
  end if;

  insert into public.chat_intents (id, category, priority, title_tr, title_en, answer_tr, answer_en, keywords, links, follow_ups, is_active)
  values (
    v_id,
    p_intent->>'category',
    (p_intent->>'priority')::int,
    p_intent->>'title_tr',
    p_intent->>'title_en',
    p_intent->>'answer_tr',
    p_intent->>'answer_en',
    coalesce((select array_agg(value) from jsonb_array_elements_text(p_intent->'keywords')), '{}'),
    coalesce(p_intent->'links', '[]'::jsonb),
    coalesce((select array_agg(value) from jsonb_array_elements_text(p_intent->'follow_ups')), '{}'),
    coalesce((p_intent->>'is_active')::boolean, true)
  )
  on conflict (id) do update set
    category = excluded.category, priority = excluded.priority, title_tr = excluded.title_tr,
    title_en = excluded.title_en, answer_tr = excluded.answer_tr, answer_en = excluded.answer_en,
    keywords = excluded.keywords, links = excluded.links, follow_ups = excluded.follow_ups,
    is_active = excluded.is_active;

  delete from public.chat_patterns where intent_id = v_id;
  insert into public.chat_patterns (intent_id, lang, pattern)
  select v_id, p->>'lang', p->>'pattern'
  from jsonb_array_elements(p_patterns) p
  on conflict do nothing;

  return v_id;
end;
$$;

-- Move a row one step up/down among its siblings (explorer, skills, categories, experiences).
create or replace function public.admin_move(p_table text, p_id uuid, p_direction int)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_scope_col text;
  v_scope uuid;
  v_ids uuid[];
  v_pos int;
  v_swap int;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_direction not in (-1, 1) then
    raise exception 'invalid direction' using errcode = '22023';
  end if;
  v_scope_col := case p_table
    when 'explorer_nodes' then 'parent_id'
    when 'skills' then 'category_id'
    when 'skill_categories' then null
    when 'experiences' then null
    else 'invalid' end;
  if v_scope_col = 'invalid' then
    raise exception 'invalid table' using errcode = '22023';
  end if;

  if v_scope_col is not null then
    execute format('select %I from public.%I where id = $1', v_scope_col, p_table) into v_scope using p_id;
    execute format('select array_agg(id order by sort_order, id) from public.%I where %I is not distinct from $1', p_table, v_scope_col)
      into v_ids using v_scope;
  else
    execute format('select array_agg(id order by sort_order, id) from public.%I', p_table) into v_ids;
  end if;

  v_pos := array_position(v_ids, p_id);
  if v_pos is null then
    raise exception 'not found' using errcode = 'P0002';
  end if;
  v_swap := v_pos + p_direction;
  if v_swap < 1 or v_swap > array_length(v_ids, 1) then
    return;
  end if;
  v_ids[v_pos] := v_ids[v_swap];
  v_ids[v_swap] := p_id;

  -- Renumber the whole sibling list so ordering stays dense and stable.
  for i in 1 .. array_length(v_ids, 1) loop
    execute format('update public.%I set sort_order = $1 where id = $2 and sort_order is distinct from $1', p_table)
      using (i - 1) * 10, v_ids[i];
  end loop;
end;
$$;

revoke all on function public.admin_save_intent(jsonb, jsonb, text) from public, anon;
revoke all on function public.admin_move(text, uuid, int) from public, anon;
grant execute on function public.admin_save_intent(jsonb, jsonb, text) to authenticated;
grant execute on function public.admin_move(text, uuid, int) to authenticated;
