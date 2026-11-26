import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/public/section";
import { RichText } from "@/components/public/rich-text";
import { CaseStudyCard, MetricLedger, PrimaryResult, primaryMetric } from "@/components/public/cards";
import { CtaSection } from "@/components/public/home/sections";
import { HeroImage } from "@/components/media/hero-image";
import { MediaGallery, VideoEmbed } from "@/components/media/media-gallery";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TrackView } from "@/components/analytics/analytics";
import { getCaseStudies, getCaseStudyBySlug, getPublishedSlugs } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, caseStudySchema } from "@/lib/seo/json-ld";
import { displayClient, formatDateRange } from "@/lib/utils/format";
import { isVideoFile, toEmbedUrl } from "@/lib/utils/video";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const rows = await getPublishedSlugs("case_studies");
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const cs = await getCaseStudyBySlug(slug, isEnabled);
  if (!cs) return { title: "Case study not found", robots: { index: false } };
  return buildMetadata({
    title: cs.seo_title || cs.title,
    description: cs.seo_description || cs.short_description,
    image: cs.og_image_url || cs.cover_image_url,
    path: `/case-studies/${cs.slug}`,
    type: "article",
    noIndex: cs.status !== "published",
  });
}

const STORY: { key: keyof Pick<
  import("@/types/content").CaseStudy,
  | "challenge"
  | "strategy"
  | "creative_approach"
  | "targeting_summary"
  | "tracking_setup"
  | "execution_summary"
  | "optimization_summary"
  | "results_summary"
  | "learnings"
>; title: string }[] = [
  { key: "challenge", title: "The challenge" },
  { key: "strategy", title: "Strategy" },
  { key: "creative_approach", title: "Creative approach" },
  { key: "targeting_summary", title: "Audience and targeting" },
  { key: "tracking_setup", title: "Funnel and tracking" },
  { key: "execution_summary", title: "Execution" },
  { key: "optimization_summary", title: "Optimization" },
  { key: "results_summary", title: "Results" },
  { key: "learnings", title: "What I learned" },
];

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const cs = await getCaseStudyBySlug(slug, isEnabled);
  if (!cs) notFound();

  const all = await getCaseStudies();
  const more = all.filter((c) => c.id !== cs.id).slice(0, 3);
  const primary = primaryMetric(cs.metrics);
  const secondary = cs.metrics.filter((m) => m.id !== primary?.id);
  const range = formatDateRange(cs.date_start, cs.date_end);
  const client = displayClient(cs.client_name, cs.client_display_mode, cs.client_descriptor);
  const heroIsVideo = cs.hero_media_url && (toEmbedUrl(cs.hero_media_url) || isVideoFile(cs.hero_media_url));
  const heroImage = !heroIsVideo ? cs.hero_media_url || cs.cover_image_url : null;

  const snapshot = [
    client ? { label: "Client", value: client } : null,
    cs.platforms.length ? { label: "Platforms", value: cs.platforms.map((p) => p.name).join(", ") } : null,
    cs.campaign_objective ? { label: "Objective", value: cs.campaign_objective } : null,
    range ? { label: "Timeframe", value: range } : null,
    cs.currency_code ? { label: "Currency", value: cs.currency_code } : null,
  ].filter((x): x is { label: string; value: string } => Boolean(x));

  return (
    <>
      <JsonLd data={caseStudySchema(cs)} />
      <TrackView event="case_study_view" id={cs.id} label={cs.title} />

      <section className="relative overflow-hidden pb-14 pt-32 sm:pt-40">
        <div aria-hidden className="dot-grid dot-grid-fade absolute inset-0" />
        <div aria-hidden className="absolute -left-40 top-0 h-[30rem] w-[44rem] rounded-full bg-signal/[0.07] blur-[120px]" />
        <div className="container-page relative">
          <Breadcrumbs
            items={[
              { name: "Advertising Case Studies", path: "/case-studies" },
              { name: cs.title, path: `/case-studies/${cs.slug}` },
            ]}
            className="mb-10"
          />
          <Reveal>
            {cs.result_headline ? (
              <p className="mb-5 max-w-3xl font-display text-xl font-semibold text-signal sm:text-2xl">{cs.result_headline}</p>
            ) : null}
            <h1 className="type-h1 max-w-4xl">{cs.title}</h1>
            {cs.short_description ? <p className="type-lead mt-6 max-w-2xl">{cs.short_description}</p> : null}
          </Reveal>

          <div className="mt-14 grid gap-12 border-t border-line pt-10 lg:grid-cols-12 lg:gap-16">
            {primary ? (
              <div className="lg:col-span-8">
                <h2 className="sr-only">Results</h2>
                <PrimaryResult metric={primary} />
                <MetricLedger metrics={secondary} className="mt-10" />
              </div>
            ) : null}
            {snapshot.length ? (
              <div className={primary ? "lg:col-span-4" : "lg:col-span-12"}>
                <h2 className="text-sm font-medium text-subtle">Campaign snapshot</h2>
                <dl className="mt-4 divide-y divide-line border-y border-line">
                  {snapshot.map((s) => (
                    <div key={s.label} className="flex justify-between gap-6 py-3 text-sm">
                      <dt className="text-muted">{s.label}</dt>
                      <dd className="text-right text-paper">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {heroIsVideo || heroImage ? (
        <div className="container-page">
          {heroIsVideo && cs.hero_media_url ? (
            <VideoEmbed url={cs.hero_media_url} title={`${cs.title} video`} />
          ) : (
            heroImage ? <HeroImage src={heroImage} alt={cs.cover_image_alt || ""} title={cs.title} /> : null
          )}
        </div>
      ) : null}

      <article aria-label="Campaign story" className="container-page section-y !pt-16">
        {STORY.map(({ key, title }) =>
          cs[key]?.trim() ? (
            <section key={key} className="grid gap-6 border-t border-line py-12 md:grid-cols-12 md:py-16">
              <h2 className="type-h3 md:col-span-4">{title}</h2>
              <div className="md:col-span-8">
                <RichText content={cs[key]} />
              </div>
            </section>
          ) : null,
        )}
      </article>

      {cs.media.length ? (
        <section aria-labelledby="cs-gallery" className="pb-24">
          <div className="container-page">
            <h2 id="cs-gallery" className="type-h3 mb-8">
              Creative and results
            </h2>
            <MediaGallery items={cs.media} title={cs.title} />
          </div>
        </section>
      ) : null}

      {more.length ? (
        <section aria-labelledby="more-cases" className="section-y border-t border-line">
          <div className="container-page">
            <h2 id="more-cases" className="type-h2">
              More case studies
            </h2>
            <Stagger as="ul" className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {more.map((c) => (
                <StaggerItem as="li" key={c.id}>
                  <CaseStudyCard caseStudy={c} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      <CtaSection
        heading="Let's plan your next campaign"
        description="Tell me about your offer, current spend and goals."
        primary={{ label: "Improve my advertising", url: "/contact?service=digital-marketing" }}
        secondary={{ label: "All case studies", url: "/case-studies" }}
        trackLabel={`case study cta: ${cs.slug}`}
      />
    </>
  );
}
