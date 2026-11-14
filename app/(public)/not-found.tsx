import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80dvh] items-center overflow-hidden pt-24">
      <div aria-hidden className="dot-grid dot-grid-fade absolute inset-0" />
      <div className="container-page relative">
        <p className="type-metric text-[clamp(5rem,18vw,12rem)] text-line-strong">404</p>
        <h1 className="type-h2 mt-4">This page does not exist</h1>
        <p className="type-lead mt-4 max-w-lg">It may have moved, or it is not published yet. Try one of these instead.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">Go to the homepage</ButtonLink>
          <ButtonLink href="/work" variant="secondary">
            See my work
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
