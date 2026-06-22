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

    const { error } = await supabase.from("rsvps").insert(record);

    if (error) {
      return { success: false, mocked: false, error: error.message };
    }

    return { success: true, mocked: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, mocked: false, error: message };
  }
}
