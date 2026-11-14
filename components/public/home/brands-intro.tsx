import { MapPin } from "lucide-react";
import { CmsImage } from "@/components/media/cms-image";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import type { HomeConfig } from "@/lib/validations/content";
import type { Brand, HomeSection, Profile } from "@/types/content";

// ---------------------------------------------------------------------------
// Brands I've worked with
// ---------------------------------------------------------------------------
/**
 * Logos are shown as white marks: dark-on-light logos are inverted and
 * screen-blended into the page, so white logo backgrounds disappear.
 * Brands without a logo fall back to their name set in the display face.
 */
export function BrandsSection({ section, brands }: { section: HomeSection; brands: Brand[] }) {
  if (!brands.length) return null;
  return (
    // Solid background: <main> is a stacking context, so the logos need a backdrop inside it to blend with.
    <section aria-labelledby="home-brands" className="border-b border-line bg-ink py-14 md:py-16">
      <div className="container-page">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h2 id="home-brands" className="text-sm font-medium text-muted">
            {section.heading || "Brands I've worked with"}
          </h2>
          {section.description ? <p className="max-w-md text-sm text-subtle">{section.description}</p> : null}
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-10">
          {brands.map((b) => {
            const mark = b.logo_url ? (
              // Opacity lives on the blended element itself: on a parent it would isolate the blend
              // and the logo's white background would show as a grey tile.
              <span className="relative block aspect-[4/3] w-28 opacity-60 mix-blend-screen invert transition-opacity duration-300 group-hover:opacity-100 sm:w-36">
                <CmsImage src={b.logo_url} alt={b.name} sizes="144px" className="object-contain" />
              </span>
            ) : (
              <span className="flex h-20 items-center px-2 font-display text-lg font-semibold tracking-tight text-paper/60 transition-colors duration-300 group-hover:text-paper sm:h-24">
                {b.name}
              </span>
            );
            const cls = "group flex items-center justify-center";
            return (
              <li key={b.id}>
                {b.website_url ? (
                  <a
                    href={b.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="external_portfolio_link"
                    data-track-label={`brand: ${b.name}`}
                    className={cls}
                  >
                    {mark}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <div className={cls}>{mark}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Introduction: photo + short bio
// ---------------------------------------------------------------------------
export function IntroSection({
  section,
  config,
  profile,
}: {
  section: HomeSection;
  config: HomeConfig<"intro">;
  profile: Profile | null;
}) {
  if (!profile) return null;
  const heading = section.heading || (profile.display_name ? `Hi, I'm ${profile.display_name}` : "About me");
  const body = section.description || profile.short_bio;

  return (
    <section aria-labelledby="home-intro" className="section-y relative overflow-hidden">
      <div className="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {profile.avatar_url ? (
          <Reveal className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div aria-hidden className="dot-grid absolute -bottom-6 -right-6 left-10 top-10 rounded-[1.75rem] border border-line" />
              <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-line-strong bg-ink-raised">
                <CmsImage
                  src={profile.avatar_url}
                  alt={profile.display_name ? `Portrait of ${profile.display_name}` : "Portrait"}
                  sizes="(min-width: 1024px) 40vw, (min-width: 640px) 28rem, 100vw"
                  quality={90}
                />
              </div>
              {profile.is_available && profile.availability_label ? (
                <p className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-grow/30 bg-ink/85 px-3 py-1.5 text-sm text-grow backdrop-blur">
                  <span aria-hidden className="size-1.5 animate-pulse-soft rounded-full bg-grow" />
                  {profile.availability_label}
                </p>
              ) : null}
            </div>
          </Reveal>
        ) : null}
        <div className={profile.avatar_url ? "lg:col-span-6 lg:col-start-7" : "lg:col-span-8"}>
          {section.eyebrow ? (
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-signal">
              <span aria-hidden className="size-1.5 rounded-full bg-signal" />
              {section.eyebrow}
            </p>
          ) : null}
          <h2 id="home-intro" className="type-h2">
            {heading}
          </h2>
          {profile.headline ? <p className="mt-4 text-lg text-paper/90">{profile.headline}</p> : null}
          {body ? <p className="type-lead mt-5 max-w-xl">{body}</p> : null}
          {profile.location_label ? (
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted">
              <MapPin className="size-4 text-subtle" aria-hidden />
              {profile.location_label}
            </p>
          ) : null}
          {config.cta.label && config.cta.url ? (
            <div className="mt-8">
              <ButtonLink href={config.cta.url} variant="secondary" data-track="cta_click" data-track-label={`intro: ${config.cta.label}`}>
                {config.cta.label}
              </ButtonLink>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
