"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useMotionPrefs } from "./use-motion-prefs";

/**
 * Soft light that follows the pointer across a card (CSS variables only).
 * Desktop fine-pointer only; inert on touch and under reduced motion.
 */
export function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { pointerEffects } = useMotionPrefs();
  return (
    <div
      ref={ref}
      className={cn("group/spot relative", className)}
      onPointerMove={(e) => {
        if (!pointerEffects || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        ref.current.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
        ref.current.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
      }}
    >
      {children}
      {pointerEffects ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
          style={{
            background:
              "radial-gradient(360px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgb(233 237 245 / 0.06), transparent 65%)",
          }}
        />
      ) : null}
    </div>
  );
}
