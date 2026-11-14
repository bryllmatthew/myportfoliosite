"use client";

import Image from "next/image";
import { useState } from "react";
import { BarChart3, Clapperboard, Code2, Workflow } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { AccentKey } from "@/types/content";

const SUPABASE_HOST = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

function isOptimizable(src: string): boolean {
  try {
    const u = new URL(src);
    // Only https Supabase Storage URLs are optimized (local dev Storage is plain http on a local IP).
    if (u.protocol !== "https:") return false;
    if (!u.pathname.startsWith("/storage/v1/object/public/")) return false;
    return SUPABASE_HOST ? u.hostname === SUPABASE_HOST : u.hostname.endsWith(".supabase.co");
  } catch {
    return src.startsWith("/");
  }
}

const ACCENT_VAR: Record<AccentKey, string> = {
  build: "var(--color-build)",
  automate: "var(--color-automate)",
  grow: "var(--color-grow)",
  create: "var(--color-create)",
};
const ACCENT_ICON = { build: Code2, automate: Workflow, grow: BarChart3, create: Clapperboard } as const;

/**
 * Stand-in when no image is set or it fails to load: a node on the dot-grid
 * canvas in the discipline's colour, echoing the hero's workflow canvas.
 */
export function MediaPlaceholder({ accent, className }: { accent?: AccentKey | null; className?: string }) {
  const key = accent ?? "build";
  const color = ACCENT_VAR[key];
  const Icon = ACCENT_ICON[key];
  return (
    <div aria-hidden className={cn("absolute inset-0 overflow-hidden bg-ink-raised", className)}>
      <div className="dot-grid absolute inset-0" />
      <div
        className="absolute inset-0 opacity-60"
        style={{ background: `radial-gradient(60% 70% at 50% 55%, color-mix(in oklab, ${color} 14%, transparent), transparent 70%)` }}
      />
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <path d="M-10 236 C 90 236, 110 152, 200 152 S 320 70, 410 70" fill="none" stroke={color} strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="3 6" />
        <circle cx="72" cy="232" r="5" fill={color} fillOpacity="0.55" />
        <circle cx="330" cy="76" r="5" fill={color} fillOpacity="0.55" />
      </svg>
      <div className="absolute left-1/2 top-1/2 flex w-[34%] min-w-24 max-w-52 -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-2xl border border-line-strong bg-surface/90 p-3 shadow-[0_20px_50px_-24px_rgb(0_0_0/0.9)] sm:p-4">
        <Icon className="size-5 sm:size-6" style={{ color }} />
        <span className="h-1.5 w-3/4 rounded-full" style={{ background: color, opacity: 0.55 }} />
        <span className="h-1.5 w-1/2 rounded-full bg-paper/15" />
      </div>
    </div>
  );
}

interface CmsImageProps {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  accent?: AccentKey | null;
  quality?: number;
}

/**
 * Fills its (relatively positioned) parent. Supabase Storage images go through
 * next/image optimization; other hosts are served as-is so admins can paste any URL.
 */
export function CmsImage({ src, alt, sizes, className, priority, accent, quality }: CmsImageProps) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <MediaPlaceholder accent={accent} />;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      unoptimized={!isOptimizable(src)}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
