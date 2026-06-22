import type { Guest } from "@/types/guest";
import { getSupabase } from "@/lib/supabaseClient";

/**
 * Guest lookup for personalized invite links: /invite/[guestCode]
 *
 * - When Supabase is configured → calls the public-safe `get_guest_by_code` RPC
 *   (SECURITY DEFINER, returns only guest-safe columns).
 * - Otherwise → falls back to the local mock list below, so the app still runs
 *   with no backend.
 */
export const mockGuests: Guest[] = [
  {
    guestCode: "ruth-eric",
    fullName: "Beloved Guest",
    maxGuests: 2,
    inviteStatus: "sent",
    rsvpStatus: "pending",
    greeting: "We are so happy to share this day with you."
  },
  {
    guestCode: "amara",
    fullName: "Amara Okafor",
    maxGuests: 2,
    inviteStatus: "sent",
    rsvpStatus: "pending",
    greeting: "Your friendship means the world to us."
  },
  {
    guestCode: "the-bennetts",
    fullName: "The Bennett Family",
    maxGuests: 4,
    inviteStatus: "sent",
    rsvpStatus: "pending",
    greeting: "We can't wait to celebrate with the whole family."
  },
  {
    guestCode: "james",
    fullName: "James Carter",
    maxGuests: 1,
    inviteStatus: "sent",
    rsvpStatus: "pending"
  }
];

function mockLookup(code: string): Guest | null {
  const normalized = code.trim().toLowerCase();
  return mockGuests.find((g) => g.guestCode.toLowerCase() === normalized) ?? null;
}

/**
 * Look up a guest by their unique code.
 * Returns `null` if not found (caller renders a graceful fallback).
 */
export async function getGuestByCode(code: string): Promise<Guest | null> {
  const supabase = getSupabase();
  if (!supabase) return mockLookup(code);

  try {
    const { data, error } = await supabase.rpc("get_guest_by_code", {
      p_code: code.trim().toLowerCase()
    });
    if (error) {
      console.warn("get_guest_by_code failed, using mock:", error.message);
      return mockLookup(code);
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;

    return {
      guestCode: row.guest_code,
      fullName: row.full_name,
      maxGuests: row.max_guests ?? 1,
      inviteStatus: "sent",
      rsvpStatus: row.rsvp_status ?? "pending",
      greeting: row.greeting ?? undefined
    };
  } catch (err) {
    console.warn("get_guest_by_code threw, using mock:", err);
    return mockLookup(code);
  }
}

/**
 * Record an invitation open (fire-and-forget). No-op when Supabase isn't set up.
 * Safe to call from the browser — uses the public `record_invitation_open` RPC.
 */
export async function recordInvitationOpen(code: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.rpc("record_invitation_open", {
      p_guest_code: code.trim().toLowerCase(),
      p_user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      p_referrer:
        typeof document !== "undefined" ? document.referrer.slice(0, 500) || null : null
    });
  } catch {
    /* tracking is best-effort; ignore failures */
  }
}
