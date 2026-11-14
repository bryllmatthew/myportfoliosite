import {
  forwardRef,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/cn";

const controlBase =
  "w-full rounded-[var(--radius-control)] border border-line bg-ink-raised px-3.5 text-[0.9375rem] text-paper placeholder:text-subtle transition-colors duration-150 hover:border-line-strong focus-visible:border-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/35 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/30";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(controlBase, "h-11", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 4, ...props }, ref) {
    return <textarea ref={ref} rows={rows} className={cn(controlBase, "min-h-24 py-2.5 leading-relaxed", className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        controlBase,
        "h-11 appearance-none bg-[length:16px] bg-[right_0.85rem_center] bg-no-repeat pr-10",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239aa4ba' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-paper", className)} {...props} />;
}

interface FieldProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (aria: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
    "aria-required"?: boolean;
  }) => ReactNode;
}

/**
 * Label + control + hint + error, with the accessibility wiring done once:
 * the error and hint are linked through aria-describedby and the control is
 * marked aria-invalid when there is an error.
 */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="ml-0.5 text-signal" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
        ...(required ? { "aria-required": true } : {}),
      })}
      {hint && !error ? (
        <p id={hintId} className="text-meta text-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-meta text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  description?: ReactNode;
}

/** Accessible switch built on a native checkbox (keyboard + form support for free). */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, className, id, ...props },
  ref,
) {
  const descId = description && id ? `${id}-desc` : undefined;
  return (
    <label htmlFor={id} className={cn("group flex cursor-pointer items-start gap-3", className)}>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          role="switch"
          aria-describedby={descId}
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden
          className="h-6 w-10 rounded-full border border-line-strong bg-surface transition-colors peer-checked:border-signal peer-checked:bg-signal/90 peer-focus-visible:ring-2 peer-focus-visible:ring-signal peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink peer-disabled:opacity-50"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-1 top-1 size-4 rounded-full bg-paper transition-transform duration-200 peer-checked:translate-x-4 peer-checked:bg-signal-ink"
        />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-medium text-paper">{label}</span>
        {description ? (
          <span id={descId} className="text-meta text-subtle">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
});
