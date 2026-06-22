export type InviteStatus = "sent" | "opened" | "responded";
export type GuestRsvpStatus = "pending" | "attending" | "not_attending" | "maybe";

/** A personalized guest invitation record. */
export interface Guest {
  guestCode: string;
  fullName: string;
  email?: string;
  phone?: string;
  maxGuests: number;
  inviteStatus: InviteStatus;
  rsvpStatus: GuestRsvpStatus;
  /** Optional warm, personal greeting line shown on their invite page. */
  greeting?: string;
}
