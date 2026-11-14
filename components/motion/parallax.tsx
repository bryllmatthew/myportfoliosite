"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useMotionPrefs } from "./use-motion-prefs";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** Max travel in px across the element's pass through the viewport. Keep it subtle. */
  amplitude?: number;
}

/**
 * Translates its content vertically as the element scrolls past.
 * Transform-only (no layout work), never intercepts scrolling.
 * Disabled under reduced motion; reduced to ~35% on touch / small screens.
 */
export function Parallax({ children, className, amplitude = 40 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, wide } = useMotionPrefs();
  const amp = reduced ? 0 : wide ? amplitude : amplitude * 0.35;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [amp, -amp]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div style={{ y }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Media that scales down from slightly enlarged as it enters, inside a clipped frame,
 * plus a light parallax drift. Used for project and case study imagery.
 */
export function ParallaxMedia({
  children,
  className,
  amplitude = 30,
}: {
  children: ReactNode;
  className?: string;
  amplitude?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, wide } = useMotionPrefs();
  const amp = reduced ? 0 : wide ? amplitude : amplitude * 0.35;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-amp, amp]);
  const scale = useTransform(scrollYProgress, [0, 0.45], reduced ? [1, 1] : [1.12, 1.04]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y, scale }} className="absolute -inset-y-[8%] inset-x-0 will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
