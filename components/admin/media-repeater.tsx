"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Repeater } from "./editor";
import { SelectField, TextField } from "./fields";
import { ImageField } from "./image-field";

/** Ordered gallery editor shared by projects and case studies. */
export function MediaRepeater({ entity }: { entity: string }) {
  const { control } = useFormContext();
  const media = useFieldArray({ control, name: "media", keyName: "key" });
  const values = (useWatch({ control, name: "media" }) as { media_type: string; caption: string; alt_text: string }[] | undefined) ?? [];

  return (
    <Repeater
      items={media.fields as unknown as { key: string }[]}
      itemLabel={(i) => {
        const m = values[i];
        const kind = m?.media_type === "video" ? "Video" : m?.media_type === "embed" ? "Embed" : "Image";
        return `${kind} ${i + 1}${m?.caption ? `: ${m.caption}` : ""}`;
      }}
      onAdd={() => media.append({ media_type: "image", url: "", thumbnail_url: "", alt_text: "", caption: "" })}
      onRemove={(i) => media.remove(i)}
      onMove={(a, b) => media.move(a, b)}
      addLabel="Add media"
      emptyText="No gallery items. Add screenshots, videos or YouTube, Vimeo and Loom links."
      max={40}
      renderItem={(i) => {
        const type = values[i]?.media_type ?? "image";
        return (
          <>
            <SelectField
              name={`media.${i}.media_type`}
              label="Type"
              options={[
                { value: "image", label: "Image" },
                { value: "video", label: "Video file (MP4 or WebM)" },
                { value: "embed", label: "YouTube, Vimeo or Loom link" },
              ]}
            />
            {type === "embed" ? (
              <TextField name={`media.${i}.url`} label="Video link" required placeholder="https://www.youtube.com/watch?v=…" />
            ) : (
              <ImageField
                name={`media.${i}.url`}
                label={type === "video" ? "Video file" : "Image"}
                altName={type === "image" ? `media.${i}.alt_text` : undefined}
                entity={entity}
                imagesOnly={type === "image"}
              />
            )}
            {type === "video" ? <ImageField name={`media.${i}.thumbnail_url`} label="Poster image" entity={entity} hint="Shown before the video plays." /> : null}
            <TextField
              name={`media.${i}.alt_text`}
              label={type === "image" ? "Alt text" : "Accessible title"}
              required={type === "image"}
              hint={type === "image" ? "Describe what the image shows, for screen reader users." : "A short title for the video."}
            />
            <TextField name={`media.${i}.caption`} label="Caption" hint="Optional, shown below the media." />
          </>
        );
      }}
    />
  );
}
