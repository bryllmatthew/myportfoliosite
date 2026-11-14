import "server-only";
import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { assertAdmin, type AdminContext } from "@/lib/auth/admin";
import type { SaveIntent } from "@/lib/validations/common";
import type { ActionFailure, ActionResult, ContentStatus } from "@/types/content";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Runs an admin mutation: verifies the caller server-side first (never trust the UI),
 * then converts unexpected exceptions into a safe, generic error.
 */
export async function runAdmin<T>(fn: (ctx: AdminContext) => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  let ctx: AdminContext;
  try {
    ctx = await assertAdmin();
  } catch {
    return { ok: false, error: "Your session has expired or this account has no admin access. Sign in again." };
  }
  try {
    return await fn(ctx);
  } catch (error) {
    console.error(`[admin] action failed: ${(error as Error).message}`);
    return { ok: false, error: "Something went wrong and the change was not saved. Try again." };
  }
}

export function invalid(error: z.ZodError): ActionFailure {
  const flat = z.flattenError(error);
  return {
    ok: false,
    error: "Some fields need attention. Check the highlighted fields.",
    fieldErrors: flat.fieldErrors as Record<string, string[] | undefined>,
  };
}

export function dbFailure(error: PostgrestError, what = "the change"): ActionFailure {
  console.error(`[admin] db error ${error.code}: ${error.message}`);
  if (error.code === "23505") {
    return {
      ok: false,
      error: "That slug is already used by another item.",
      fieldErrors: { slug: ["Another item already uses this slug. Choose a different one."] },
    };
  }
  if (error.code === "23503") return { ok: false, error: "A linked item no longer exists. Reload the page and try again." };
  if (error.code === "23514") return { ok: false, error: "One of the values is not allowed. Check the fields and try again." };
  if (error.code === "42501") return { ok: false, error: "You do not have permission to make this change." };
  return { ok: false, error: `Could not save ${what}. Try again.` };
}

/**
 * Admin edits can affect any public page (navigation, footer, homepage), so refresh them all:
 * expire every cached CMS read immediately (read-your-own-writes), then the rendered pages.
 * Only call from Server Actions.
 */
export function revalidatePublic() {
  updateTag("cms");
  revalidatePath("/", "layout");
}

export function nextStatus(intent: SaveIntent, current: ContentStatus | null): ContentStatus {
  switch (intent) {
    case "publish":
      return "published";
    case "archive":
      return "archived";
    case "draft":
      return "draft";
    default:
      return current ?? "draft";
  }
}

export function statusMessage(status: ContentStatus, intent: SaveIntent, isNew: boolean): string {
  if (intent === "publish") return "Published";
  if (intent === "archive") return "Archived";
  if (intent === "draft") return status === "draft" && !isNew ? "Saved as draft" : "Saved as draft";
  return isNew ? "Created" : "Changes saved";
}

export function auditAction(intent: SaveIntent, isNew: boolean) {
  if (intent === "publish") return "publish" as const;
  if (intent === "archive") return "archive" as const;
  return isNew ? ("create" as const) : ("update" as const);
}

/**
 * Upserts ordered child rows (capabilities, FAQs, metrics, media...) and deletes
 * the ones the admin removed. Client-supplied ids are only reused when they
 * already belong to this parent, so a forged id cannot move another record.
 */
export async function syncChildren(
  db: SupabaseClient,
  table: string,
  parentColumn: string,
  parentId: string,
  rows: Record<string, unknown>[],
): Promise<PostgrestError | null> {
  const { data: existing, error: readError } = await db.from(table).select("id").eq(parentColumn, parentId);
  if (readError) return readError;
  const owned = new Set((existing ?? []).map((r: { id: string }) => r.id));

  const prepared = rows.map((row, i) => {
    const { id, ...rest } = row as { id?: string } & Record<string, unknown>;
    return {
      ...rest,
      id: id && UUID.test(id) && owned.has(id) ? id : randomUUID(),
      [parentColumn]: parentId,
      sort_order: i,
    };
  });

  if (prepared.length) {
    const { error } = await db.from(table).upsert(prepared, { onConflict: "id" });
    if (error) return error;
  }

  const keep = prepared.map((r) => r.id);
  let del = db.from(table).delete().eq(parentColumn, parentId);
  if (keep.length) del = del.not("id", "in", `(${keep.join(",")})`);
  const { error: deleteError } = await del;
  return deleteError;
}

/** Replaces a many-to-many link set (e.g. project ↔ services). */
export async function syncLinks(
  db: SupabaseClient,
  table: string,
  ownerColumn: string,
  ownerId: string,
  targetColumn: string,
  targetIds: string[],
): Promise<PostgrestError | null> {
  const ids = [...new Set(targetIds.filter((id) => UUID.test(id)))];
  let del = db.from(table).delete().eq(ownerColumn, ownerId);
  if (ids.length) del = del.not(targetColumn, "in", `(${ids.join(",")})`);
  const { error: deleteError } = await del;
  if (deleteError) return deleteError;
  if (!ids.length) return null;
  const { error } = await db
    .from(table)
    .upsert(
      ids.map((id) => ({ [ownerColumn]: ownerId, [targetColumn]: id })),
      { onConflict: `${ownerColumn},${targetColumn}`, ignoreDuplicates: true },
    );
  return error;
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

/**
 * Protects live URLs: a published item's slug only changes when the admin
 * explicitly confirmed it.
 */
export function slugChangeBlocked(
  existing: { status: ContentStatus; slug: string } | null,
  nextSlug: string,
  confirmed: boolean | undefined,
): ActionFailure | null {
  if (existing && existing.status === "published" && existing.slug !== nextSlug && !confirmed) {
    return {
      ok: false,
      error: "This item is live. Changing its slug breaks existing links.",
      fieldErrors: { slug: ["This item is published. Tick “Change the live URL” to confirm the new slug."] },
    };
  }
  return null;
}
