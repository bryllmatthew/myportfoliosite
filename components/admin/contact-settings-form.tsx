"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/admin/page-header";
import { LinesField, SwitchField, TextField, TextareaField } from "@/components/admin/fields";
import { applyResult, onInvalid, useUnsavedChanges } from "@/components/admin/editor";
import { saveContactSettings } from "@/lib/actions/admin/site";
import { contactSettingsSchema, type ContactSettingsInput } from "@/lib/validations/content";
import type { ContactSettings } from "@/types/content";

export function ContactSettingsForm({ settings }: { settings: ContactSettings | null }) {
  const router = useRouter();
  const form = useForm<ContactSettingsInput>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: {
      primary_email: settings?.primary_email ?? "",
      phone: settings?.phone ?? "",
      location_label: settings?.location_label ?? "",
      calendar_url: settings?.calendar_url ?? "",
      contact_intro: settings?.contact_intro ?? "",
      response_time_text: settings?.response_time_text ?? "",
      show_budget: settings?.show_budget ?? true,
      budget_ranges: (settings?.budget_ranges ?? []).join("\n"),
    },
  });
  useUnsavedChanges(form.formState.isDirty);

  const submit = form.handleSubmit(async (values) => {
    const res = await saveContactSettings(values);
    if (applyResult(res, form.setError)) {
      form.reset(values);
      router.refresh();
    }
  }, onInvalid);

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate>
        <FormSection title="Contact details" description="Shown on the contact page and in the footer. Leave a field empty to hide it.">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="primary_email" label="Email" type="email" />
            <TextField name="phone" label="Phone" type="tel" />
            <TextField name="location_label" label="Location" />
            <TextField name="response_time_text" label="Response time" placeholder="I reply within one business day." />
          </div>
          <TextField name="calendar_url" label="Booking link" type="url" placeholder="https://" hint="Optional. Adds a Book a call button, for example a Calendly link." />
          <TextareaField name="contact_intro" label="Intro text" rows={3} />
          <SwitchField name="show_budget" label="Ask for a budget" description="Adds an optional budget question to the contact form." />
          <LinesField name="budget_ranges" label="Budget options" rows={5} />
          <div>
            <Button type="submit" loading={form.formState.isSubmitting}>
              Save changes
            </Button>
          </div>
        </FormSection>
      </form>
    </FormProvider>
  );
}
