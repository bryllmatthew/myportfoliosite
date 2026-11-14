"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { submitInquiry } from "@/lib/actions/contact";
import { contactFormSchema, type ContactFormInput } from "@/lib/validations/content";
import { track } from "@/lib/analytics";

interface ContactFormProps {
  services: { id: string; title: string; slug: string }[];
  budgetRanges: string[];
  showBudget: boolean;
  fallbackEmail?: string | null;
}

export function ContactForm({ services, budgetRanges, showBudget, fallbackEmail }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      service_id: "",
      budget_range: "",
      message: "",
      website: "",
      started_at: 0,
      source_page: "",
    },
  });

  // Client-only values: fill-time stamp, source page, and ?service= preselection.
  useEffect(() => {
    setValue("started_at", Date.now());
    setValue("source_page", document.referrer ? new URL(document.referrer).pathname.slice(0, 300) : "/contact");
    const slug = new URLSearchParams(window.location.search).get("service");
    const match = slug ? services.find((s) => s.slug === slug) : null;
    if (match) setValue("service_id", match.id);
  }, [services, setValue]);

  useEffect(() => {
    if (status !== "idle") statusRef.current?.focus();
  }, [status]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const result = await submitInquiry(values);
      if (result.ok) {
        setStatus("success");
        track("inquiry_submitted", { service: services.find((s) => s.id === values.service_id)?.slug ?? null });
        reset();
        return;
      }
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (messages?.[0]) setError(field as keyof ContactFormInput, { message: messages[0] });
      }
      setServerError(result.error);
      setStatus("error");
    } catch {
      setServerError("Your message could not be sent. Check your connection and try again.");
      setStatus("error");
    }
  });

  if (status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] border border-grow/40 bg-grow/[0.07] p-8 outline-none"
      >
        <CheckCircle2 className="size-8 text-grow" aria-hidden />
        <h2 className="type-h3">Message sent</h2>
        <p className="text-muted">Thanks for reaching out. You will get a reply at the email address you provided.</p>
        <Button
          variant="secondary"
          onClick={() => {
            setStatus("idle");
            setValue("started_at", Date.now());
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5" aria-describedby={serverError ? "form-error" : undefined}>
      {status === "error" && serverError ? (
        <div
          ref={statusRef}
          id="form-error"
          tabIndex={-1}
          role="alert"
          className="flex items-start gap-3 rounded-[var(--radius-control)] border border-danger/40 bg-danger/10 p-4 text-sm text-paper outline-none"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          <p>
            {serverError}
            {fallbackEmail ? (
              <>
                {" "}
                <a className="underline underline-offset-2" href={`mailto:${fallbackEmail}`}>
                  {fallbackEmail}
                </a>
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Your name" required error={errors.name?.message}>
          {(aria) => <Input {...aria} autoComplete="name" {...register("name")} />}
        </Field>
        <Field id="email" label="Email" required error={errors.email?.message}>
          {(aria) => <Input {...aria} type="email" autoComplete="email" inputMode="email" {...register("email")} />}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="company" label="Company" hint="Optional" error={errors.company?.message}>
          {(aria) => <Input {...aria} autoComplete="organization" {...register("company")} />}
        </Field>
        <Field id="service_id" label="What do you need help with?" error={errors.service_id?.message}>
          {(aria) => (
            <Select {...aria} {...register("service_id")}>
              <option value="">Not sure yet</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      {showBudget && budgetRanges.length ? (
        <Field id="budget_range" label="Budget" hint="Optional. Helps me suggest the right scope." error={errors.budget_range?.message}>
          {(aria) => (
            <Select {...aria} {...register("budget_range")}>
              <option value="">Prefer not to say</option>
              {budgetRanges.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          )}
        </Field>
      ) : null}

      <Field id="message" label="Project details" required hint="What are you trying to achieve, and by when?" error={errors.message?.message}>
        {(aria) => <Textarea {...aria} rows={6} {...register("message")} />}
      </Field>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Button type="submit" size="lg" loading={isSubmitting}>
          {isSubmitting ? "Sending" : "Send message"}
        </Button>
        <p className="text-meta">I only use your details to reply to you.</p>
      </div>
    </form>
  );
}
