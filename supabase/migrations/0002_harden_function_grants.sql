-- Security hardening for the functions created in 0001.
-- Addresses Supabase database-linter warnings:
--   • 0011 function_search_path_mutable (set_updated_at)
--   • 0028/0029 (un)authenticated SECURITY DEFINER executable — for the two
--     trigger-only functions, which should not be in the REST API at all.
--
-- NOTE: get_guest_by_code() and record_invitation_open() remain executable by
-- anon/authenticated ON PURPOSE — they are the public, column-limited RPCs the
-- guest app calls. The linter will still flag them; that is expected.

-- Pin search_path on the trigger helper.
alter function public.set_updated_at() set search_path = '';

-- Trigger-only functions never need REST execute privileges.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.sync_guest_on_rsvp() from public, anon, authenticated;

-- is_admin() is used inside RLS policies (needs `authenticated`) but anon never
-- references it; remove anon's ability to call it via RPC.
revoke execute on function public.is_admin() from anon;
