"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";
import { Bot, CalendarCheck, Code2, Play, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { AccentKey } from "@/types/content";
import { useMotionPrefs } from "@/components/motion/use-motion-prefs";

export interface CanvasNodeLabel {
  key: AccentKey;
  label: string;
}

const DEFAULT_LABELS: Record<AccentKey, string> = {
  build: "Build",
  automate: "Automate",
  grow: "Grow",
  create: "Create",
};

/* Connector paths in a 100×100 space (stretched to the canvas, strokes stay crisp). */
const CONNECTORS = [
  { d: "M49 19 C 55 19, 52 30, 57 30", accent: "var(--color-build)" },
  { d: "M80 55 C 83 60, 76 62, 77 67", accent: "var(--color-automate)" },
  { d: "M53 86 C 48 86, 49 77, 44 77", accent: "var(--color-grow)" },
  { d: "M17 62 C 12 54, 22 46, 17 38", accent: "var(--color-create)" },
];

function useDepth(px: MotionValue<number>, py: MotionValue<number>, depth: number) {
  const x = useTransform(px, (v) => v * depth);
  const y = useTransform(py, (v) => v * depth);
  return { x, y };
}

function NodeCard({
  accent,
  label,
  className,
  children,
  depth,
  px,
  py,
}: {
  accent: AccentKey;
  label: string;
  className: string;
  children: ReactNode;
  depth: number;
  px: MotionValue<number>;
  py: MotionValue<number>;
}) {
  const style = useDepth(px, py, depth);
  const dot = {
    build: "bg-build",
    automate: "bg-automate",
    grow: "bg-grow",
    create: "bg-create",
  }[accent];
  return (
    <motion.div
      style={style}
      className={cn(
        "absolute rounded-2xl border border-line-strong/80 bg-surface/90 p-3 shadow-[0_24px_60px_-28px_rgb(0_0_0/0.8)] backdrop-blur-[2px] sm:p-4",
        className,
      )}
    >
      <div className="mb-2.5 flex items-center gap-2 sm:mb-3">
        <span className={cn("size-2 rounded-full", dot)} />
        <span className="font-display text-[0.8125rem] font-semibold tracking-tight text-paper sm:text-sm">{label}</span>
      </div>
      {children}
    </motion.div>
  );
}

/**
 * Decorative hero visual. Purely illustrative (aria-hidden): it shows the
 * Build → Automate → Grow → Create loop as a workflow canvas.
 */
export function HeroCanvas({ labels = [] }: { labels?: CanvasNodeLabel[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { pointerEffects } = useMotionPrefs();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.6 });
  const py = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.6 });
  const gridLayer = useDepth(px, py, -6);
  const lineLayer = useDepth(px, py, 4);

  const name = (key: AccentKey) => labels.find((l) => l.key === key)?.label || DEFAULT_LABELS[key];

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative aspect-square w-full select-none"
      onPointerMove={(e) => {
        if (!pointerEffects) return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
        rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
      }}
      onPointerLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
    >
      {/* Canvas plane */}
      <motion.div
        style={gridLayer}
        className="absolute inset-[4%] rounded-[1.75rem] border border-line/70 bg-ink-raised/40"
      >
        <div className="dot-grid absolute inset-0 rounded-[1.75rem] opacity-80" />
        <div className="absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(60%_50%_at_70%_20%,rgb(122_162_255/0.10),transparent_70%),radial-gradient(50%_45%_at_20%_85%,rgb(255_181_71/0.08),transparent_70%)]" />
      </motion.div>

      {/* Connectors with a travelling signal */}
      <motion.svg
        style={lineLayer}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        {CONNECTORS.map((c, i) => (
          <g key={c.d}>
            <path
              d={c.d}
              fill="none"
              stroke="var(--color-line-strong)"
              strokeWidth={1.25}
              strokeDasharray="2 3"
              vectorEffect="non-scaling-stroke"
              pathLength={100}
            />
            <path
              d={c.d}
              fill="none"
              stroke={c.accent}
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={100}
              className="hero-signal"
              style={{ animationDelay: `${i * 1.5}s` }}
            />
          </g>
        ))}
      </motion.svg>

      {/* Build */}
      <NodeCard accent="build" label={name("build")} depth={14} px={px} py={py} className="left-[2%] top-[4%] w-[47%]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Code2 className="size-3.5 text-build" />
            <span className="h-1.5 w-[38%] rounded-full bg-build/60" />
            <span className="h-1.5 w-[22%] rounded-full bg-paper/20" />
          </div>
          <div className="flex gap-1.5 pl-5">
            <span className="h-1.5 w-[28%] rounded-full bg-automate/50" />
            <span className="h-1.5 w-[40%] rounded-full bg-paper/15" />
          </div>
          <div className="flex gap-1.5 pl-5">
            <span className="h-1.5 w-[18%] rounded-full bg-paper/15" />
            <span className="h-1.5 w-[30%] rounded-full bg-grow/45" />
          </div>
          <div className="flex gap-1.5 pl-2">
            <span className="h-1.5 w-[24%] rounded-full bg-paper/20" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-line bg-ink-raised px-2 py-1.5 text-[0.6875rem] text-muted sm:text-xs">
          <span>Production</span>
          <span className="flex items-center gap-1.5 text-grow">
            <span className="size-1.5 animate-pulse-soft rounded-full bg-grow" />
            Live
          </span>
        </div>
      </NodeCard>

      {/* Automate */}
      <NodeCard accent="automate" label={name("automate")} depth={20} px={px} py={py} className="right-0 top-[17%] w-[44%]">
        <ol className="space-y-1.5 text-[0.6875rem] text-muted sm:text-xs">
          {[
            { icon: UserPlus, text: "New lead" },
            { icon: Bot, text: "AI qualifies" },
            { icon: CalendarCheck, text: "Call booked" },
          ].map(({ icon: Icon, text }, i) => (
            <li key={text} className="flex items-center gap-2 rounded-lg border border-line bg-ink-raised px-2 py-1.5">
              <Icon className={cn("size-3.5", i === 2 ? "text-grow" : "text-automate")} />
              <span className="truncate">{text}</span>
            </li>
          ))}
        </ol>
      </NodeCard>

      {/* Grow */}
      <NodeCard accent="grow" label={name("grow")} depth={16} px={px} py={py} className="bottom-[2%] right-[3%] w-[47%]">
        <div className="flex h-14 items-end gap-1 sm:h-16">
          {[28, 36, 32, 48, 44, 62, 58, 76, 70, 92].map((h, i) => (
            <span
              key={i}
              className={cn("flex-1 rounded-sm", i >= 7 ? "bg-grow" : "bg-grow/30")}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[0.6875rem] text-muted sm:text-xs">
          <span>Meta</span>
          <span>TikTok</span>
        </div>
      </NodeCard>

      {/* Create */}
      <NodeCard accent="create" label={name("create")} depth={24} px={px} py={py} className="bottom-[12%] left-0 w-[44%]">
        <div className="relative space-y-1.5">
          <div className="flex gap-1">
            <span className="h-4 w-[30%] rounded bg-create/55" />
            <span className="h-4 w-[22%] rounded bg-create/30" />
            <span className="h-4 w-[40%] rounded bg-create/45" />
          </div>
          <div className="flex gap-1">
            <span className="h-2.5 w-[46%] rounded bg-build/35" />
            <span className="h-2.5 w-[38%] rounded bg-build/20" />
          </div>
          <div className="flex gap-1">
            <span className="h-2.5 w-[64%] rounded bg-signal/30" />
          </div>
          <span className="absolute -top-1 bottom-[-4px] left-[58%] w-px bg-paper" />
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[0.6875rem] text-muted sm:text-xs">
          <Play className="size-3 fill-current text-create" />
          <span>Hook, variation 3</span>
        </div>
      </NodeCard>
    </div>
  );
}
