-- BuğrAI: rule-based Q&A chatbot.
-- Run this first in the Supabase SQL Editor, then supabase/seed.sql.

-- ------------------------------------------------------------------
-- Intents: one row per answer the bot can give.
-- ------------------------------------------------------------------
create table if not exists public.chat_intents (
  id          text primary key,                      -- slug, e.g. 'education'
  category    text not null,                         -- e.g. 'about', 'projects', 'contact'
  priority    integer not null default 0,            -- higher = suggested first, wins ties
  title_tr    text not null,                         -- short question shown on suggestion chips
  title_en    text not null,
  answer_tr   text not null,
  answer_en   text not null,
  keywords    text[] not null default '{}',          -- single words, any language
  links       jsonb not null default '[]'::jsonb,    -- [{ "href": "/cv", "label": { "tr": "...", "en": "..." } }]
  follow_ups  text[] not null default '{}',          -- intent ids suggested after the answer
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Patterns: the many ways a visitor may phrase the same question.
-- ------------------------------------------------------------------
create table if not exists public.chat_patterns (
  id          bigint generated always as identity primary key,
  intent_id   text not null references public.chat_intents(id) on delete cascade on update cascade,
  lang        text not null check (lang in ('tr', 'en')),
  pattern     text not null,
  created_at  timestamptz not null default now(),
  unique (intent_id, lang, pattern)
);

create index if not exists chat_patterns_intent_id_idx on public.chat_patterns (intent_id);

-- ------------------------------------------------------------------
-- Logs: every question asked, so unanswered ones can become new patterns.
-- ------------------------------------------------------------------
create table if not exists public.chat_logs (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  lang         text not null check (lang in ('tr', 'en')),
  query        text not null,
  result_type  text not null check (result_type in ('answer', 'clarify', 'fallback', 'option')),
  intent_id    text references public.chat_intents(id) on delete set null on update cascade,
  score        real,
  candidates   text[] not null default '{}'
);

create index if not exists chat_logs_created_at_idx on public.chat_logs (created_at desc);
create index if not exists chat_logs_result_type_idx on public.chat_logs (result_type);

-- Questions the bot could not answer directly, most frequent first.
create or replace view public.chat_unanswered
with (security_invoker = true) as
select
  lower(trim(query))  as query,
  count(*)            as times_asked,
  max(created_at)     as last_asked,
  array_agg(distinct result_type) as result_types
from public.chat_logs
where result_type in ('fallback', 'clarify')
group by lower(trim(query))
order by times_asked desc, last_asked desc;

-- ------------------------------------------------------------------
-- updated_at bookkeeping
-- ------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists chat_intents_set_updated_at on public.chat_intents;
create trigger chat_intents_set_updated_at
before update on public.chat_intents
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- Security: only the server (secret / service_role key) may read or write.
-- RLS is on with no policies, so the public anon key gets nothing.
-- ------------------------------------------------------------------
alter table public.chat_intents  enable row level security;
alter table public.chat_patterns enable row level security;
alter table public.chat_logs     enable row level security;
