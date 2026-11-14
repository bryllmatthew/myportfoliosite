"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FileText, Film, ImagePlus, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { listMedia } from "@/lib/actions/admin/site";
import { formatBytes } from "@/lib/utils/format";
import type { MediaLibraryItem } from "@/types/content";
import { ACCEPT_ALL, ACCEPT_IMAGES, uploadMedia } from "./upload";

export function MediaThumb({ item, className }: { item: Pick<MediaLibraryItem, "public_url" | "mime_type" | "alt_text" | "file_name">; className?: string }) {
  if (item.mime_type.startsWith("image/")) {
    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails: arbitrary sizes, no optimization needed
    return <img src={item.public_url} alt={item.alt_text ?? ""} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
  }
  const Icon = item.mime_type.startsWith("video/") ? Film : FileText;
  return (
    <span className={cn("flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-raised p-2 text-center text-xs text-muted", className)}>
      <Icon className="size-6" aria-hidden />
      <span className="line-clamp-2 break-all">{item.file_name}</span>
    </span>
  );
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaLibraryItem) => void;
  imagesOnly?: boolean;
  entity?: string;
}

/** Choose an existing file from the library or upload a new one. */
export function MediaPicker({ open, onClose, onSelect, imagesOnly = true, entity = "library" }: MediaPickerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    const res = await listMedia(q);
    setLoading(false);
    if (res.ok) setItems(res.data);
    else setError(res.error);
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      void load("");
    }
    if (!open && d.open) d.close();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => void load(query), 300);
    return () => clearTimeout(t);
  }, [query, open, load]);

  const visible = imagesOnly ? items.filter((i) => i.mime_type.startsWith("image/")) : items;

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded = await uploadMedia(files[0]!, entity);
      toast.success("Uploaded");
      onSelect(uploaded);
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-[var(--radius-card)] border border-line-strong bg-surface p-0 text-paper backdrop:bg-ink/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line p-4 sm:p-5">
          <h2 id={titleId} className="font-display text-lg font-semibold">
            Choose {imagesOnly ? "an image" : "a file"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-surface-2">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4 sm:px-5">
          <div className="relative min-w-48 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden />
            <Input
              type="search"
              aria-label="Search files"
              placeholder="Search by file name or alt text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={imagesOnly ? ACCEPT_IMAGES : ACCEPT_ALL}
            className="sr-only"
            id={`${titleId}-file`}
            onChange={(e) => void onFiles(e.target.files)}
          />
          <Button variant="primary" loading={uploading} onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden />
            Upload new
          </Button>
        </div>
        <div className="min-h-48 flex-1 overflow-y-auto p-4 sm:p-5">
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : loading && !items.length ? (
            <p className="text-sm text-muted" role="status">
              Loading files…
            </p>
          ) : visible.length ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {visible.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="group flex w-full flex-col overflow-hidden rounded-xl border border-line text-left hover:border-signal focus-visible:border-signal"
                  >
                    <span className="relative block aspect-[4/3] w-full overflow-hidden bg-ink-raised">
                      <MediaThumb item={item} />
                    </span>
                    <span className="flex flex-col gap-0.5 p-2">
                      <span className="truncate text-xs text-paper">{item.file_name}</span>
                      <span className="text-[0.6875rem] text-subtle">{formatBytes(item.file_size)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-3 py-6">
              <ImagePlus className="size-6 text-signal" aria-hidden />
              <p className="text-muted">{query ? "No files match that search." : "The library is empty. Upload your first file."}</p>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
