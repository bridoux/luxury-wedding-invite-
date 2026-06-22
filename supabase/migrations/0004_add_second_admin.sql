-- Add ladywazee@gmail.com to the admin allowlist so claim_admin() recognizes her.
-- (Her admin_users row was also inserted directly when she was first promoted.)
create or replace function public.claim_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_email  text := auth.email();
  v_allowed text[] := array['bridoux2011@gmail.com', 'ladywazee@gmail.com'];
begin
  if v_uid is null then
    return false;
  end if;

  if v_email = any (v_allowed) then
    insert into public.admin_users (user_id, email, role)
    values (v_uid, v_email, 'owner')
    on conflict (user_id) do nothing;
  end if;

  return exists (select 1 from public.admin_users a where a.user_id = v_uid);
end;
$$;

revoke all on function public.claim_admin() from public, anon;
grant execute on function public.claim_admin() to authenticated;
