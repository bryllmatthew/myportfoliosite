import type { Metadata } from "next";
import { ArrowUpRight, CalendarDays, Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/public/section";
import { ContactForm } from "@/components/forms/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { getContactSettings, getPageSettings, getProfile, getServiceOptions, getSocialLinks } from "@/lib/queries/public";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("contact", "/contact", "Contact");
}

export default async function ContactPage() {
  const [page, contact, profile, services, social] = await Promise.all([
    getPageSettings("contact"),
    getContactSettings(),
    getProfile(),
    getServiceOptions(),
    getSocialLinks(),
  ]);

  const email = contact?.primary_email || profile?.email_public || null;
  const phone = contact?.phone || profile?.phone_public || null;

  return (
    <>
      <PageHero
        heading={page?.heading || "Start a project"}
        intro={page?.intro || contact?.contact_intro}
        crumbs={[{ name: "Contact", path: "/contact" }]}
      />

      <section aria-label="Contact" className="pb-28">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <div className="rounded-[var(--radius-card)] border border-line bg-surface/50 p-6 sm:p-8">
              <h2 className="type-h3 mb-6">Send a message</h2>
              <ContactForm
                services={services}
                budgetRanges={contact?.budget_ranges ?? []}
                showBudget={contact?.show_budget ?? true}
                fallbackEmail={email}
              />
            </div>
          </Reveal>

          <Reveal className="flex flex-col gap-10 lg:col-span-5" delay={0.1}>
            {page?.intro && contact?.contact_intro ? <p className="text-lg text-muted">{contact.contact_intro}</p> : null}

            <div>
              <h2 className="font-display text-xl font-semibold">Direct contact</h2>
              <ul className="mt-5 space-y-4">
                {email ? (
                  <li>
                    <a href={`mailto:${email}`} className="group inline-flex items-center gap-3 text-lg hover:text-signal">
                      <Mail className="size-5 text-subtle group-hover:text-signal" aria-hidden />
                      {email}
                    </a>
                  </li>
                ) : null}
                {phone ? (
                  <li>
                    <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="group inline-flex items-center gap-3 text-lg hover:text-signal">
                      <Phone className="size-5 text-subtle group-hover:text-signal" aria-hidden />
                      {phone}
                    </a>
                  </li>
                ) : null}
                {contact?.location_label ? (
                  <li className="inline-flex items-center gap-3 text-muted">
                    <MapPin className="size-5 text-subtle" aria-hidden />
                    {contact.location_label}
                  </li>
                ) : null}
                {contact?.response_time_text ? (
                  <li className="flex items-center gap-3 text-muted">
                    <Clock className="size-5 text-subtle" aria-hidden />
                    {contact.response_time_text}
                  </li>
                ) : null}
                {!email && !phone ? <li className="text-muted">The form is the fastest way to reach me.</li> : null}
              </ul>
            </div>

            {contact?.calendar_url ? (
              <div className="rounded-[var(--radius-card)] border border-line p-6">
                <CalendarDays className="size-6 text-signal" aria-hidden />
                <h2 className="mt-4 font-display text-xl font-semibold">Prefer to talk?</h2>
                <p className="mt-2 text-muted">Book a short call at a time that suits you.</p>
                <ButtonLink href={contact.calendar_url} variant="secondary" className="mt-5" data-track="contact_click" data-track-label="book a call">
                  Book a call
                  <ArrowUpRight aria-hidden />
                </ButtonLink>
              </div>
            ) : null}

            {social.length ? (
              <div>
                <h2 className="font-display text-xl font-semibold">Elsewhere</h2>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {social.map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer me"
                        data-track="external_portfolio_link"
                        data-track-label={s.platform}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line px-4 text-sm text-muted transition-colors hover:border-line-strong hover:text-paper"
                      >
                        {s.label}
                        <ArrowUpRight className="size-3.5" aria-hidden />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Reveal>
        </div>
      </section>
    </>
  );
}
