import "server-only";
import type { AdminContext } from "@/lib/auth/admin";

export type AuditAction =
  | "create"
  | "update"
  | "publish"
  | "archive"
  | "delete"
  | "upload"
  | "status_change";

/** Records an admin mutation. A logging failure never blocks the mutation itself. */
export async function audit(
  ctx: AdminContext,
  action: AuditAction,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await ctx.supabase.from("audit_logs").insert({
    user_id: ctx.userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
  if (error) console.error(`[audit] failed to record ${action} ${entityType}: ${error.code}`);
}
