import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import type { ContactSettings, NavigationItem, Profile, SiteSettings, SocialLink } from "@/types/content";
import { BrandMark } from "./brand-mark";

interface FooterProps {
  site: SiteSettings | null;
  profile: Profile | null;
  contact: ContactSettings | null;
  items: Pick<NavigationItem, "label" | "url" | "is_external">[];
  social: SocialLink[];
}

export function Footer({ site, profile, contact, items, social }: FooterProps) {
  const name = site?.site_name || profile?.display_name || "Portfolio";
  const email = contact?.primary_email || profile?.email_public;
  const phone = contact?.phone || profile?.phone_public;
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-line bg-ink-raised/60">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Link href="/" className="inline-flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight">
            <BrandMark className="size-5" />
            {name}
          </Link>
          {site?.footer_text ? <p className="mt-4 max-w-sm text-muted">{site.footer_text}</p> : null}
          {profile?.availability_label && profile.is_available ? (
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-paper">
              <span className="size-2 animate-pulse-soft rounded-full bg-grow" aria-hidden />
              {profile.availability_label}
            </p>
          ) : null}
        </div>

        {items.length ? (
          <nav aria-label="Footer" className="md:col-span-3">
            <h2 className="text-sm font-medium text-subtle">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {items.map((item) => (
                <li key={`${item.label}-${item.url}`}>
                  <Link
                    href={item.url}
                    className="text-paper/90 transition-colors hover:text-signal"
                    {...(item.is_external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="md:col-span-4">
          <h2 className="text-sm font-medium text-subtle">Get in touch</h2>
          <ul className="mt-4 space-y-2.5">
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-paper/90 hover:text-signal">
                  <Mail className="size-4 text-subtle" aria-hidden />
                  {email}
                </a>
              </li>
            ) : null}
            {phone ? (
              <li>
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 text-paper/90 hover:text-signal">
                  <Phone className="size-4 text-subtle" aria-hidden />
                  {phone}
                </a>
              </li>
            ) : null}
            {contact?.location_label ? (
              <li className="inline-flex items-center gap-2 text-muted">
                <MapPin className="size-4 text-subtle" aria-hidden />
                {contact.location_label}
              </li>
            ) : null}
            {!email && !phone ? (
              <li>
                <Link href="/contact" className="text-paper/90 hover:text-signal">
                  Use the contact form
                </Link>
              </li>
            ) : null}
          </ul>
          {social.length ? (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Social profiles">
              {social.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    data-track="external_portfolio_link"
                    data-track-label={s.platform}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-line-strong hover:text-paper"
                  >
                    {s.label}
                    <ArrowUpRight className="size-3.5" aria-hidden />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="border-t border-line/70">
        <div className="container-page flex flex-col gap-2 py-6 text-meta sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
