import { NaturalImage } from "@/components/media/cms-image";
import { LightboxProvider, LightboxTrigger } from "@/components/media/lightbox";
import type { AccentKey } from "@/types/content";

/**
 * The lead image on project and case study pages, shown whole at its own shape (never cropped)
 * and capped in height so a tall image does not push the content far down. Click to view full screen.
 */
export function HeroImage({ src, alt, title, accent }: { src: string; alt: string; title: string; accent?: AccentKey | null }) {
  return (
    <LightboxProvider items={[{ type: "image", url: src, alt: alt || title }]} label={`${title} image`}>
      <LightboxTrigger index={0} label={`View full image: ${alt || title}`} className="mx-auto w-fit max-w-full">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
          <NaturalImage
            src={src}
            alt={alt}
            sizes="(min-width: 1280px) 1200px, 100vw"
            priority
            accent={accent}
            quality={90}
            className="max-h-[80vh] w-auto max-w-full transition-transform duration-500 group-hover/lb:scale-[1.02]"
          />
        </div>
      </LightboxTrigger>
    </LightboxProvider>
  );
}
