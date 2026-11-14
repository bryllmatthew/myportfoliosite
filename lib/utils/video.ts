/**
 * Converts a YouTube / Vimeo / Loom share URL into an embed URL.
 * Returns null for anything else so arbitrary iframes are never rendered.
 */
export function toEmbedUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id =
      url.searchParams.get("v") ?? (url.pathname.startsWith("/shorts/") ? url.pathname.split("/")[2] : null);
    return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (host === "player.vimeo.com" && /^\/video\/\d+/.test(url.pathname)) return url.toString();
  if (host === "loom.com") {
    const match = url.pathname.match(/^\/(?:share|embed)\/([a-f0-9]+)/i);
    return match ? `https://www.loom.com/embed/${match[1]}` : null;
  }
  return null;
}

export function isVideoFile(url: string): boolean {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}
