"use server";

import { createHash } from "node:crypto";
import { after } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { getPublicClient } from "@/lib/supabase/public";
import { contactFormSchema } from "@/lib/validations/content";
import { notifyNewInquiry } from "@/lib/notifications/inquiry";
import type { ActionResult } from "@/types/content";

/** Submissions faster than this after the form rendered are treated as bots. */
const MIN_FILL_MS = 2500;
/** Stale forms (e.g. replayed tokens) older than this are rejected. */
const MAX_FORM_AGE_MS = 1000 * 60 * 60 * 24;

async function clientHash(): Promise<string | null> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  if (!ip) return null;
  const salt = process.env.INQUIRY_HASH_SALT || "portfolio-inquiry";
  // Only a salted hash is stored, never the raw IP address.
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function submitInquiry(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields and try again.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }
  const data = parsed.data;

  // Honeypot filled or impossibly fast: pretend success so bots learn nothing.
  const age = Date.now() - data.started_at;
  if (data.website || age < MIN_FILL_MS) {
    return { ok: true, data: { id: "" }, message: "Thanks, your message was sent." };
  }
  if (age > MAX_FORM_AGE_MS) {
    return { ok: false, error: "This form has expired. Refresh the page and try again." };
  }

  const db = getPublicClient();
  if (!db) {
    return { ok: false, error: "The contact form is not connected yet. Please email me directly instead." };
  }

  const { data: id, error } = await db.rpc("submit_inquiry", {
    p_name: data.name,
    p_email: data.email,
    p_message: data.message,
    p_company: data.company || null,
    p_service_id: data.service_id || null,
    p_budget_range: data.budget_range || null,
    p_source_page: data.source_page || null,
    p_client_hash: await clientHash(),
  });

  if (error || typeof id !== "string") {
    if (error?.message?.includes("rate_limited")) {
      return { ok: false, error: "Too many messages in a short time. Please wait a few minutes and try again." };
    }
    if (error?.message?.includes("invalid_email")) {
      return { ok: false, error: "Enter a valid email address.", fieldErrors: { email: ["Enter a valid email address."] } };
    }
    console.error(`[contact] submit failed: ${error?.code ?? "unknown"}`);
    return { ok: false, error: "Your message could not be sent. Please try again, or email me directly." };
  }

  // Runs after the response is sent, so the visitor never waits on notifications.
  after(async () => {
    const serviceTitle = data.service_id
      ? ((await db.from("services").select("title").eq("id", data.service_id).maybeSingle()).data?.title ?? null)
      : null;
    await notifyNewInquiry({
      id,
      name: data.name,
      email: data.email,
      company: data.company || null,
      service: serviceTitle,
      budget_range: data.budget_range || null,
      message: data.message,
      source_page: data.source_page || null,
      created_at: new Date().toISOString(),
    });
  });

  return { ok: true, data: { id }, message: "Thanks, your message was sent." };
}
