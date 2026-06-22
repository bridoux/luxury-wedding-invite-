export type AttendanceStatus = "attending" | "not_attending" | "maybe";

/** Shape collected from the RSVP form. */
export interface RsvpFormValues {
  guestCode?: string;
  fullName: string;
  email: string;
  phone: string;
  attendanceStatus: AttendanceStatus;
  guestCount: number;
  additionalGuestNames: string;
  mealPreference: string;
  dietaryRestrictions: string;
  accommodationNeeded: boolean;
  message: string;
  consentUpdates: boolean;
}

/** Row shape stored in the Supabase `rsvps` table (snake_case). */
export interface RsvpRecord {
  guest_code: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  attendance_status: AttendanceStatus;
  guest_count: number;
  additional_guest_names: string | null;
  meal_preference: string | null;
  dietary_restrictions: string | null;
  accommodation_needed: boolean;
  message: string | null;
  consent_updates: boolean;
}

export interface RsvpResult {
  success: boolean;
  mocked: boolean;
  error?: string;
}
