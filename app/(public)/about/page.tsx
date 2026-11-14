import type { Metadata } from "next";
import { Download } from "lucide-react";
import { PageHero } from "@/components/public/section";
import { RichText } from "@/components/public/rich-text";
import { CtaSection } from "@/components/public/home/sections";
import { CmsImage } from "@/components/media/cms-image";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/misc";
import { getPageSettings, getProfile, getSiteSettings, getSocialLinks } from "@/lib/queries/public";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, personSchema } from "@/lib/seo/json-ld";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("about", "/about", "About");
}

export default async function AboutPage() {
  const [page, profile, site, social] = await Promise.all([
    getPageSettings("about"),
    getProfile(),
    getSiteSettings(),
    getSocialLinks(),
  ]);

  const heading = page?.heading || (profile?.display_name ? `About ${profile.display_name}` : "About");
  const groups = (profile?.stack_groups ?? []).filter((g) => g.items.length);

  return (
    <>
      <JsonLd data={personSchema(profile, site, social)} />
      <PageHero heading={heading} intro={page?.intro || profile?.headline} crumbs={[{ name: "About", path: "/about" }]} />

      <section aria-label="Biography" className="pb-20">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          {profile?.avatar_url ? (
            <Reveal className="lg:col-span-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
                <CmsImage src={profile.avatar_url} alt={profile.display_name ? `Portrait of ${profile.display_name}` : "Portrait"} sizes="(min-width: 1024px) 33vw, 100vw" priority />
              </div>
            </Reveal>
          ) : null}
          <Reveal className={profile?.avatar_url ? "lg:col-span-7 lg:col-start-6" : "lg:col-span-8"} delay={0.1}>
            {profile?.short_bio ? <p className="font-display text-2xl font-medium leading-snug sm:text-[1.75rem]">{profile.short_bio}</p> : null}
            <RichText content={profile?.long_bio} className="mt-8" />
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/contact" data-track="contact_click" data-track-label="about: work with me">
                Work with me
              </ButtonLink>
              {profile?.resume_url ? (
                <ButtonLink href={profile.resume_url} variant="secondary" data-track="external_portfolio_link" data-track-label="resume">
                  <Download aria-hidden />
                  Download résumé
                </ButtonLink>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      {profile?.skills.length ? (
        <section aria-labelledby="expertise" className="section-y border-t border-line">
          <div className="container-page grid gap-10 lg:grid-cols-12">
            <h2 id="expertise" className="type-h2 lg:col-span-4">
              Expertise
            </h2>
            <ul className="flex flex-wrap gap-2 lg:col-span-8">
              {profile.skills.map((s) => (
                <li key={s}>
                  <Tag className="px-4 py-1.5 text-[0.9375rem] text-paper/90">{s}</Tag>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {profile?.experience.length ? (
        <section aria-labelledby="experience" className="section-y border-t border-line">
          <div className="container-page grid gap-10 lg:grid-cols-12">
            <h2 id="experience" className="type-h2 lg:col-span-4">
              Experience
            </h2>
            <Stagger as="ol" className="relative border-l border-line lg:col-span-8">
              {profile.experience.map((e, i) => (
                <StaggerItem as="li" key={`${e.role}-${i}`} className="relative pb-10 pl-8 last:pb-0">
                  <span aria-hidden className="absolute -left-[5px] top-2 size-[9px] rounded-full bg-signal ring-4 ring-ink" />
                  {e.period ? <p className="text-sm text-subtle">{e.period}</p> : null}
                  <h3 className="type-h3 mt-1">
                    {e.role}
                    {e.organization ? <span className="text-muted">, {e.organization}</span> : null}
                  </h3>
                  {e.description ? <p className="mt-2 max-w-2xl text-muted">{e.description}</p> : null}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {groups.length ? (
        <section aria-labelledby="stack" className="section-y border-t border-line">
          <div className="container-page grid gap-10 lg:grid-cols-12">
            <h2 id="stack" className="type-h2 lg:col-span-4">
              Tools I use
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
              {groups.map((g) => (
                <div key={g.category} className="border-t border-line pt-5">
                  <h3 className="font-display text-lg font-semibold">{g.category}</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {g.items.map((item) => (
                      <li key={item}>
                        <Tag>{item}</Tag>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaSection
        heading="Let's build something that works"
        primary={{ label: site?.primary_cta_label || "Start a project", url: site?.primary_cta_url || "/contact" }}
        secondary={{ label: "See my work", url: "/work" }}
        trackLabel="about cta"
      />
    </>
  );
}
