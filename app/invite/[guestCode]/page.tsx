import InvitationExperience from "@/components/InvitationExperience";
import PrivateGate from "@/components/PrivateGate";
import { getGuestByCode } from "@/lib/mockGuests";

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

  // ── Invalid code → private gate (no public bypass) ───────
  if (!guest) {
    return (
      <PrivateGate
        title="Invitation Not Found"
        message="We couldn't find an invitation for this link. Please double-check the personal link from your invitation."
      />
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
