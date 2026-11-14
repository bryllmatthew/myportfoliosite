"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  Briefcase,
  ExternalLink,
  FileSearch,
  Home,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Layers,
  LineChart,
  LogOut,
  Menu,
  MessageSquareQuote,
  Navigation,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { signOut } from "@/lib/actions/auth";
import { BrandMark } from "@/components/public/brand-mark";

const NAV: { group: string; items: { href: string; label: string; icon: typeof Home; exact?: boolean }[] }[] = [
  {
    group: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/home", label: "Homepage", icon: Home },
      { href: "/admin/services", label: "Services", icon: Layers },
      { href: "/admin/projects", label: "Projects", icon: Briefcase },
      { href: "/admin/case-studies", label: "Case studies", icon: LineChart },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/media", label: "Media library", icon: ImageIcon },
    ],
  },
  {
    group: "Site",
    items: [
      { href: "/admin/profile", label: "Profile", icon: UserRound },
      { href: "/admin/contact", label: "Contact and inquiries", icon: Inbox },
      { href: "/admin/navigation", label: "Navigation and social", icon: Navigation },
      { href: "/admin/seo", label: "SEO", icon: FileSearch },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ pathname, collapsed, newInquiries, onNavigate }: { pathname: string; collapsed: boolean; newInquiries: number; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin" className="flex flex-col gap-6">
      {NAV.map((group) => (
        <div key={group.group}>
          {!collapsed ? <p className="mb-2 px-3 text-xs font-medium text-subtle">{group.group}</p> : null}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              const Icon = item.icon;
              const badge = item.href === "/admin/contact" && newInquiries > 0 ? newInquiries : null;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors",
                      active ? "bg-surface-2 text-paper" : "text-muted hover:bg-surface hover:text-paper",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", active && "text-signal")} aria-hidden />
                    {collapsed ? <span className="sr-only">{item.label}</span> : <span className="flex-1 truncate">{item.label}</span>}
                    {badge && !collapsed ? (
                      <span className="rounded-full bg-signal px-1.5 text-xs font-semibold text-signal-ink">
                        {badge}
                        <span className="sr-only"> new</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

const SIDEBAR_KEY = "admin-sidebar";
const SIDEBAR_EVENT = "admin-sidebar-change";

function subscribeSidebar(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(SIDEBAR_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(SIDEBAR_EVENT, cb);
  };
}

export function AdminShell({ children, email, newInquiries }: { children: ReactNode; email: string | null; newInquiries: number }) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribeSidebar,
    () => window.localStorage.getItem(SIDEBAR_KEY) === "collapsed",
    () => false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = drawerRef.current;
    if (!d) return;
    if (mobileOpen && !d.open) d.showModal();
    if (!mobileOpen && d.open) d.close();
  }, [mobileOpen]);

  // Close the drawer after navigating (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  const toggle = () => {
    window.localStorage.setItem(SIDEBAR_KEY, collapsed ? "expanded" : "collapsed");
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  };

  const footer = (compact: boolean) => (
    <div className={cn("flex flex-col gap-1 border-t border-line pt-4", compact && "items-center")}>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className={cn("flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted hover:bg-surface hover:text-paper", compact && "justify-center px-0")}
        title={compact ? "View site" : undefined}
      >
        <ExternalLink className="size-4" aria-hidden />
        {compact ? <span className="sr-only">View site (opens in a new tab)</span> : <span>View site</span>}
      </a>
      <form action={signOut}>
        <button
          type="submit"
          className={cn("flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-muted hover:bg-surface hover:text-paper", compact && "justify-center px-0")}
          title={compact ? "Sign out" : undefined}
        >
          <LogOut className="size-4" aria-hidden />
          {compact ? <span className="sr-only">Sign out</span> : <span>Sign out</span>}
        </button>
      </form>
      {!compact && email ? <p className="truncate px-3 pt-2 text-xs text-subtle">{email}</p> : null}
    </div>
  );

  return (
    <div className="min-h-dvh bg-ink lg:flex">
      <a href="#admin-main" className="sr-only z-50 rounded-full bg-signal px-4 py-2 font-medium text-signal-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-ink-raised/70 p-4 transition-[width] duration-200 lg:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <div className={cn("flex items-center justify-between", collapsed && "flex-col gap-3")}>
          <Link href="/admin" className="flex items-center gap-2 font-display font-semibold">
            <BrandMark className="size-5" />
            {!collapsed ? <span>Site admin</span> : <span className="sr-only">Dashboard</span>}
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-paper"
          >
            {collapsed ? <PanelLeftOpen className="size-4" aria-hidden /> : <PanelLeftClose className="size-4" aria-hidden />}
          </button>
        </div>
        <div className="flex-1">
          <NavList pathname={pathname} collapsed={collapsed} newInquiries={newInquiries} />
        </div>
        {footer(collapsed)}
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-ink/90 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-display font-semibold">
          <BrandMark className="size-5" />
          Site admin
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={mobileOpen}
          aria-controls="admin-drawer"
          className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-surface"
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </div>
      <dialog
        ref={drawerRef}
        id="admin-drawer"
        aria-label="Admin menu"
        onCancel={(e) => {
          e.preventDefault();
          setMobileOpen(false);
        }}
        className="m-0 h-dvh max-h-none w-[min(20rem,85vw)] bg-ink-raised p-0 text-paper backdrop:bg-ink/70 lg:hidden"
      >
        <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold">Menu</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close admin menu"
              className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-surface"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1">
            <NavList pathname={pathname} collapsed={false} newInquiries={newInquiries} onNavigate={() => setMobileOpen(false)} />
          </div>
          {footer(false)}
        </div>
      </dialog>

      <main id="admin-main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
