revoke execute on function public.has_role(uuid, public.app_role) from anon, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.handle_default_role() from anon, authenticated, public;

-- has_role must remain executable by authenticated so RLS policies can invoke it
grant execute on function public.has_role(uuid, public.app_role) to authenticated;