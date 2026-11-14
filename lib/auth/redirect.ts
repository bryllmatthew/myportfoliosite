/**
 * Only allow redirects back into the admin area, as same-origin relative paths.
 * Blocks protocol-relative ("//evil.com"), backslash and scheme tricks.
 */
export function safeAdminRedirect(target: string | null | undefined, fallback = "/admin"): string {
  if (!target || typeof target !== "string") return fallback;
  if (!target.startsWith("/admin")) return fallback;
  if (target.startsWith("//") || target.includes("\\") || target.includes("://")) return fallback;
  if (target.startsWith("/admin/login")) return fallback;
  return target;
}
