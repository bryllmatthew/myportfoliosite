import { cn } from "@/lib/utils/cn";
import { NaturalImage } from "@/components/media/cms-image";
import { Reveal } from "@/components/motion/reveal";
import { LightboxProvider, LightboxTrigger, type LightboxItem } from "@/components/media/lightbox";
import { isVideoFile, toEmbedUrl } from "@/lib/utils/video";
import type { MediaItem } from "@/types/content";

export function VideoEmbed({ url, title, className }: { url: string; title: string; className?: string }) {
  const embed = toEmbedUrl(url);
  if (embed) {
    return (
      <div className={cn("relative aspect-video overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised", className)}>
        <iframe
          src={embed}
          title={title}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }
  if (isVideoFile(url)) {
    return (
      <div className={cn("relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised", className)}>
        <video src={url} controls preload="none" playsInline className="aspect-video h-auto w-full" aria-label={title} />
      </div>
    );
  }
  return null;
}

function GalleryItem({
  item,
  fallbackTitle,
  imageIndex,
  sizes = "(min-width: 768px) 50vw, 100vw",
  fitted = false,
}: {
  item: MediaItem;
  fallbackTitle: string;
  imageIndex: number;
  sizes?: string;
  /** Show at its own width, centred and capped in height (for a lone image), instead of filling the column. */
  fitted?: boolean;
}) {
  const caption = item.caption ? <figcaption className="mt-3 text-sm text-muted">{item.caption}</figcaption> : null;

  if (item.media_type === "image") {
    return (
      <figure>
        <LightboxTrigger
          index={imageIndex}
          label={`View full image: ${item.alt_text || item.caption || fallbackTitle}`}
          className={fitted ? "mx-auto w-fit max-w-full" : undefined}
        >
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
            <NaturalImage
              src={item.url}
              alt={item.alt_text}
              sizes={sizes}
              className={cn("transition-transform duration-500 group-hover/lb:scale-[1.02]", fitted ? "max-h-[85vh] w-auto max-w-full" : "w-full")}
            />
          </div>
        </LightboxTrigger>
        {caption}
      </figure>
    );
  }

  if (item.media_type === "video") {
    return (
      <figure>
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
          <video
            src={item.url}
            poster={item.thumbnail_url ?? undefined}
            controls
            preload="none"
            playsInline
            className="aspect-video h-auto w-full"
            aria-label={item.alt_text || item.caption || fallbackTitle}
          />
        </div>
        {caption}
      </figure>
    );
  }

  return (
    <figure>
      <VideoEmbed url={item.url} title={item.alt_text || item.caption || fallbackTitle} />
      {caption}
    </figure>
  );
}

type Run = { kind: "images" | "other"; items: MediaItem[] };

/** Groups consecutive images so they share a masonry block; videos and embeds sit between them, full width. */
function toRuns(items: MediaItem[]): Run[] {
  const runs: Run[] = [];
  for (const item of items) {
    const kind = item.media_type === "image" ? "images" : "other";
    const last = runs.at(-1);
    if (last && last.kind === "images" && kind === "images") last.items.push(item);
    else runs.push({ kind, items: [item] });
  }
  return runs;
}

/**
 * Project gallery. Every image is shown whole at its own shape (never cropped), in a
 * two-column masonry layout (a lone image is centred), and opens in a full-screen viewer.
 * Bounded by the CMS (max 40 items).
 */
export function MediaGallery({ items, title }: { items: MediaItem[]; title: string }) {
  if (!items.length) return null;
  const images = items.filter((m) => m.media_type === "image");
  const viewer: LightboxItem[] = images.map((m, i) => ({
    type: "image",
    url: m.url,
    alt: m.alt_text || `${title}, image ${i + 1}`,
    caption: m.caption,
  }));
  const fallback = (item: MediaItem) => `${title}, media ${items.indexOf(item) + 1}`;

  return (
    <LightboxProvider items={viewer} label={`${title} images`}>
      <div className="flex flex-col gap-6 md:gap-8">
        {toRuns(items).map((run) => {
          const first = run.items[0]!;
          if (run.kind === "other") {
            return (
              <Reveal key={first.id}>
                <GalleryItem item={first} fallbackTitle={fallback(first)} imageIndex={-1} />
              </Reveal>
            );
          }
          if (run.items.length === 1) {
            return (
              <Reveal key={first.id}>
                <GalleryItem
                  item={first}
                  fallbackTitle={fallback(first)}
                  imageIndex={images.indexOf(first)}
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  fitted
                />
              </Reveal>
            );
          }
          return (
            <div key={first.id} className="gap-8 md:columns-2">
              {run.items.map((item) => (
                <Reveal key={item.id} className="mb-6 break-inside-avoid md:mb-8">
                  <GalleryItem item={item} fallbackTitle={fallback(item)} imageIndex={images.indexOf(item)} />
                </Reveal>
              ))}
            </div>
          );
        })}
      </div>
    </LightboxProvider>
  );
}
