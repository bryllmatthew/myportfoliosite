"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical travel in px (ignored under reduced motion). */
  y?: number;
  as?: "div" | "section" | "li" | "article" | "header";
}

/** Fade + rise into view, once. Reduced motion: opacity only. */
export function Reveal({ children, className, delay = 0, y = 24, as = "div" }: RevealProps) {
  const reduced = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduced ? 0.2 : 0.8, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

const container: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};

/** Parent that staggers its <StaggerItem> children into view, once. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul" | "ol";
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={container}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as];
  const item: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 28 },
    show: { opacity: 1, y: 0, transition: { duration: reduced ? 0.2 : 0.7, ease: EASE } },
  };
  return (
    <Comp className={className} variants={item}>
      {children}
    </Comp>
  );
}
