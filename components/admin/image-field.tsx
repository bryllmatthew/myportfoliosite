"use client";

import { useState, type ReactNode } from "react";
import { get, useFormContext, useWatch } from "react-hook-form";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { MediaPicker } from "./media-picker";

interface ImageFieldProps {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  /** Optional alt-text field name that is pre-filled from the library's alt text. */
  altName?: string;
  entity?: string;
  imagesOnly?: boolean;
}

/** URL field with library picker, upload and live preview. Admins can also paste any https URL. */
export function ImageField({ name, label, hint, altName, entity, imagesOnly = true }: ImageFieldProps) {
  const { register, setValue, control, getValues, formState } = useFormContext();
  const url = (useWatch({ control, name }) as string) ?? "";
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const err = (get(formState.errors, name) as { message?: string } | undefined)?.message;
  const id = `f-${name.replace(/[.[\]]/g, "-")}`;
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
  const isImage = !isVideo && (/\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(url) || url.includes("/storage/v1/object/public/"));

  return (
    <div className="flex flex-col gap-3">
      <Field id={id} label={label} hint={hint ?? "Choose from the library, upload, or paste a full https:// URL."} error={err}>
        {(aria) => (
          <div className="flex flex-wrap gap-2">
            <Input {...aria} type="url" placeholder="https://" className="min-w-0 flex-1" {...register(name, { onChange: () => setBroken(false) })} />
            <Button variant="secondary" onClick={() => setOpen(true)}>
              <ImagePlus aria-hidden />
              Library
            </Button>
            {url ? (
              <Button variant="ghost" size="icon" aria-label={isVideo ? "Remove video" : "Remove image"} onClick={() => setValue(name, "", { shouldDirty: true, shouldValidate: true })}>
                <Trash2 aria-hidden />
              </Button>
            ) : null}
          </div>
        )}
      </Field>
      {url && isImage ? (
        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-xl border border-line bg-ink-raised">
          {broken ? (
            <p className="flex h-full items-center justify-center p-4 text-center text-sm text-danger">This image could not be loaded. Check the URL.</p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- live preview of an arbitrary admin-provided URL
            <img src={url} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
          )}
        </div>
      ) : null}
      {url && isVideo ? (
        <div className="w-full max-w-sm overflow-hidden rounded-xl border border-line bg-black">
          <video src={url} controls preload="metadata" playsInline className="aspect-video h-auto w-full" aria-label="Video preview" />
        </div>
      ) : null}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        imagesOnly={imagesOnly}
        entity={entity}
        onSelect={(item) => {
          setValue(name, item.public_url, { shouldDirty: true, shouldValidate: true });
          setBroken(false);
          if (altName && !getValues(altName) && item.alt_text) {
            setValue(altName, item.alt_text, { shouldDirty: true, shouldValidate: true });
          }
        }}
      />
    </div>
  );
}
