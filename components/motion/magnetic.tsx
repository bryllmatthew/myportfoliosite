"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useMotionPrefs } from "./use-motion-prefs";

/**
 * Low-displacement magnetic pull toward the cursor for selected primary CTAs.
 * Max travel is a few pixels so the click target never moves away from the pointer.
 */
export function Magnetic({ children, strength = 0.18, max = 8 }: { children: ReactNode; strength?: number; max?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { pointerEffects } = useMotionPrefs();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 });

  if (!pointerEffects) return <span className="inline-flex">{children}</span>;

  const clamp = (v: number) => Math.max(-max, Math.min(max, v));

  return (
    <motion.span
      ref={ref}
      className="inline-flex"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set(clamp((e.clientX - (rect.left + rect.width / 2)) * strength));
        y.set(clamp((e.clientY - (rect.top + rect.height / 2)) * strength));
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
