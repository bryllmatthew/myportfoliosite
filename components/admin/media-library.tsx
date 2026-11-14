"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ImagePlus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/misc";
import { MediaThumb } from "@/components/admin/media-picker";
import { ACCEPT_ALL, uploadMedia, validateFile } from "@/components/admin/upload";
import { deleteMedia, updateMediaAlt } from "@/lib/actions/admin/site";
import { formatBytes, formatDate } from "@/lib/utils/format";
import type { MediaLibraryItem } from "@/types/content";

function typeLabel(mime: string) {
  if (mime === "application/pdf") return "PDF";
  const [kind, sub] = mime.split("/");
  return `${(sub ?? "").toUpperCase()} ${kind === "video" ? "video" : "image"}`;
}

function MediaCard({ item, onDelete }: { item: MediaLibraryItem; onDelete: (item: MediaLibraryItem) => void }) {
  const [alt, setAlt] = useState(item.alt_text ?? "");
  const [savedAlt, setSavedAlt] = useState(item.alt_text ?? "");
  const [saving, setSaving] = useState(false);
  const altId = `alt-${item.id}`;
  const isImage = item.mime_type.startsWith("image/");

  const saveAlt = async () => {
    if (alt === savedAlt) return;
    setSaving(true);
    const res = await updateMediaAlt(item.id, alt);
    setSaving(false);
    if (res.ok) {
      setSavedAlt(alt);
      toast.success("Alt text saved");
    } else {
      toast.error(res.error);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.public_url);
      toast.success("URL copied");
    } catch {
      toast.error("Could not copy. Select the URL and copy it manually.");
    }
  };

  return (
    <li className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface/40">
      <a
        href={item.public_url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[4/3] overflow-hidden bg-ink-raised"
        aria-label={`Open ${item.file_name} in a new tab`}
      >
        <MediaThumb item={item} />
      </a>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-paper" title={item.file_name}>
            {item.file_name}
          </p>
          <p className="mt-0.5 text-xs text-subtle">
            {[typeLabel(item.mime_type), formatBytes(item.file_size), item.width && item.height ? `${item.width} × ${item.height}` : null, formatDate(item.created_at)]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
        {isImage ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={altId} className="text-xs font-medium text-muted">
              Alt text
            </label>
            <div className="flex gap-2">
              <Input
                id={altId}
                value={alt}
                maxLength={300}
                placeholder="Describe the image"
                onChange={(e) => setAlt(e.target.value)}
                onBlur={() => void saveAlt()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void saveAlt();
                  }
                }}
                className="h-9 text-sm"
              />
              <Button size="sm" variant="secondary" loading={saving} disabled={alt === savedAlt} onClick={() => void saveAlt()}>
                Save
              </Button>
            </div>
            {!savedAlt ? <p className="text-xs text-signal">Missing alt text</p> : null}
          </div>
        ) : null}
        <div className="mt-auto flex items-center gap-1 pt-1">
          <Button size="sm" variant="ghost" onClick={() => void copy()}>
            <Copy aria-hidden />
            Copy URL
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="ml-auto text-danger hover:text-danger"
            aria-label={`Delete ${item.file_name}`}
            onClick={() => onDelete(item)}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function MediaLibrary({ items, query }: { items: MediaLibraryItem[]; query: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<{ item: MediaLibraryItem; inUse: string | null } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const upload = async (list: FileList | File[] | null) => {
    const files = Array.from(list ?? []);
    if (!files.length) return;
    const valid = files.filter((f) => {
      const problem = validateFile(f);
      if (problem) toast.error(problem);
      return !problem;
    });
    if (!valid.length) return;
    setUploading({ done: 0, total: valid.length });
    let ok = 0;
    for (const [i, file] of valid.entries()) {
      try {
        await uploadMedia(file, "library");
        ok++;
      } catch (e) {
        toast.error((e as Error).message);
      }
      setUploading({ done: i + 1, total: valid.length });
    }
    setUploading(null);
    if (fileRef.current) fileRef.current.value = "";
    if (ok) {
      toast.success(ok === 1 ? "1 file uploaded" : `${ok} files uploaded`);
      router.refresh();
    }
  };

  const confirmDelete = async () => {
    if (!pending) return;
    setDeleting(true);
    const res = await deleteMedia(pending.item.id, pending.inUse !== null);
    setDeleting(false);
    if (res.ok) {
      toast.success("File deleted");
      setPending(null);
      router.refresh();
    } else if (pending.inUse === null && res.error.includes("still used by")) {
      setPending({ item: pending.item, inUse: res.error });
    } else {
      toast.error(res.error);
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void upload(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-start gap-3 rounded-[var(--radius-card)] border border-dashed p-5 transition-colors sm:flex-row sm:items-center sm:justify-between",
          dragOver ? "border-signal bg-signal/5" : "border-line-strong",
        )}
      >
        <div>
          <p className="font-medium">Upload files</p>
          <p className="text-sm text-muted">Drop files here or choose them. Images up to 10 MB, MP4 or WebM video up to 50 MB, PDF up to 10 MB.</p>
        </div>
        <input
          ref={fileRef}
          id="media-upload"
          type="file"
          multiple
          accept={ACCEPT_ALL}
          className="sr-only"
          onChange={(e) => void upload(e.target.files)}
        />
        <Button onClick={() => fileRef.current?.click()} loading={uploading !== null}>
          <Upload aria-hidden />
          {uploading ? `Uploading ${uploading.done + 1} of ${uploading.total}` : "Choose files"}
        </Button>
      </div>

      <form method="get" role="search" className="flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden />
          <Input type="search" name="q" defaultValue={query} aria-label="Search files" placeholder="Search by file name or alt text" className="pl-9" />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} onDelete={(i) => setPending({ item: i, inUse: null })} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<ImagePlus />}
          title={query ? "No files match that search" : "The media library is empty"}
          description={query ? "Try a different file name or clear the search." : "Upload images, videos or PDFs to use them across the site."}
        />
      )}

      <ConfirmDialog
        open={pending !== null}
        title={pending?.inUse ? "This file is still in use" : "Delete this file?"}
        description={
          pending?.inUse
            ? `${pending.inUse} Deleting it will show a placeholder wherever it appears.`
            : pending
              ? `“${pending.item.file_name}” will be permanently removed from storage.`
              : undefined
        }
        confirmLabel={pending?.inUse ? "Delete anyway" : "Delete file"}
        loading={deleting}
        onCancel={() => setPending(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
