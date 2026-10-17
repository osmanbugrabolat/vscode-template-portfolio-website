-- Books: optional shelf colour picked in the admin panel (null = assigned automatically).
-- Stored as the hex of one of the palette colours defined in src/lib/books/appearance.ts.

alter table public.books add column if not exists spine_color text;

alter table public.books drop constraint if exists books_spine_color_check;
alter table public.books add constraint books_spine_color_check
  check (spine_color is null or spine_color ~ '^#[0-9a-f]{6}$');
