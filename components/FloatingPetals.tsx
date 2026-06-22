"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Petal {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  opacity: number;
  hue: string;
}

/**
 * Subtle, performant floating petals / particles for ambient luxury.
 * Uses transform-only animations (GPU-friendly) and respects reduced-motion.
 *
 * IMPORTANT: petals are generated on the CLIENT only (after mount). Generating
 * Math.random() values during render would differ between server and client
 * and break hydration. SSR renders nothing; petals fade in once mounted.
 */
export default function FloatingPetals({ count = 12 }: { count?: number }) {
  const reduce = useReducedMotion();
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 8 + Math.random() * 14,
        delay: Math.random() * 8,
        duration: 12 + Math.random() * 12,
        drift: (Math.random() - 0.5) * 80,
        opacity: 0.25 + Math.random() * 0.35,
        hue: Math.random() > 0.5 ? "#EFDFC6" : "#D7AA7E"
      }))
    );
  }, [count]);

  if (reduce || petals.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {petals.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-5%] rounded-full blur-[0.5px]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.3,
            background: `radial-gradient(circle at 30% 30%, ${p.hue}, transparent 75%)`,
            opacity: p.opacity
          }}
          initial={{ y: "-10vh", x: 0, rotate: 0 }}
          animate={{
            y: "110vh",
            x: [0, p.drift, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
