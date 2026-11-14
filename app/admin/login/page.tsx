import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/public/brand-mark";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminContext } from "@/lib/auth/admin";
import { safeAdminRedirect } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const target = safeAdminRedirect(next);
  if (await getAdminContext()) redirect(target);

  return (
    <main className="dot-grid flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5 font-display text-lg font-semibold">
          <BrandMark className="size-6" />
          Site admin
        </div>
        <div className="rounded-[var(--radius-card)] border border-line bg-surface/80 p-6 backdrop-blur sm:p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted">Manage your portfolio content.</p>
          {!isSupabaseConfigured ? (
            <p role="alert" className="mt-6 rounded-xl border border-signal/40 bg-signal/10 p-3 text-sm">
              Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the app.
            </p>
          ) : null}
          {error === "unauthorized" ? (
            <p role="alert" className="mt-6 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm">
              This account does not have admin access.
            </p>
          ) : null}
          <LoginForm next={target} />
        </div>
        <p className="mt-6 text-center text-xs text-subtle">Admin accounts are created by the site owner. There is no public sign-up.</p>
      </div>
    </main>
  );
}
