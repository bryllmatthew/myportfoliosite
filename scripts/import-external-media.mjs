#!/usr/bin/env node
/**
 * Copies media hosted on the old Wix site into your own Supabase Storage and
 * rewrites every reference in the database to the new URLs.
 *
 *   npm run media:import                       # copy images (resized), keep videos on Wix
 *   npm run media:import -- --include-videos   # also copy videos (large: ~230 MB)
 *   npm run media:import -- --dry-run
 *   npm run media:import -- --limit 5
 *
 * Images are fetched through Wix's resizer (max 1600px, WebP) instead of the
 * multi-megabyte originals, which keeps Storage use around 50 MB. Videos stay
 * on Wix's CDN unless --include-videos is passed, so streaming does not count
 * against your Supabase bandwidth.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * Safe to re-run: files are stored under a path derived from their source URL,
 * so an already-copied file is reused instead of uploaded twice.
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

const BUCKET = "public-media";
const HOSTS = ["static.wixstatic.com", "video.wixstatic.com"];
const MAX_BYTES = 50 * 1024 * 1024;
const MIME_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "application/pdf": "pdf",
};

/** Every column that can hold a media URL. */
const REFERENCES = [
  { table: "services", key: "id", columns: ["hero_media_url", "og_image_url"] },
  { table: "projects", key: "id", columns: ["cover_image_url", "hero_media_url", "og_image_url"] },
  { table: "project_media", key: "id", columns: ["url", "thumbnail_url"] },
  { table: "case_studies", key: "id", columns: ["cover_image_url", "hero_media_url", "og_image_url"] },
  { table: "case_study_media", key: "id", columns: ["url", "thumbnail_url"] },
  { table: "testimonials", key: "id", columns: ["avatar_url"] },
  { table: "brands", key: "id", columns: ["logo_url"] },
  { table: "profiles", key: "id", columns: ["avatar_url", "resume_url"] },
  { table: "site_settings", key: "id", columns: ["default_og_image"] },
  { table: "page_settings", key: "id", columns: ["og_image_url"] },
];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const includeVideos = args.includes("--include-videos");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx > -1 ? Number(args[limitIdx + 1]) : Infinity;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const isExternal = (v) => {
  if (typeof v !== "string") return false;
  try {
    const host = new URL(v).hostname;
    if (host === "video.wixstatic.com" && !includeVideos) return false;
    return HOSTS.includes(host);
  } catch {
    return false;
  }
};

/** Wix images are downloaded resized and re-encoded; anything else as-is. */
function downloadUrl(source) {
  const u = new URL(source);
  if (u.hostname === "static.wixstatic.com" && u.pathname.startsWith("/media/") && !u.pathname.includes("/v1/")) {
    return `${source}/v1/fit/w_1600,h_1600,q_80/file.webp`;
  }
  return source;
}

// 1. Find every external URL and where it is used.
const uses = new Map(); // url -> [{ table, key, id, column }]
for (const ref of REFERENCES) {
  const { data, error } = await db.from(ref.table).select([ref.key, ...ref.columns].join(","));
  if (error) {
    console.error(`Could not read ${ref.table}: ${error.message}`);
    process.exit(1);
  }
  for (const row of data ?? []) {
    for (const column of ref.columns) {
      const value = row[column];
      if (!isExternal(value)) continue;
      if (!uses.has(value)) uses.set(value, []);
      uses.get(value).push({ table: ref.table, key: ref.key, id: row[ref.key], column });
    }
  }
}

const sources = [...uses.keys()].slice(0, limit);
console.log(`${uses.size} external files referenced${Number.isFinite(limit) ? `, processing ${sources.length}` : ""}.`);
if (dryRun) {
  for (const s of sources) console.log(`  ${s}  (${uses.get(s).length} uses)`);
  process.exit(0);
}

// 2. Copy each file, then rewrite its references.
let copied = 0;
let reused = 0;
let failed = 0;

async function processOne(source) {
  const hash = createHash("sha1").update(source).digest("hex").slice(0, 32);
  const parts = new URL(source).pathname.split("/").filter(Boolean);
  const baseName = (source.includes("video.wixstatic.com") ? parts.at(-4) : parts.at(-1)?.replace(/\.[a-z0-9]+$/i, "") ?? "file")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .slice(0, 60);

  // Reuse an earlier copy of the same source.
  const { data: existing } = await db.storage.from(BUCKET).list(`imported/${hash}`, { limit: 1 });
  let storagePath = existing?.[0] ? `imported/${hash}/${existing[0].name}` : null;

  if (storagePath) {
    reused++;
  } else {
    const res = await fetch(downloadUrl(source));
    if (!res.ok) throw new Error(`download failed (${res.status})`);
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    const ext = MIME_EXT[type];
    if (!ext) throw new Error(`unsupported type ${type || "unknown"}`);
    const body = Buffer.from(await res.arrayBuffer());
    if (body.length > MAX_BYTES) throw new Error(`larger than 50 MB (${Math.round(body.length / 1048576)} MB)`);
    storagePath = `imported/${hash}/${baseName}.${ext}`;
    const { error: upErr } = await db.storage.from(BUCKET).upload(storagePath, body, {
      contentType: type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (upErr) throw new Error(`upload failed: ${upErr.message}`);
    const publicUrl = db.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
    await db.from("media_library").upsert(
      {
        storage_path: storagePath,
        public_url: publicUrl,
        file_name: `${baseName}.${ext}`,
        mime_type: type,
        file_size: body.length,
        alt_text: null,
      },
      { onConflict: "storage_path" },
    );
    copied++;
  }

  const newUrl = db.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
  for (const u of uses.get(source)) {
    const { error } = await db.from(u.table).update({ [u.column]: newUrl }).eq(u.key, u.id).eq(u.column, source);
    if (error) throw new Error(`could not update ${u.table}.${u.column}: ${error.message}`);
  }
}

const queue = [...sources];
const workers = Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const source = queue.shift();
    try {
      await processOne(source);
      process.stdout.write(".");
    } catch (e) {
      failed++;
      console.error(`\n  ✗ ${source}: ${e.message}`);
    }
  }
});
await Promise.all(workers);

console.log(`\n\nCopied ${copied}, reused ${reused}, failed ${failed}.`);
console.log("Open Admin → Settings → Refresh the live site so pages use the new URLs right away.");
process.exit(failed ? 1 : 0);
