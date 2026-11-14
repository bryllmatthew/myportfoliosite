"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Motion capability of the current device.
 *  - reduced: user asked for reduced motion → no parallax, pointer effects, or large transforms
 *  - finePointer: a precise hovering pointer (mouse/trackpad) → pointer effects allowed
 * Defaults are conservative (no pointer effects) until hydrated.
 */
export function useMotionPrefs() {
  const reduced = useReducedMotion() ?? false;
  const [finePointer, setFinePointer] = useState(false);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const width = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setFinePointer(pointer.matches);
      setWide(width.matches);
    };
    update();
    pointer.addEventListener("change", update);
    width.addEventListener("change", update);
    return () => {
      pointer.removeEventListener("change", update);
      width.removeEventListener("change", update);
    };
  }, []);

  return {
    reduced,
    finePointer,
    wide,
    /** Pointer-reactive effects: desktop, fine pointer, motion allowed. */
    pointerEffects: !reduced && finePointer && wide,
  };
}
