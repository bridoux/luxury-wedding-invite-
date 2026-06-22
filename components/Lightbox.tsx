"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useCallback } from "react";

export interface LightboxImage {
  src: string;
  caption?: string;
}

export default function Lightbox({
  images,
  index,
  onClose,
  onNavigate
}: {
  images: readonly LightboxImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const open = index !== null;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (index === null) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
    },
    [index, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  const current = index !== null ? images[index] : null;

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
          >
            ✕
          </button>

          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index! - 1 + images.length) % images.length);
            }}
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 sm:left-6"
          >
            ‹
          </button>

          <motion.figure
            key={current.src}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-3xl overflow-hidden rounded-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt={current.caption ?? "Wedding gallery photo"}
              className="max-h-[78vh] w-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            {current.caption && (
              <figcaption className="bg-black/40 py-3 text-center font-serif text-lg font-light text-white">
                {current.caption}
              </figcaption>
            )}
          </motion.figure>

          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index! + 1) % images.length);
            }}
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 sm:right-6"
          >
            ›
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
