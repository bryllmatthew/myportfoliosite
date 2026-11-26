"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand, Play, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export interface LightboxItem {
  type: "image" | "video";
  url: string;
  alt: string;
  caption?: string | null;
  /** Video cover image. */
  poster?: string | null;
  /** Optional page link shown under the media, e.g. the project it belongs to. */
  href?: string | null;
  hrefLabel?: string;
}

interface LightboxApi {
  open: (index: number, trigger?: HTMLElement | null) => void;
  isOpen: boolean;
}

const LightboxContext = createContext<LightboxApi | null>(null);

/** Lets carousels pause while the viewer is open. */
export function useLightbox(): LightboxApi | null {
  return useContext(LightboxContext);
}

/**
 * Full-screen viewer for a set of images and videos: shows each item uncropped at up
 * to its natural size, with previous/next, arrow keys, swipe, and Escape to close.
 * Built on <dialog>, so focus is trapped while open and returns to the trigger after.
 */
export function LightboxProvider({ items, label = "Media viewer", children }: { items: LightboxItem[]; label?: string; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const count = items.length;
  const item = index === null ? null : items[index];

  const open = useCallback((i: number, trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
    setIndex(i);
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);
  const go = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + count) % count)), [count]);

  // Sync the <dialog> with state, and lock page scroll while it is open.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (index !== null && !d.open) {
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    }
  }, [index]);

  const onClose = () => {
    document.documentElement.style.overflow = "";
    setIndex(null);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (count < 2) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  return (
    <LightboxContext.Provider value={{ open, isOpen: index !== null }}>
      {children}
      <dialog
        ref={dialogRef}
        aria-label={label}
        onClose={onClose}
        onKeyDown={onKeyDown}
        // A click on the backdrop (the dialog itself, outside the media) closes it.
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          const end = e.changedTouches[0]?.clientX;
          touchX.current = null;
          if (start == null || end == null || count < 2) return;
          if (Math.abs(end - start) > 50) go(end < start ? 1 : -1);
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-paper backdrop:bg-ink/95 backdrop:backdrop-blur-sm"
      >
        {item ? (
          <div className="pointer-events-none flex h-full w-full flex-col items-center justify-center gap-4 px-4 pb-20 pt-16 sm:px-20 sm:pb-6">
            <figure className="pointer-events-auto flex max-h-full min-h-0 flex-col items-center">
              {item.type === "image" ? (
                <FittedImage key={item.url} src={item.url} alt={item.alt} />
              ) : (
                <video
                  key={item.url}
                  src={item.url}
                  poster={item.poster ?? undefined}
                  controls
                  autoPlay
                  playsInline
                  aria-label={item.alt}
                  className="block h-auto max-h-[calc(100dvh-10rem)] w-auto max-w-full rounded-lg bg-black"
                />
              )}
              {item.caption || item.href ? (
                <figcaption className="mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm text-muted">
                  {item.caption ? <span>{item.caption}</span> : null}
                  {item.href ? (
                    <Link href={item.href} onClick={close} className="inline-flex items-center gap-1 font-medium text-signal hover:underline">
                      {item.hrefLabel ?? "See the project"}
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          </div>
        ) : null}

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 sm:px-6">
          <p className="text-sm tabular-nums text-muted" aria-live="polite">
            {count > 1 && index !== null ? `${index + 1} / ${count}` : ""}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong bg-ink/70 text-paper transition-colors hover:bg-surface"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute bottom-5 left-4 inline-flex size-11 sm:bottom-auto sm:left-5 sm:top-1/2 sm:-translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-ink/70 text-paper transition-colors hover:bg-surface"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute bottom-5 right-4 inline-flex size-11 sm:bottom-auto sm:right-5 sm:top-1/2 sm:-translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-ink/70 text-paper transition-colors hover:bg-surface"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}
      </dialog>
    </LightboxContext.Provider>
  );
}

/** Makes its content open the viewer at `index`. Shows an expand (or play) badge on hover and focus. */
export function LightboxTrigger({
  index,
  label,
  icon = "expand",
  className,
  children,
}: {
  index: number;
  label: string;
  icon?: "expand" | "play" | "none";
  className?: string;
  children: ReactNode;
}) {
  const ctx = useLightbox();
  if (!ctx) return <>{children}</>;
  const Icon = icon === "play" ? Play : Expand;
  return (
    <button
      type="button"
      onClick={(e) => ctx.open(index, e.currentTarget)}
      aria-label={label}
      className={cn("group/lb relative block w-full cursor-zoom-in text-left", icon === "play" && "cursor-pointer", className)}
    >
      {children}
      {icon !== "none" ? (
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full border border-line-strong bg-ink/75 text-paper opacity-0 backdrop-blur transition-opacity duration-200 group-hover/lb:opacity-100 group-focus-visible/lb:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <Icon className="size-4" />
        </span>
      ) : null}
    </button>
  );
}

/** Never upscale small images past this factor: beyond it they only look blurry. */
const MAX_UPSCALE = 2;

/**
 * The original file, uncropped, fitted to the screen: large images shrink to fit,
 * small ones grow (up to MAX_UPSCALE) so a 500px screenshot is not a postage stamp.
 */
function FittedImage({ src, alt }: { src: string; alt: string }) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- the original file, shown whole
    <img
      src={src}
      alt={alt}
      onLoad={(e) => {
        const img = e.currentTarget;
        const availW = window.innerWidth - (window.innerWidth >= 640 ? 160 : 32);
        const availH = window.innerHeight - 160;
        const scale = Math.min(availW / img.naturalWidth, availH / img.naturalHeight, MAX_UPSCALE);
        setSize({ width: Math.round(img.naturalWidth * scale), height: Math.round(img.naturalHeight * scale) });
      }}
      style={size ?? undefined}
      className="block h-auto max-h-[calc(100dvh-10rem)] w-auto max-w-full rounded-lg object-contain shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)]"
    />
  );
}
