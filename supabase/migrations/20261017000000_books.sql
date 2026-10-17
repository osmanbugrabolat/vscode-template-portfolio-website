-- ======================================================================
-- Online library: books the owner has read, edited from /admin/books and
-- shown on the standalone page /online-kutuphanem (not linked from the site).
-- ======================================================================

create table if not exists public.books (
  id              uuid primary key default gen_random_uuid(),
  title           text not null check (char_length(title) between 1 and 200),
  author          text not null default '' check (char_length(author) <= 200),
  cover_url       text not null default '' check (char_length(cover_url) <= 2000),
  isbn            text not null default '' check (char_length(isbn) <= 20),
  published_year  smallint check (published_year between 0 and 2200),
  page_count      integer check (page_count between 1 and 20000),
  description     text not null default '' check (char_length(description) <= 4000),
  status          text not null default 'read' check (status in ('read', 'reading', 'want')),
  rating          smallint check (rating between 1 and 5),
  finished_on     date,
  notes           text not null default '' check (char_length(notes) <= 8000),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists books_status_finished_idx on public.books (status, finished_on desc nulls last, created_at desc);

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at before update on public.books
for each row execute function public.set_updated_at();

alter table public.books enable row level security;

drop policy if exists "public read books" on public.books;
create policy "public read books" on public.books
  for select to anon, authenticated using (true);

drop policy if exists "admin insert" on public.books;
drop policy if exists "admin update" on public.books;
drop policy if exists "admin delete" on public.books;
create policy "admin insert" on public.books for insert to authenticated with check (public.is_admin());
create policy "admin update" on public.books for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.books for delete to authenticated using (public.is_admin());

revoke insert, update, delete, truncate on public.books from anon;

-- Edits from the dashboard / SQL editor refresh the site cache too.
drop trigger if exists books_request_revalidate on public.books;
create trigger books_request_revalidate
after insert or update or delete on public.books
for each statement execute function private.request_revalidate();

-- /online-kutuphanem is a route handler of its own, so explorer pages may not claim it.
alter table public.explorer_nodes drop constraint if exists route_not_reserved;
alter table public.explorer_nodes add constraint route_not_reserved
  check (route is null or route !~ '^/(api|admin|admin-login|_next|auth|cv-pdf|online-kutuphanem)(/|$)');
