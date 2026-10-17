-- TRUNCATE ignores row level security, so the admin-only policies on public.books
-- do not cover it. Like the other content tables, nobody gets it through the API.
revoke truncate on public.books from anon, authenticated;
