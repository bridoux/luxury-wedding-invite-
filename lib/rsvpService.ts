import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { RsvpFormValues, RsvpRecord, RsvpResult } from "@/types/rsvp";

/** Map the camelCase form values into the snake_case DB row shape. */
function toRecord(values: RsvpFormValues): RsvpRecord {
  return {
    guest_code: values.guestCode?.trim() || null,
    full_name: values.fullName.trim(),
    email: values.email?.trim() || null,
    phone: values.phone?.trim() || null,
    attendance_status: values.attendanceStatus,
    guest_count: Number(values.guestCount) || 1,
    additional_guest_names: values.additionalGuestNames?.trim() || null,
    meal_preference: values.mealPreference?.trim() || null,
    dietary_restrictions: values.dietaryRestrictions?.trim() || null,
    accommodation_needed: Boolean(values.accommodationNeeded),
    message: values.message?.trim() || null,
    consent_updates: Boolean(values.consentUpdates)
  };
}

/**
 * Submit an RSVP.
 *
 * - When Supabase is configured → inserts into the `rsvps` table.
 * - When NOT configured → gracefully mocks success (logs to console),
 *   so the app is fully demoable without a backend.
 */
export async function submitRsvp(
  values: RsvpFormValues
): Promise<RsvpResult> {
  const record = toRecord(values);

  if (!isSupabaseConfigured) {
    // Simulate network latency for a realistic UX.
    await new Promise((r) => setTimeout(r, 900));
    // eslint-disable-next-line no-console
    console.info("[RSVP mock] Supabase not configured — submission mocked:", record);
    return { success: true, mocked: true };
  }

  try {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: true, mocked: true };
    }

    // Insert-or-update by guest_code via SECURITY DEFINER RPC, so a guest who
    // re-submits updates their existing RSVP instead of creating a duplicate.
    const { error } = await supabase.rpc("submit_rsvp", {
      p_guest_code: record.guest_code,
      p_full_name: record.full_name,
      p_email: record.email,
      p_phone: record.phone,
      p_attendance_status: record.attendance_status,
      p_guest_count: record.guest_count,
      p_additional_guest_names: record.additional_guest_names,
      p_meal_preference: record.meal_preference,
      p_dietary_restrictions: record.dietary_restrictions,
      p_accommodation_needed: record.accommodation_needed,
      p_message: record.message,
      p_consent_updates: record.consent_updates
    });

    if (error) {
      return { success: false, mocked: false, error: error.message };
    }

    return { success: true, mocked: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, mocked: false, error: message };
  }
}
