"use client";

import { useEffect } from "react";
import { weddingConfig } from "@/lib/config";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-romantic-gradient px-6 text-center">
      <span className="font-script text-6xl text-champagne-dark">
        {weddingConfig.couple.initials}
      </span>
      <div className="gold-divider" />
      <h1 className="font-serif text-3xl font-light text-ink">Something Went Wrong</h1>
      <p className="mt-3 max-w-md font-serif text-lg font-light text-ink-soft">
        A small hiccup occurred. Please try again.
      </p>
      <button type="button" onClick={reset} className="btn-gold mt-6">
        Try Again
      </button>
    </main>
  );
}
