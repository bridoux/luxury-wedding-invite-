-- RSVP submit as insert-or-update (by guest_code), so a guest re-submitting
-- updates their existing response instead of creating a duplicate row.
-- SECURITY DEFINER so anon can call it without broad UPDATE rights on rsvps.
create or replace function public.submit_rsvp(
  p_guest_code text,
  p_full_name text,
  p_email text,
  p_phone text,
  p_attendance_status public.attendance_status,
  p_guest_count integer,
  p_additional_guest_names text,
  p_meal_preference text,
  p_dietary_restrictions text,
  p_accommodation_needed boolean,
  p_message text,
  p_consent_updates boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := nullif(btrim(p_guest_code), '');
  v_id   uuid;
begin
  if p_full_name is null or btrim(p_full_name) = '' then
    raise exception 'full_name is required';
  end if;

  -- Only de-duplicate when there's a guest code (open RSVPs always insert).
  if v_code is not null then
    select id into v_id from public.rsvps where guest_code = v_code order by created_at asc limit 1;
  end if;

  if v_id is not null then
    update public.rsvps set
      full_name              = p_full_name,
      email                  = p_email,
      phone                  = p_phone,
      attendance_status      = p_attendance_status,
      guest_count            = coalesce(p_guest_count, 1),
      additional_guest_names = p_additional_guest_names,
      meal_preference        = p_meal_preference,
      dietary_restrictions   = p_dietary_restrictions,
      accommodation_needed   = coalesce(p_accommodation_needed, false),
      message                = p_message,
      consent_updates        = coalesce(p_consent_updates, false)
    where id = v_id;
  else
    insert into public.rsvps (
      guest_code, full_name, email, phone, attendance_status, guest_count,
      additional_guest_names, meal_preference, dietary_restrictions,
      accommodation_needed, message, consent_updates, source
    ) values (
      v_code, p_full_name, p_email, p_phone, p_attendance_status, coalesce(p_guest_count, 1),
      p_additional_guest_names, p_meal_preference, p_dietary_restrictions,
      coalesce(p_accommodation_needed, false), p_message, coalesce(p_consent_updates, false), 'web'
    );
  end if;
end;
$$;

revoke all on function public.submit_rsvp(text, text, text, text, public.attendance_status, integer, text, text, text, boolean, text, boolean) from public, anon;
grant execute on function public.submit_rsvp(text, text, text, text, public.attendance_status, integer, text, text, text, boolean, text, boolean) to anon, authenticated;

-- Keep guest status in sync on re-submit too (was insert-only).
drop trigger if exists trg_rsvps_sync_guest on public.rsvps;
create trigger trg_rsvps_sync_guest
  after insert or update on public.rsvps
  for each row execute function public.sync_guest_on_rsvp();
