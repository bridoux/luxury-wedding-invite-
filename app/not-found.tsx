import Link from "next/link";
import { weddingConfig } from "@/lib/config";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-romantic-gradient px-6 text-center">
      <span className="font-script text-6xl text-champagne-dark">
        {weddingConfig.couple.initials}
      </span>
      <div className="gold-divider" />
      <h1 className="font-serif text-4xl font-light text-ink">Page Not Found</h1>
      <p className="mt-3 max-w-md font-serif text-lg font-light text-ink-soft">
        This page seems to have wandered off. Let&apos;s get you back to the celebration.
      </p>
      <Link href="/" className="btn-gold mt-6">
        Return to Invitation
      </Link>
    </main>
  );
}
