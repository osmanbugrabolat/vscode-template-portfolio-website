-- ======================================================================
-- CV: one JSON document per language, edited from /admin/cv and rendered
-- to PDF on demand at /cv-pdf/<lang>. The shape is validated by the app
-- (src/lib/cv/schema.ts); the database only guarantees an object.
-- ======================================================================

create table if not exists public.cv_documents (
  lang        text primary key check (lang in ('tr', 'en')),
  data        jsonb not null check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 200000),
  updated_at  timestamptz not null default now()
);

drop trigger if exists cv_documents_set_updated_at on public.cv_documents;
create trigger cv_documents_set_updated_at before update on public.cv_documents
for each row execute function public.set_updated_at();

alter table public.cv_documents enable row level security;

drop policy if exists "public read cv" on public.cv_documents;
create policy "public read cv" on public.cv_documents
  for select to anon, authenticated using (true);

drop policy if exists "admin insert" on public.cv_documents;
drop policy if exists "admin update" on public.cv_documents;
create policy "admin insert" on public.cv_documents for insert to authenticated with check (public.is_admin());
create policy "admin update" on public.cv_documents for update to authenticated using (public.is_admin()) with check (public.is_admin());
-- No delete policy: the two language rows are edited, never removed.

revoke insert, update, delete, truncate on public.cv_documents from anon;
revoke delete, truncate on public.cv_documents from authenticated;

-- Edits from the dashboard / SQL editor refresh the site cache too.
drop trigger if exists cv_documents_request_revalidate on public.cv_documents;
create trigger cv_documents_request_revalidate
after insert or update or delete on public.cv_documents
for each statement execute function private.request_revalidate();

-- ----------------------------------------------------------------------
-- Explorer: a "cv" file shows the generated PDF in the visitor's language.
-- /cv-pdf is served by a route handler, so pages may not claim it.
-- ----------------------------------------------------------------------
alter table public.explorer_nodes drop constraint if exists explorer_nodes_file_type_check;
alter table public.explorer_nodes add constraint explorer_nodes_file_type_check
  check (file_type in ('markdown', 'home', 'experience', 'skills', 'pdf', 'image', 'embed', 'link', 'cv'));

alter table public.explorer_nodes drop constraint if exists route_not_reserved;
alter table public.explorer_nodes add constraint route_not_reserved
  check (route is null or route !~ '^/(api|admin|admin-login|_next|auth|cv-pdf)(/|$)');
