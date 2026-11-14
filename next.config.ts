import type { NextConfig } from "next";

const supabase = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
  } catch {
    return null;
  }
})();
const supabaseHost = supabase?.hostname ?? null;

const isDev = process.env.NODE_ENV !== "production";
/** Local Supabase (CLI) serves plain http; production Supabase is always https. */
const insecureSupabase = supabase?.protocol === "http:";

/**
 * Content-Security-Policy.
 * - The exact Supabase origin (scheme, host, port) is allowed for API/auth/storage requests and media.
 * - YouTube/Vimeo/Loom are allowed as frames so admins can embed project video.
 * - 'unsafe-inline' for scripts is required by Next.js inline bootstrap scripts
 *   unless a nonce-based setup is adopted (which forces dynamic rendering).
 */
const supabaseOrigin = supabase?.origin ?? "https://*.supabase.co";
const supabaseSocket = supabase ? supabase.origin.replace(/^http/, "ws") : "wss://*.supabase.co";
const localMedia = insecureSupabase ? ` ${supabaseOrigin}` : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https:${localMedia}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseSocket}${isDev ? " ws:" : ""}`,
  `media-src 'self' blob: https:${localMedia}`,
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://www.loom.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev || insecureSupabase ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    remotePatterns: [
      supabaseHost
        ? { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }
        : { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Media imported from the previous Wix portfolio (until moved with `npm run media:import`).
      { protocol: "https", hostname: "static.wixstatic.com", pathname: "/media/**" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
