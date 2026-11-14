import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminContext } from "@/lib/auth/admin";

const TABLES = {
  service: { table: "services", base: "/services" },
  project: { table: "projects", base: "/work" },
  case_study: { table: "case_studies", base: "/case-studies" },
} as const;

/**
 * Admin "Preview" entry point. Only an authorized admin can enable Draft Mode;
 * the redirect target is derived from the record itself, never from user input.
 */
export async function GET(request: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx) return new NextResponse("Not authorized", { status: 401 });

  const type = request.nextUrl.searchParams.get("type") as keyof typeof TABLES | null;
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const target = type ? TABLES[type] : undefined;

  if (!target || !/^[0-9a-f-]{36}$/i.test(id)) {
    return new NextResponse("Invalid preview request", { status: 400 });
  }

  const { data } = await ctx.supabase.from(target.table).select("slug").eq("id", id).maybeSingle();
  if (!data?.slug) return new NextResponse("Not found", { status: 404 });

  (await draftMode()).enable();
  return NextResponse.redirect(new URL(`${target.base}/${data.slug}`, request.url), 307);
}
