import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/** Leaves preview mode and returns to the same page, now showing published content. */
export async function POST(request: NextRequest) {
  (await draftMode()).disable();
  const referer = request.headers.get("referer");
  let path = "/";
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.origin === request.nextUrl.origin) path = url.pathname;
    } catch {
      // ignore malformed referer
    }
  }
  return NextResponse.redirect(new URL(path, request.url), 303);
}
