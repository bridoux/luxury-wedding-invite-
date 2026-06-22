"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWeddingConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calc(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-[4.6rem] w-[4.6rem] items-center justify-center rounded-lg bg-ivory-50 shadow-paper sm:h-28 sm:w-28">
        <span className="pointer-events-none absolute inset-[5px] rounded border border-champagne/35" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="count-number font-serif text-4xl text-ink sm:text-6xl"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-4 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-champagne-dark sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const weddingConfig = useWeddingConfig();
  const t = useT();
  const target = new Date(weddingConfig.date.iso).getTime();
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(calc(target));
    const id = setInterval(() => setTime(calc(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const isPast =
    time && time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;

  return (
    <div className="text-center">
      {isPast ? (
        <p className="font-serif text-3xl font-light text-champagne-dark">{t.countdown.today} 🥂</p>
      ) : (
        <div className="flex items-start justify-center gap-3 sm:gap-6">
          <Unit value={time?.days ?? 0} label={t.countdown.days} />
          <Unit value={time?.hours ?? 0} label={t.countdown.hours} />
          <Unit value={time?.minutes ?? 0} label={t.countdown.minutes} />
          <Unit value={time?.seconds ?? 0} label={t.countdown.seconds} />
        </div>
      )}
    </div>
  );
}
