import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { HeroCanvas, type CanvasNodeLabel } from "@/components/public/hero-canvas";
import type { HomeConfig } from "@/lib/validations/content";
import type { HomeSection, Profile } from "@/types/content";

interface HeroProps {
  section: HomeSection | undefined;
  config: HomeConfig<"hero">;
  profile: Profile | null;
  nodeLabels: CanvasNodeLabel[];
}

export function HomeHero({ section, config, profile, nodeLabels }: HeroProps) {
  const heading = section?.heading || "Software, automation, campaigns and creative, built as one system.";
  const identity = [profile?.display_name, profile?.headline].filter(Boolean).join(", ");
  const showAvailability = config.show_availability && profile?.is_available && profile.availability_label;

  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden pb-16 pt-28 sm:pt-36 lg:pb-24 lg:pt-36">
      <div aria-hidden className="dot-grid dot-grid-fade absolute inset-0" />
      <div
        aria-hidden
        className="absolute -right-[20%] -top-[30%] h-[42rem] w-[56rem] rounded-full bg-[radial-gradient(closest-side,rgb(122_162_255/0.16),transparent)] blur-2xl"
      />
      <div className="container-page relative grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          {identity || showAvailability ? (
            <Reveal className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm" y={12}>
              {identity ? <p className="text-muted">{identity}</p> : null}
              {showAvailability ? (
                <p className="inline-flex items-center gap-2 rounded-full border border-grow/30 bg-grow/10 px-3 py-1 text-grow">
                  <span aria-hidden className="size-1.5 animate-pulse-soft rounded-full bg-grow" />
                  {profile?.availability_label}
                </p>
              ) : null}
            </Reveal>
          ) : null}

          <Reveal delay={0.05}>
            <h1 id="hero-heading" className="type-display max-w-[16ch]">
              {heading}
            </h1>
          </Reveal>

          {section?.description ? (
            <Reveal delay={0.15}>
              <p className="type-lead mt-7 max-w-xl">{section.description}</p>
            </Reveal>
          ) : null}

          <Reveal delay={0.25} className="mt-9 flex flex-wrap items-center gap-3">
            {config.primary_cta.label && config.primary_cta.url ? (
              <Magnetic>
                <ButtonLink
                  href={config.primary_cta.url}
                  size="lg"
                  data-track="cta_click"
                  data-track-label={`hero primary: ${config.primary_cta.label}`}
                >
                  {config.primary_cta.label}
                </ButtonLink>
              </Magnetic>
            ) : null}
            {config.secondary_cta.label && config.secondary_cta.url ? (
              <ButtonLink
                href={config.secondary_cta.url}
                size="lg"
                variant="secondary"
                data-track="cta_click"
                data-track-label={`hero secondary: ${config.secondary_cta.label}`}
              >
                {config.secondary_cta.label}
              </ButtonLink>
            ) : null}
          </Reveal>
        </div>

        <div className="mx-auto w-full max-w-md sm:max-w-lg lg:col-span-5 lg:max-w-none">
          <Reveal delay={0.2} y={32}>
            <Parallax amplitude={28}>
              <HeroCanvas labels={nodeLabels} />
            </Parallax>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
