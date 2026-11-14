"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { BrandMark } from "./brand-mark";

export interface HeaderNavItem {
  label: string;
  url: string;
  is_external: boolean;
}

interface HeaderProps {
  siteName: string;
  items: HeaderNavItem[];
  cta: { label: string; url: string } | null;
}

function isActive(pathname: string, url: string) {
  if (url === "/") return pathname === "/";
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function Header({ siteName, items, cta }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Drawer: native modal dialog gives focus trapping, Escape and an inert background.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    if (!open) document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the drawer after navigating (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Close the drawer if the viewport grows to desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const linkProps = (item: HeaderNavItem) =>
    item.is_external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-[80rem] items-center justify-between gap-4 rounded-full border pl-4 pr-2 transition-[background-color,border-color,box-shadow] duration-300 sm:pl-5",
          scrolled
            ? "border-line/80 bg-ink/80 shadow-[0_12px_40px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 rounded-full font-display text-[1.0625rem] font-semibold tracking-tight">
          <BrandMark className="size-5" />
          <span>{siteName}</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => {
              const active = !item.is_external && isActive(pathname, item.url);
              return (
                <li key={`${item.label}-${item.url}`}>
                  <Link
                    href={item.url}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-[0.9375rem] transition-colors",
                      active ? "text-paper" : "text-muted hover:text-paper",
                    )}
                    {...linkProps(item)}
                  >
                    {item.label}
                    {active ? (
                      <span aria-hidden className="absolute inset-x-3.5 -bottom-0.5 h-px bg-signal" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {cta ? (
            <span className="hidden sm:inline-flex">
              <Magnetic>
                <ButtonLink href={cta.url} size="sm" data-track="contact_click" data-track-label={`header: ${cta.label}`}>
                  {cta.label}
                </ButtonLink>
              </Magnetic>
            </span>
          ) : null}
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full text-paper hover:bg-surface lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        id="mobile-nav"
        aria-label="Menu"
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-ink p-0 text-paper backdrop:bg-transparent lg:hidden"
      >
        <div className="dot-grid flex h-full flex-col px-5 pb-8 pt-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold" onClick={() => setOpen(false)}>
              <BrandMark className="size-5" />
              {siteName}
            </Link>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full border border-line hover:bg-surface"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-10 flex-1">
            <ul className="flex flex-col">
              {items.map((item) => {
                const active = !item.is_external && isActive(pathname, item.url);
                return (
                  <li key={`m-${item.label}-${item.url}`} className="border-b border-line/70">
                    <Link
                      href={item.url}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-14 items-center justify-between py-3 font-display text-[1.75rem] font-semibold tracking-tight",
                        active ? "text-paper" : "text-muted",
                      )}
                      {...linkProps(item)}
                    >
                      {item.label}
                      {active ? <span aria-hidden className="size-2 rounded-full bg-signal" /> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {cta ? (
            <ButtonLink href={cta.url} size="lg" className="w-full" data-track="contact_click" data-track-label={`mobile menu: ${cta.label}`}>
              {cta.label}
            </ButtonLink>
          ) : null}
        </div>
      </dialog>
    </header>
  );
}
