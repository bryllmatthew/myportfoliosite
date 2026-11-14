"use client";

import { useEffect, useRef } from "react";
import { useMotionPrefs } from "./use-motion-prefs";

/**
 * Ambient glow that trails the cursor with interpolation.
 * Writes CSS variables from a rAF loop: no React state, no re-renders.
 * Rendered behind content with pointer-events: none, so it never blocks clicks.
 * Only active on desktop fine-pointer devices without reduced motion.
 */
export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const { pointerEffects } = useMotionPrefs();

  useEffect(() => {
    const el = ref.current;
    if (!el || !pointerEffects) return;

    let targetX = window.innerWidth * 0.7;
    let targetY = window.innerHeight * 0.2;
    let x = targetX;
    let y = targetY;
    let frame = 0;
    let running = false;

    const tick = () => {
      x += (targetX - x) * 0.08;
      y += (targetY - y) * 0.08;
      el.style.setProperty("--glow-x", `${x.toFixed(1)}px`);
      el.style.setProperty("--glow-y", `${y.toFixed(1)}px`);
      if (Math.abs(targetX - x) > 0.5 || Math.abs(targetY - y) > 0.5) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      targetX = e.clientX;
      targetY = e.clientY;
      el.style.opacity = "1";
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [pointerEffects]);

  if (!pointerEffects) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-0 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(520px circle at var(--glow-x, 70%) var(--glow-y, 20%), rgb(122 162 255 / 0.07), rgb(255 181 71 / 0.035) 40%, transparent 70%)",
      }}
    />
  );
}
