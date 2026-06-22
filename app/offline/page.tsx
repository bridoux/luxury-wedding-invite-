import Link from "next/link";
import { weddingConfig } from "@/lib/config";

export const metadata = {
  title: "Offline · Wedding Invitation"
};

/** Shown by the service worker when a page is requested while offline. */
export default function OfflinePage() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-romantic-gradient px-6 text-center">
      <span className="font-script text-6xl text-champagne-dark">
        {weddingConfig.couple.initials}
      </span>
      <div className="gold-divider" />
      <h1 className="font-serif text-3xl font-light text-ink">You&apos;re Offline</h1>
      <p className="mt-3 max-w-md font-serif text-lg font-light text-ink-soft">
        It looks like you&apos;ve lost connection. Our invitation will be right
        here waiting for you once you&apos;re back online.
      </p>
      <Link href="/" className="btn-gold mt-6">
        Try Again
      </Link>
      <p className="mt-8 font-sans text-xs uppercase tracking-[0.3em] text-ink-light">
        {weddingConfig.couple.combined} · {weddingConfig.date.display}
      </p>
    </main>
  );
}
