-- The keep-alive probe works for Guests and signed-in users, and cannot be abused to read anything.
begin;
select plan(5);

select has_function('public', 'keep_alive', array[]::text[], 'public.keep_alive() exists');
select is(public.keep_alive(), true, 'keep_alive returns true');
select is(
  (select prosecdef from pg_proc where oid = 'public.keep_alive()'::regprocedure),
  false,
  'keep_alive runs with the rights of the caller (not SECURITY DEFINER)'
);

set local role anon;
select is(public.keep_alive(), true, 'a Guest (anon) can call keep_alive');
reset role;

set local role authenticated;
select is(public.keep_alive(), true, 'a signed-in user can call keep_alive');
reset role;

select * from finish();
rollback;
