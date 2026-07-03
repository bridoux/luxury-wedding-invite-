"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useWeddingConfig } from "@/components/WeddingConfigProvider";

/**
 * Floating background-music toggle.
 * Gracefully degrades if no audio file is present at config.music.src.
 */
export default function MusicToggle() {
  const weddingConfig = useWeddingConfig();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (!weddingConfig.music.enabled) return;
    const audio = new Audio(weddingConfig.music.src);
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = "auto";
    audioRef.current = audio;

    const onError = () => setAvailable(false);
    audio.addEventListener("error", onError);

    // Browsers block autoplay with sound, so start on the guest's first
    // interaction (e.g. tapping "Open Invitation"). One-shot: stops listening
    // once playback begins or the guest toggles manually.
    let done = false;
    const startOnGesture = () => {
      if (done || audio.paused === false) return;
      audio
        .play()
        .then(() => {
          done = true;
          setPlaying(true);
          removeListeners();
        })
        .catch(() => {
          /* not allowed yet — wait for another gesture */
        });
    };
    const events = ["pointerdown", "touchstart", "keydown"] as const;
    const removeListeners = () => events.forEach((e) => document.removeEventListener(e, startOnGesture));
    events.forEach((e) => document.addEventListener(e, startOnGesture, { passive: true }));

    return () => {
      removeListeners();
      audio.removeEventListener("error", onError);
      audio.pause();
    };
  }, [weddingConfig.music.src, weddingConfig.music.enabled]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        await audio.play();
        setPlaying(true);
      }
    } catch {
      setAvailable(false);
    }
  };

  if (!weddingConfig.music.enabled || !available) return null;

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={playing ? "Pause background music" : "Play background music"}
      aria-pressed={playing}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-champagne/30 bg-[rgba(252,249,243,0.82)] text-champagne-dark shadow-paper backdrop-blur-md transition-colors hover:bg-ivory-50"
    >
      {playing ? (
        // Equalizer / pause icon
        <span className="flex items-end gap-[3px]" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-champagne-dark"
              animate={{ height: [6, 14, 6] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </span>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 18V5l12-2v13"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      )}
    </motion.button>
  );
}
