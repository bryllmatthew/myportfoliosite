import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminRole = "admin" | "editor";

export interface AdminContext {
  supabase: SupabaseClient;
  userId: string;
  email: string | null;
  role: AdminRole;
}

/**
 * Resolves the signed-in CMS user for this request, or null.
 * Authorization comes from public.admin_users, never from the UI.
 * Cached per request so layouts, pages and actions share one lookup.
 */
export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();

  const { data: claimsData, error } = await supabase.auth.getClaims();
  const sub = claimsData?.claims?.sub;
  if (error || !sub) return null;

  const { data: row } = await supabase.from("admin_users").select("role").eq("user_id", sub).maybeSingle();
  if (!row) return null;

  const email = typeof claimsData.claims.email === "string" ? claimsData.claims.email : null;
  return { supabase, userId: sub, email, role: row.role as AdminRole };
});

/** True when someone is signed in, whether or not they are an admin. */
export async function hasSession(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  return Boolean(data?.claims?.sub);
}

/** For admin pages and layouts: redirects to login when not authorized. */
export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) {
    const signedIn = await hasSession();
    redirect(signedIn ? "/admin/login?error=unauthorized" : "/admin/login");
  }
  return ctx;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("You are not authorized to perform this action.");
    this.name = "UnauthorizedError";
  }
}

/** For Server Actions: throws when the caller is not an authorized admin. */
export async function assertAdmin(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) throw new UnauthorizedError();
  return ctx;
}
