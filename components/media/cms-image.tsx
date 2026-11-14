"use client";

import Image from "next/image";
import { useState } from "react";
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

const ACCENT_BG: Record<AccentKey, string> = {
  build: "from-build/25",
  automate: "from-automate/25",
  grow: "from-grow/25",
  create: "from-create/25",
};

/** Designed stand-in when no image is set or the image fails to load. */
export function MediaPlaceholder({
  label,
  accent,
  className,
}: {
  label?: string;
  accent?: AccentKey | null;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 overflow-hidden bg-gradient-to-br via-surface to-ink-raised",
        ACCENT_BG[accent ?? "build"],
        className,
      )}
    >
      <div className="dot-grid absolute inset-0 opacity-90" />
      {label ? (
        <span className="absolute bottom-[8%] left-[7%] max-w-[80%] font-display text-[clamp(1.5rem,4vw,3rem)] font-semibold leading-none tracking-tight text-paper/12">
          {label}
        </span>
      ) : null}
    </div>
  );
}

interface CmsImageProps {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  placeholderLabel?: string;
  accent?: AccentKey | null;
  quality?: number;
}

/**
 * Fills its (relatively positioned) parent. Supabase Storage images go through
 * next/image optimization; other hosts are served as-is so admins can paste any URL.
 */
export function CmsImage({ src, alt, sizes, className, priority, placeholderLabel, accent, quality }: CmsImageProps) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <MediaPlaceholder label={placeholderLabel} accent={accent} />;
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
