import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowUpRight, FolderGit2 } from "lucide-react";
import { Breadcrumbs, SectionHeader } from "@/components/public/section";
import { RichText } from "@/components/public/rich-text";
import { ProjectCard } from "@/components/public/cards";
import { CtaSection } from "@/components/public/home/sections";
import { CmsImage } from "@/components/media/cms-image";
import { MediaGallery, VideoEmbed } from "@/components/media/media-gallery";
import { ParallaxMedia } from "@/components/motion/parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Tag, accentFor } from "@/components/ui/misc";
import { TrackView } from "@/components/analytics/analytics";
import { getProjectBySlug, getProjects, getPublishedSlugs, relatedProjects } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, projectSchema } from "@/lib/seo/json-ld";
import { displayClient, formatMonthYear } from "@/lib/utils/format";
import { toEmbedUrl, isVideoFile } from "@/lib/utils/video";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const rows = await getPublishedSlugs("projects");
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const project = await getProjectBySlug(slug, isEnabled);
  if (!project) return { title: "Project not found", robots: { index: false } };
  return buildMetadata({
    title: project.seo_title || project.title,
    description: project.seo_description || project.short_description,
    image: project.og_image_url || project.cover_image_url,
    path: `/work/${project.slug}`,
    type: "article",
    noIndex: project.status !== "published",
  });
}

function Story({ id, title, content }: { id: string; title: string; content: string }) {
  if (!content.trim()) return null;
  return (
    <Reveal as="section" className="grid gap-6 border-t border-line py-12 md:grid-cols-12 md:py-16">
      <h2 id={id} className="type-h3 md:col-span-4">
        {title}
      </h2>
      <div className="md:col-span-8">
        <RichText content={content} />
      </div>
    </Reveal>
  );
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const project = await getProjectBySlug(slug, isEnabled);
  if (!project) notFound();

  const all = await getProjects();
  const related = relatedProjects(all, project, 3);
  const client = displayClient(project.client_name, project.client_display_mode);
  const date = formatMonthYear(project.project_date);
  const accent = project.services[0]?.accent_key ?? null;
  const a = accentFor(accent);
  const heroIsVideo = project.hero_media_url && (toEmbedUrl(project.hero_media_url) || isVideoFile(project.hero_media_url));
  const heroImage = !heroIsVideo ? project.hero_media_url || project.cover_image_url : null;

  const facts = [
    client ? { label: "Client", value: client } : null,
    project.project_type ? { label: "Type", value: project.project_type } : null,
    date ? { label: "Date", value: date } : null,
    project.services.length ? { label: "Services", value: project.services.map((s) => s.title).join(", ") } : null,
  ].filter((x): x is { label: string; value: string } => Boolean(x));

  return (
    <>
      <JsonLd data={projectSchema(project)} />
      <TrackView event="project_view" id={project.id} label={project.title} />

      <section className="relative overflow-hidden pb-12 pt-32 sm:pt-40">
        <div aria-hidden className="dot-grid dot-grid-fade absolute inset-0" />
        <div className="container-page relative">
          <Breadcrumbs items={[{ name: "My Work", path: "/work" }, { name: project.title, path: `/work/${project.slug}` }]} className="mb-10" />
          <Reveal>
            {project.categories.length ? (
              <p className={`mb-5 text-sm font-medium ${a.text}`}>{project.categories.map((c) => c.name).join(", ")}</p>
            ) : null}
            <h1 className="type-h1 max-w-5xl">{project.title}</h1>
            {project.short_description ? <p className="type-lead mt-6 max-w-2xl">{project.short_description}</p> : null}
          </Reveal>

          {facts.length ? (
            <Reveal delay={0.1}>
              <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-line pt-8 md:grid-cols-4">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-sm text-subtle">{f.label}</dt>
                    <dd className="mt-1 text-paper">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ) : null}

          {project.external_url || project.github_url ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {project.external_url ? (
                <ButtonLink href={project.external_url} variant="secondary" data-track="external_portfolio_link" data-track-label={`project live: ${project.slug}`}>
                  Visit the live project
                  <ArrowUpRight aria-hidden />
                </ButtonLink>
              ) : null}
              {project.github_url ? (
                <ButtonLink href={project.github_url} variant="ghost" data-track="external_portfolio_link" data-track-label={`project code: ${project.slug}`}>
                  <FolderGit2 aria-hidden />
                  View the code
                </ButtonLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <div className="container-page">
        {heroIsVideo && project.hero_media_url ? (
          <VideoEmbed url={project.hero_media_url} title={`${project.title} video`} />
        ) : (
          <ParallaxMedia className="aspect-[16/9] rounded-[var(--radius-card)] border border-line bg-ink-raised">
            <CmsImage
              src={heroImage}
              alt={project.cover_image_alt || ""}
              sizes="(min-width: 1280px) 1200px, 100vw"
              priority
              placeholderLabel={project.title}
              accent={accent}
              quality={90}
            />
          </ParallaxMedia>
        )}
      </div>

      <article aria-label="Project story" className="container-page section-y">
        <Story id="challenge" title="The challenge" content={project.challenge} />
        <Story id="solution" title="The solution" content={project.solution} />
        {project.role_description || project.responsibilities.length ? (
          <Reveal as="section" className="grid gap-6 border-t border-line py-12 md:grid-cols-12 md:py-16">
            <h2 className="type-h3 md:col-span-4">My role</h2>
            <div className="md:col-span-8">
              <RichText content={project.role_description} />
              {project.responsibilities.length ? (
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Responsibilities">
                  {project.responsibilities.map((r) => (
                    <li key={r}>
                      <Tag className="text-paper/90">{r}</Tag>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Reveal>
        ) : null}
        {project.technologies.length ? (
          <Reveal as="section" className="grid gap-6 border-t border-line py-12 md:grid-cols-12 md:py-16">
            <h2 className="type-h3 md:col-span-4">Stack and tools</h2>
            <ul className="flex flex-wrap gap-2 md:col-span-8">
              {project.technologies.map((t) => (
                <li key={t.id}>
                  <Tag>{t.name}</Tag>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
        <Story id="outcome" title="The outcome" content={project.outcome} />
      </article>

      {project.media.length ? (
        <section aria-labelledby="gallery" className="pb-24">
          <div className="container-page">
            <h2 id="gallery" className="sr-only">
              Gallery
            </h2>
            <MediaGallery items={project.media} title={project.title} />
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section aria-labelledby="related" className="section-y border-t border-line">
          <div className="container-page">
            <SectionHeader id="related" heading="Related work" />
            <Stagger as="ul" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <StaggerItem as="li" key={p.id}>
                  <ProjectCard project={p} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      <CtaSection
        heading="Have a project like this in mind?"
        description="Tell me about it. I will reply with how I would approach it."
        primary={{
          label: project.services[0] ? "Discuss your project" : "Start a project",
          url: project.services[0] ? `/contact?service=${project.services[0].slug}` : "/contact",
        }}
        secondary={{ label: "More work", url: "/work" }}
        trackLabel={`project cta: ${project.slug}`}
      />
    </>
  );
}
