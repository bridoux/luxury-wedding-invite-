import Link from "next/link";
import InvitationExperience from "@/components/InvitationExperience";
import { getGuestByCode } from "@/lib/mockGuests";
import { weddingConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Personalized guest invitation route: /invite/[guestCode]
 *
 * - Valid code → personalized experience with the guest's name + greeting.
 * - Invalid code → graceful, on-brand fallback with a link to the public invite.
 */
export default async function InvitePage({
  params
}: {
  params: { guestCode: string };
}) {
  const guest = await getGuestByCode(params.guestCode);

  // ── Graceful fallback for invalid codes ──────────────────
  if (!guest) {
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center bg-romantic-gradient px-6 text-center">
        <span className="font-script text-5xl text-champagne-dark">
          {weddingConfig.couple.initials}
        </span>
        <div className="gold-divider" />
        <h1 className="font-serif text-3xl font-light text-ink">
          Invitation Not Found
        </h1>
        <p className="mt-3 max-w-md font-serif text-lg font-light text-ink-soft">
          We couldn&apos;t find an invitation for this link. Please double-check the
          link from your invitation, or view the general invitation below.
        </p>
        <Link href="/" className="btn-gold mt-6">
          View Invitation
        </Link>
      </main>
    );
  }

  // TODO (Supabase): mark guest.opened_at = now() when the page is opened.

  return (
    <InvitationExperience
      guestName={guest.fullName}
      guestCode={guest.guestCode}
      maxGuests={guest.maxGuests}
      greeting={guest.greeting}
    />
  );
}
