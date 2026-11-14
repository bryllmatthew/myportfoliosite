"use client";

import { useState, type ReactNode } from "react";
import { get, useFormContext, useWatch } from "react-hook-form";
import { Eye, PencilLine } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils/cn";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/form-controls";
import { slugify } from "@/lib/utils/format";

/* Fields read the form from context, so editors stay declarative: <TextField name="title" label="Title" />. */

function useFieldError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext();
  const err = get(errors, name) as { message?: unknown } | undefined;
  return typeof err?.message === "string" ? err.message : undefined;
}

const fieldId = (name: string) => `f-${name.replace(/[.[\]]/g, "-")}`;

interface BaseProps {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
}

export function TextField({
  name,
  label,
  hint,
  required,
  className,
  type = "text",
  placeholder,
  autoComplete,
}: BaseProps & { type?: string; placeholder?: string; autoComplete?: string }) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return (
    <Field id={fieldId(name)} label={label} hint={hint} error={error} required={required} className={className}>
      {(aria) => <Input {...aria} type={type} placeholder={placeholder} autoComplete={autoComplete ?? "off"} {...register(name)} />}
    </Field>
  );
}

export function NumberField({ name, label, hint, className }: BaseProps) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return (
    <Field id={fieldId(name)} label={label} hint={hint} error={error} className={className}>
      {(aria) => <Input {...aria} type="number" inputMode="numeric" min={0} step={1} className="max-w-40" {...register(name, { valueAsNumber: true })} />}
    </Field>
  );
}

export function TextareaField({ name, label, hint, required, className, rows = 4, placeholder }: BaseProps & { rows?: number; placeholder?: string }) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return (
    <Field id={fieldId(name)} label={label} hint={hint} error={error} required={required} className={className}>
      {(aria) => <Textarea {...aria} rows={rows} placeholder={placeholder} {...register(name)} />}
    </Field>
  );
}

/** One item per line, stored as a list. */
export function LinesField(props: BaseProps & { rows?: number; placeholder?: string }) {
  return <TextareaField {...props} hint={props.hint ?? "One item per line."} />;
}

/** Markdown textarea with a safe rendered preview (raw HTML is never rendered). */
export function MarkdownField({ name, label, hint, required, className, rows = 8 }: BaseProps & { rows?: number }) {
  const { register, control } = useFormContext();
  const value = (useWatch({ control, name }) as string | undefined) ?? "";
  const error = useFieldError(name);
  const [preview, setPreview] = useState(false);
  const id = fieldId(name);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-paper">
          {label}
          {required ? <span className="ml-0.5 text-signal" aria-hidden>*</span> : null}
        </label>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          aria-pressed={preview}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted hover:bg-surface hover:text-paper"
        >
          {preview ? <PencilLine className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
          {preview ? "Edit" : "Preview"}
        </button>
      </div>
      <div className={preview ? "hidden" : undefined}>
        <Textarea
          id={id}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
          className="font-[450]"
          {...register(name)}
        />
      </div>
      {preview ? (
        <div className="prose-cms min-h-24 rounded-[var(--radius-control)] border border-line bg-ink-raised p-4 text-[0.9375rem]">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-subtle">Nothing to preview yet.</p>
          )}
        </div>
      ) : null}
      <p id={`${id}-hint`} className="text-meta text-subtle">
        {hint ?? "Supports Markdown: **bold**, *italic*, - lists, [links](https://…), ## headings."}
      </p>
      {error ? (
        <p id={`${id}-error`} className="text-meta text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SelectField({
  name,
  label,
  hint,
  required,
  className,
  options,
}: BaseProps & { options: { value: string; label: string }[] }) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return (
    <Field id={fieldId(name)} label={label} hint={hint} error={error} required={required} className={className}>
      {(aria) => (
        <Select {...aria} {...register(name)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
}

export function SwitchField({ name, label, description, className }: { name: string; label: ReactNode; description?: ReactNode; className?: string }) {
  const { register } = useFormContext();
  return <Switch id={fieldId(name)} label={label} description={description} className={className} {...register(name)} />;
}

/**
 * Slug input with "generate from title". When the item is published, editing is
 * locked behind an explicit confirmation so live URLs never change silently.
 */
export function SlugField({ sourceName = "title", published, basePath }: { sourceName?: string; published: boolean; basePath: string }) {
  const { register, setValue, getValues, control } = useFormContext();
  const slug = (useWatch({ control, name: "slug" }) as string) ?? "";
  const confirmed = Boolean(useWatch({ control, name: "confirm_slug_change" }));
  const error = useFieldError("slug");
  const locked = published && !confirmed;
  return (
    <div className="flex flex-col gap-3">
      <Field id="f-slug" label="URL slug" required error={error} hint={`Public address: ${basePath}/${slug || "…"}`}>
        {(aria) => (
          <div className="flex gap-2">
            <Input {...aria} readOnly={locked} className={cn(locked && "opacity-70")} {...register("slug")} />
            <button
              type="button"
              disabled={locked}
              onClick={() => setValue("slug", slugify(String(getValues(sourceName) ?? "")), { shouldDirty: true, shouldValidate: true })}
              className="shrink-0 rounded-[var(--radius-control)] border border-line px-3 text-sm text-muted hover:border-line-strong hover:text-paper disabled:opacity-50"
            >
              From title
            </button>
          </div>
        )}
      </Field>
      {published ? (
        <Switch
          id="f-confirm_slug_change"
          label="Change the live URL"
          description="This item is published. Changing the slug breaks links that point to the current address."
          {...register("confirm_slug_change")}
        />
      ) : null}
    </div>
  );
}

/** Multi-select as toggle chips, for relations like services or categories. */
export function ChipsField({
  name,
  label,
  hint,
  options,
  emptyText = "Nothing to choose yet.",
}: {
  name: string;
  label: string;
  hint?: ReactNode;
  options: { value: string; label: string; note?: string }[];
  emptyText?: ReactNode;
}) {
  const { control, setValue } = useFormContext();
  const selected = ((useWatch({ control, name }) as string[] | undefined) ?? []);
  const error = useFieldError(name);
  const toggle = (value: string) => {
    const next = selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
    setValue(name, next, { shouldDirty: true, shouldValidate: true });
  };
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-medium text-paper">{label}</legend>
      {options.length ? (
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const on = selected.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(o.value)}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
                  on ? "border-signal bg-signal/15 text-paper" : "border-line text-muted hover:border-line-strong hover:text-paper",
                )}
              >
                {o.label}
                {o.note ? <span className="text-xs text-subtle">{o.note}</span> : null}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-subtle">{emptyText}</p>
      )}
      {hint ? <p className="text-meta text-subtle">{hint}</p> : null}
      {error ? (
        <p className="text-meta text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
