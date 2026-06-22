import { weddingConfig } from "@/lib/config";

export default function Loading() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-romantic-gradient">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-champagne/20 border-t-champagne" />
        <span className="font-script text-2xl text-champagne-dark">
          {weddingConfig.couple.initials}
        </span>
      </div>
      <p className="mt-6 font-sans text-xs uppercase tracking-[0.3em] text-ink-light">
        Loading…
      </p>
    </main>
  );
}
