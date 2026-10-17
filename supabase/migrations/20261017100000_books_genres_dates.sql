-- Books: reading start date and genre tags (used by the sidebar filters).

alter table public.books add column if not exists started_on date;
alter table public.books add column if not exists genres text[] not null default '{}';

alter table public.books drop constraint if exists books_genres_check;
alter table public.books add constraint books_genres_check
  check (cardinality(genres) <= 8 and char_length(array_to_string(genres, ',')) <= 400);

alter table public.books drop constraint if exists books_dates_order_check;
alter table public.books add constraint books_dates_order_check
  check (started_on is null or finished_on is null or started_on <= finished_on);
