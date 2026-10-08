-- Keep-alive probe: lets the daily cron (/api/keep-alive) and the health check (/api/health) reach Postgres through
-- PostgREST without reading any table. The free Supabase project is paused after ~7 days without activity.
create or replace function public.keep_alive()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select true $$;

comment on function public.keep_alive() is 'Returns true. Cheapest possible database round trip, used by the keep-alive cron and the health check.';

-- Callable by Guests on purpose (the cron and the health check have no session): it reads nothing.
revoke all on function public.keep_alive() from public;
grant execute on function public.keep_alive() to anon, authenticated;
