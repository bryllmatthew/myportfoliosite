import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
