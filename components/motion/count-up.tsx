"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { decimalsOf, formatNumber } from "@/lib/utils/format";

interface CountUpProps {
  value: number;
  prefix?: string | null;
  suffix?: string | null;
  className?: string;
  duration?: number;
}

/**
 * Smoothly counts up to a metric when it scrolls into view.
 * The final value is server-rendered (correct for SEO, no-JS and screen readers);
 * the animation only rewrites the visible text node, never React state.
 */
export function CountUp({ value, prefix, suffix, className, duration = 1.6 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduced = useReducedMotion();
  const decimals = decimalsOf(value);
  const final = `${prefix ?? ""}${formatNumber(value, decimals)}${suffix ?? ""}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        el.textContent = `${prefix ?? ""}${formatNumber(latest, decimals)}${suffix ?? ""}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduced, value, prefix, suffix, decimals, duration]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden>
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
