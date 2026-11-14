import { cn } from "@/lib/utils/cn";
import { CmsImage } from "@/components/media/cms-image";
import { Reveal } from "@/components/motion/reveal";
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

function GalleryItem({ item, wide, fallbackTitle }: { item: MediaItem; wide: boolean; fallbackTitle: string }) {
  const caption = item.caption ? (
    <figcaption className="mt-3 text-sm text-muted">{item.caption}</figcaption>
  ) : null;

  if (item.media_type === "image") {
    return (
      <figure>
        <div className={cn("relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised", wide ? "aspect-[16/9]" : "aspect-[4/3]")}>
          <CmsImage src={item.url} alt={item.alt_text} sizes={wide ? "(min-width: 1024px) 1200px, 100vw" : "(min-width: 768px) 50vw, 100vw"} />
        </div>
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

/** Editorial gallery: every third item spans the full width. Bounded by the CMS (max 40 items). */
export function MediaGallery({ items, title }: { items: MediaItem[]; title: string }) {
  if (!items.length) return null;
  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      {items.map((item, i) => {
        const wide = i % 3 === 0 || item.media_type !== "image";
        return (
          <Reveal key={item.id} className={cn(wide && "md:col-span-2")}>
            <GalleryItem item={item} wide={wide} fallbackTitle={`${title}, media ${i + 1}`} />
          </Reveal>
        );
      })}
    </div>
  );
}
