import { weddingConfig } from "@/lib/config";

/**
 * Shown when someone reaches the site without a valid personal invite link.
 * The invitation itself only renders at /invite/[guestCode] for a known code.
 */
export default function PrivateGate({
  title = "A Private Invitation",
  message = "This celebration is by invitation only. Please open the personal link we sent you to view your invitation."
}: {
  title?: string;
  message?: string;
}) {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-romantic-gradient px-6 text-center">
      <span className="font-script text-5xl text-champagne-dark">{weddingConfig.couple.initials}</span>
      <div className="gold-divider" />
      <h1 className="font-serif text-3xl font-light text-ink">{title}</h1>
      <p className="mt-3 max-w-md font-serif text-lg font-light text-ink-soft">{message}</p>
      <p className="mt-8 font-sans text-xs uppercase tracking-[0.32em] text-champagne-dark/80">
        {weddingConfig.couple.combined}
      </p>
    </main>
  );
}
