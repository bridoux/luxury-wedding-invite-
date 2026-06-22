"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Botanical line-art ornaments — hand-tuned SVG paths in champagne gold.
 * Used for dividers, card corners, and the monogram crest.
 */

const GOLD = "#9A6A3C";

/** Horizontal botanical divider with a centered diamond + leaf sprigs. */
export function FloralDivider({
  className = "",
  width = 220
}: {
  className?: string;
  width?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={`mx-auto flex justify-center ${className}`}
      aria-hidden="true"
    >
      <svg width={width} height="24" viewBox="0 0 220 24" fill="none">
        <g stroke={GOLD} strokeWidth="1" strokeLinecap="round" fill="none">
          {/* tapering side lines */}
          <path d="M6 12 H84" opacity="0.5" />
          <path d="M214 12 H136" opacity="0.5" />
          {/* graduated beads */}
          {[90, 97, 104].map((x, i) => (
            <circle key={`l${x}`} cx={x} cy="12" r={1.6 - i * 0.35} fill={GOLD} stroke="none" opacity={0.85 - i * 0.2} />
          ))}
          {[130, 123, 116].map((x, i) => (
            <circle key={`r${x}`} cx={x} cy="12" r={1.6 - i * 0.35} fill={GOLD} stroke="none" opacity={0.85 - i * 0.2} />
          ))}
          {/* flat leaf-lenses flanking the centre */}
          <path d="M104 12 q3.5 -4 7 0 q-3.5 4 -7 0Z" fill={GOLD} fillOpacity="0.2" />
          <path d="M116 12 q-3.5 -4 -7 0 q3.5 4 7 0Z" fill={GOLD} fillOpacity="0.2" />
          {/* centre diamond + dot */}
          <path d="M110 4 L116 12 L110 20 L104 12 Z" fill={GOLD} fillOpacity="0.1" />
          <circle cx="110" cy="12" r="1.5" fill={GOLD} stroke="none" />
        </g>
      </svg>
    </motion.div>
  );
}

/** Decorative corner flourish; place 4 (rotated) inside a card. */
export function CornerFlourish({
  className = "",
  size = 56
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
    >
      <g stroke={GOLD} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7">
        <path d="M6 6 C 6 26, 16 36, 36 36" />
        <path d="M6 6 C 26 6, 36 16, 36 36" opacity="0.5" />
        {/* small leaves along the curve */}
        <path d="M20 12 q6 -2 9 2 q-6 2 -9 -2" fill={GOLD} fillOpacity="0.18" />
        <path d="M12 20 q-2 6 2 9 q2 -6 -2 -9" fill={GOLD} fillOpacity="0.18" />
        <circle cx="6" cy="6" r="1.4" fill={GOLD} stroke="none" />
      </g>
    </svg>
  );
}

/** Four corner flourishes positioned absolutely inside a relatively-positioned card. */
export function CardCorners() {
  return (
    <div className="pointer-events-none absolute inset-2 z-10" aria-hidden="true">
      <CornerFlourish className="absolute left-1 top-1" />
      <CornerFlourish className="absolute right-1 top-1 -scale-x-100" />
      <CornerFlourish className="absolute bottom-1 left-1 -scale-y-100" />
      <CornerFlourish className="absolute bottom-1 right-1 -scale-100" />
    </div>
  );
}

/** Monogram crest: initials inside a botanical laurel ring. */
export function MonogramCrest({
  initials,
  size = 132
}: {
  initials: string;
  size?: number;
}) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute inset-0"
        viewBox="0 0 132 132"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="66" cy="66" r="60" stroke={GOLD} strokeWidth="1" opacity="0.5" />
        <circle cx="66" cy="66" r="53" stroke={GOLD} strokeWidth="0.6" opacity="0.3" />
        {/* laurel sprigs left + right */}
        <g stroke={GOLD} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.85">
          <path d="M34 96 C 26 82, 28 64, 40 54" />
          <path d="M98 96 C 106 82, 104 64, 92 54" />
        </g>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <path
              d={`M${34 - i * 1.5} ${90 - i * 13} q-8 -2 -11 3 q8 2 11 -3Z`}
              fill={GOLD}
              fillOpacity="0.22"
              stroke="none"
            />
            <path
              d={`M${98 + i * 1.5} ${90 - i * 13} q8 -2 11 3 q-8 2 -11 -3Z`}
              fill={GOLD}
              fillOpacity="0.22"
              stroke="none"
            />
          </g>
        ))}
      </svg>
      <span className="script text-3xl" style={{ fontSize: size * 0.3 }}>
        {initials}
      </span>
    </div>
  );
}

/** Large faint botanical corner spray for section/hero backgrounds. */
export function BotanicalSpray({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="240"
      height="240"
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      <g stroke={GOLD} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5">
        <path d="M10 230 C 60 200, 90 150, 100 90 C 104 60, 100 30, 90 10" />
        {Array.from({ length: 7 }).map((_, i) => {
          const t = i / 6;
          const x = 10 + t * 80;
          const y = 230 - t * 220;
          return (
            <g key={i}>
              <path
                d={`M${x} ${y} q-18 -6 -26 6 q18 6 26 -6`}
                fill={GOLD}
                fillOpacity="0.12"
              />
              <path
                d={`M${x} ${y} q18 -8 30 2 q-18 8 -30 -2`}
                fill={GOLD}
                fillOpacity="0.1"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
