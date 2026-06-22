import Link from "next/link";
import RSVPForm from "@/components/RSVPForm";
import FloatingPetals from "@/components/FloatingPetals";
import LanguageToggle from "@/components/LanguageToggle";
import RsvpPageHeader from "@/components/RsvpPageHeader";
import { weddingConfig } from "@/lib/config";

export const metadata = {
  title: `RSVP · ${weddingConfig.couple.combined}`
};

/** Standalone RSVP page — redirects to /thank-you on success. */
export default function RsvpPage() {
  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden px-5 py-16">
      <LanguageToggle />
      <FloatingPetals count={8} />
      <div className="relative z-10 mx-auto max-w-2xl">
        <RsvpPageHeader />

        <RSVPForm redirectToThankYou />

        <div className="mt-8 text-center">
          <Link href="/" className="btn-outline">
            ← Back to Invitation
          </Link>
        </div>
      </div>
    </main>
  );
}
