"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeAdminRedirect } from "@/lib/auth/redirect";

export interface LoginState {
  error: string | null;
}

const credentials = z.object({
  email: z.string().trim().min(3).max(254),
  password: z.string().min(1).max(200),
});

/** Same message for every failure, so the form never reveals which accounts exist. */
const GENERIC = "Email or password is incorrect, or this account does not have admin access.";

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured) return { error: "Supabase is not configured yet. Add the environment variables first." };

  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter your email and password." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: GENERIC };

  // Signing in is not enough: the account must be on the admin allowlist.
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: GENERIC };
  }

  redirect(safeAdminRedirect(formData.get("next")?.toString()));
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
