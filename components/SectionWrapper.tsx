"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { FloralDivider } from "@/components/Ornaments";

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
  /** Optional script accent shown above the serif title (romantic flourish). */
  script?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Section shell with refined romantic header hierarchy:
 *   eyebrow (ruled) → script accent → serif title → floral divider
 * plus a gentle scroll-reveal.
 */
export default function SectionWrapper({
  id,
  children,
  className = "",
  eyebrow,
  title,
  script
}: SectionWrapperProps) {
  const reduce = useReducedMotion();

  return (
    <section
      id={id}
      className={`relative mx-auto w-full max-w-5xl scroll-mt-24 px-6 py-24 sm:px-8 sm:py-32 ${className}`}
    >
      {(eyebrow || title || script) && (
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mb-14 flex flex-col items-center text-center"
        >
          {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
          {script && <p className="script mb-1 text-4xl sm:text-5xl">{script}</p>}
          {title && <h2 className="title">{title}</h2>}
          <FloralDivider className="mt-7" />
        </motion.header>
      )}

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-70px" }}
        transition={{ duration: 1, ease: EASE, delay: 0.08 }}
      >
        {children}
      </motion.div>
    </section>
  );
}
