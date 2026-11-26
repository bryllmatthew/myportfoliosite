"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { CmsImage } from "@/components/media/cms-image";
import { LightboxProvider, LightboxTrigger, useLightbox, type LightboxItem } from "@/components/media/lightbox";
import type { HomeConfig } from "@/lib/validations/content";
import type { HomeSection } from "@/types/content";

type Reel = HomeConfig<"reels">["items"][number];

const INTERVAL_MS = 3500;
/** After the visitor touches, scrolls or clicks the track, wait this long before sliding again. */
const RESUME_AFTER_MS = 8000;

const ctrl =
  "inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-paper transition-colors hover:bg-surface focus-visible:bg-surface";

/**
 * Vertical (9:16) videos in a horizontally scrolling, snapping track that advances one card at a time.
 * Six cards are visible on desktop. Auto-advance pauses on hover, focus, touch, when off-screen,
 * in a background tab, while a video is open, and under reduced motion; a pause button stops it
 * entirely. Cards show the cover image (and a silent preview on desktop hover); click to watch with sound.
 */
export function ReelsSection({ section, config }: { section: HomeSection; config: HomeConfig<"reels"> }) {
  const items = config.items.filter((r) => r.video_url);
  if (!items.length) return null;

  const viewer: LightboxItem[] = items.map((r, i) => ({
    type: "video",
    url: r.video_url,
    poster: r.poster_url || null,
    alt: r.title || `Video ${i + 1}`,
    caption: r.title || null,
    href: r.link || null,
    hrefLabel: "See the project",
  }));

  return (
    <section aria-labelledby="home-reels" className="section-y relative overflow-hidden border-t border-line">
      <LightboxProvider items={viewer} label="Video player">
        <Carousel section={section} items={items} autoplay={config.autoplay} />
      </LightboxProvider>
    </section>
  );
}

function Carousel({ section, items, autoplay }: { section: HomeSection; items: Reel[]; autoplay: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const lightbox = useLightbox();
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const hovering = useRef(false);
  const focused = useRef(false);
  const visible = useRef(false);
  const idleUntil = useRef(0);
  const lightboxOpen = useRef(false);
  const [paused, setPaused] = useState(false);
  const running = autoplay && !reduced && !paused;

  const isOpen = lightbox?.isOpen ?? false;
  useEffect(() => {
    lightboxOpen.current = isOpen;
  }, [isOpen]);

  const scrollStep = useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.querySelector("li");
    if (!track || !card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    const atStart = track.scrollLeft <= 8;
    if (dir === 1 && atEnd) track.scrollTo({ left: 0, behavior });
    else if (dir === -1 && atStart) track.scrollTo({ left: track.scrollWidth, behavior });
    else track.scrollBy({ left: dir * (card.offsetWidth + gap), behavior });
  }, [reduced]);

  // Only slide while the section is on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry?.isIntersecting ?? false;
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      if (hovering.current || focused.current || lightboxOpen.current || !visible.current || document.hidden) return;
      if (Date.now() < idleUntil.current) return;
      scrollStep(1);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [running, scrollStep]);

  const holdOff = () => {
    idleUntil.current = Date.now() + RESUME_AFTER_MS;
  };

  return (
    <div ref={rootRef} className="container-page">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          {section.eyebrow ? (
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-signal">
              <span aria-hidden className="size-1.5 rounded-full bg-signal" />
              {section.eyebrow}
            </p>
          ) : null}
          <h2 id="home-reels" className="type-h2">
            {section.heading || "Short-form video"}
          </h2>
          {section.description ? <p className="type-lead mt-5 max-w-2xl">{section.description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {autoplay && !reduced ? (
            <button type="button" className={ctrl} onClick={() => setPaused((p) => !p)} aria-label={paused ? "Resume sliding" : "Pause sliding"}>
              {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
            </button>
          ) : null}
          <button
            type="button"
            className={ctrl}
            aria-label="Previous videos"
            onClick={() => {
              holdOff();
              scrollStep(-1);
            }}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            className={ctrl}
            aria-label="Next videos"
            onClick={() => {
              holdOff();
              scrollStep(1);
            }}
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <ul
        ref={trackRef}
        aria-label="Vertical videos"
        onMouseEnter={() => (hovering.current = true)}
        onMouseLeave={() => (hovering.current = false)}
        onFocus={() => (focused.current = true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focused.current = false;
        }}
        onPointerDown={holdOff}
        onWheel={holdOff}
        onTouchStart={holdOff}
        className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] md:mt-16 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((r, i) => (
          <li key={`${r.video_url}-${i}`} className="shrink-0 basis-[62%] snap-start sm:basis-[38%] md:basis-[28%] lg:basis-[calc((100%-5rem)/6)]">
            <ReelCard reel={r} index={i} preview={!reduced} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReelCard({ reel, index, preview }: { reel: Reel; index: number; preview: boolean }) {
  const [previewing, setPreviewing] = useState(false);
  const title = reel.title || `Video ${index + 1}`;

  return (
    <LightboxTrigger index={index} icon="none" label={`Play video: ${title}`} className="rounded-[1.25rem]">
      <div
        className="relative aspect-[9/16] overflow-hidden rounded-[1.25rem] border border-line bg-ink-raised"
        onMouseEnter={() => {
          // Silent preview only with a precise pointer (desktop), never on touch.
          if (preview && window.matchMedia("(hover: hover) and (pointer: fine)").matches) setPreviewing(true);
        }}
        onMouseLeave={() => setPreviewing(false)}
      >
        {reel.poster_url ? (
          <CmsImage
            src={reel.poster_url}
            alt=""
            sizes="(min-width: 1024px) 200px, (min-width: 640px) 38vw, 62vw"
            className="transition-transform duration-500 group-hover/lb:scale-[1.03]"
          />
        ) : (
          <video src={`${reel.video_url}#t=0.5`} preload="metadata" muted playsInline aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        )}
        {previewing ? (
          <video src={reel.video_url} autoPlay muted loop playsInline aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 inline-flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-paper/30 bg-ink/50 text-paper backdrop-blur transition-[opacity,transform] duration-300 group-hover/lb:scale-110 group-hover/lb:opacity-0"
        >
          <Play className="ml-0.5 size-5 fill-current" />
        </span>
        {reel.title ? <p className="absolute inset-x-3 bottom-3 line-clamp-2 text-sm font-medium text-paper">{reel.title}</p> : null}
      </div>
    </LightboxTrigger>
  );
}
