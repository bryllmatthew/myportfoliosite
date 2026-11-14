"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { recordMedia } from "@/lib/actions/admin/site";
import { slugify } from "@/lib/utils/format";
import type { MediaLibraryItem } from "@/types/content";

const LIMITS: Record<string, { ext: string; max: number }> = {
  "image/jpeg": { ext: "jpg", max: 10 * 1024 * 1024 },
  "image/png": { ext: "png", max: 10 * 1024 * 1024 },
  "image/webp": { ext: "webp", max: 10 * 1024 * 1024 },
  "image/avif": { ext: "avif", max: 10 * 1024 * 1024 },
  "image/gif": { ext: "gif", max: 10 * 1024 * 1024 },
  "video/mp4": { ext: "mp4", max: 50 * 1024 * 1024 },
  "video/webm": { ext: "webm", max: 50 * 1024 * 1024 },
  "application/pdf": { ext: "pdf", max: 10 * 1024 * 1024 },
};

export const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/avif,image/gif";
export const ACCEPT_ALL = Object.keys(LIMITS).join(",");

export function validateFile(file: File): string | null {
  const rule = LIMITS[file.type];
  if (!rule) return `${file.name}: this file type is not supported. Use JPG, PNG, WebP, AVIF, GIF, MP4, WebM or PDF.`;
  if (file.size > rule.max) return `${file.name}: the file is larger than ${Math.round(rule.max / 1024 / 1024)} MB.`;
  return null;
}

async function imageSize(file: File): Promise<{ width: number | null; height: number | null }> {
  if (!file.type.startsWith("image/")) return { width: null, height: null };
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return { width: null, height: null };
  }
}

/**
 * Uploads straight from the browser to Supabase Storage using the admin's session
 * (Storage RLS only allows admins to write), then records the file server-side.
 * Path: {entity}/{uuid}/{safe-filename}
 */
export async function uploadMedia(file: File, entity = "library", alt = ""): Promise<MediaLibraryItem> {
  const problem = validateFile(file);
  if (problem) throw new Error(problem);

  const rule = LIMITS[file.type]!;
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
  const path = `${slugify(entity) || "library"}/${crypto.randomUUID()}/${base}.${rule.ext}`;
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`${file.name}: upload failed. ${error.message}`);

  const { width, height } = await imageSize(file);
  const result = await recordMedia({
    storage_path: path,
    file_name: file.name.slice(0, 255),
    mime_type: file.type,
    file_size: file.size,
    width,
    height,
    alt_text: alt,
  });
  if (!result.ok) {
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    throw new Error(result.error);
  }
  return result.data;
}
