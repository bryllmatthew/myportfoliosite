import { CmsImage } from "@/components/media/cms-image";
import { LightboxProvider, LightboxTrigger } from "@/components/media/lightbox";
import { ParallaxMedia } from "@/components/motion/parallax";
import type { AccentKey } from "@/types/content";

/** The 16:9 lead image on project and case study pages. Click to see the whole image, uncropped. */
export function HeroImage({ src, alt, title, accent }: { src: string; alt: string; title: string; accent?: AccentKey | null }) {
  return (
    <LightboxProvider items={[{ type: "image", url: src, alt: alt || title }]} label={`${title} image`}>
      <LightboxTrigger index={0} label={`View full image: ${alt || title}`}>
        <ParallaxMedia className="aspect-[16/9] rounded-[var(--radius-card)] border border-line bg-ink-raised">
          <CmsImage src={src} alt={alt} sizes="(min-width: 1280px) 1200px, 100vw" priority accent={accent} quality={90} />
        </ParallaxMedia>
      </LightboxTrigger>
    </LightboxProvider>
  );
}
