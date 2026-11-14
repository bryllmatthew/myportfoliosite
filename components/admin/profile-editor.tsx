"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/admin/page-header";
import { LinesField, MarkdownField, SwitchField, TextField, TextareaField } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import { Repeater, applyResult, onInvalid, useUnsavedChanges } from "@/components/admin/editor";
import { saveProfile } from "@/lib/actions/admin/site";
import { profileSchema, type ProfileInput } from "@/lib/validations/content";
import type { Profile } from "@/types/content";

function toForm(p: Profile | null): ProfileInput {
  return {
    display_name: p?.display_name ?? "",
    headline: p?.headline ?? "",
    short_bio: p?.short_bio ?? "",
    long_bio: p?.long_bio ?? "",
    avatar_url: p?.avatar_url ?? "",
    resume_url: p?.resume_url ?? "",
    location_label: p?.location_label ?? "",
    availability_label: p?.availability_label ?? "",
    is_available: p?.is_available ?? true,
    email_public: p?.email_public ?? "",
    phone_public: p?.phone_public ?? "",
    skills: (p?.skills ?? []).join("\n"),
    stack_groups: (p?.stack_groups ?? []).map((g) => ({ category: g.category, items: (g.items ?? []).join("\n") })),
    experience: (p?.experience ?? []).map((e) => ({
      role: e.role ?? "",
      organization: e.organization ?? "",
      period: e.period ?? "",
      description: e.description ?? "",
    })),
  };
}

export function ProfileEditor({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const form = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: toForm(profile) });
  const { control, formState } = form;
  useUnsavedChanges(formState.isDirty);

  const groups = useFieldArray({ control, name: "stack_groups" });
  const experience = useFieldArray({ control, name: "experience" });
  const groupValues = useWatch({ control, name: "stack_groups" });
  const experienceValues = useWatch({ control, name: "experience" });

  const submit = form.handleSubmit(async (values) => {
    const res = await saveProfile(values);
    if (applyResult(res, form.setError)) {
      form.reset(values);
      router.refresh();
    }
  }, onInvalid);

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <FormSection title="Identity" description="Shown in the homepage hero, the About page and search engine data.">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="display_name" label="Name" required autoComplete="name" />
            <TextField name="headline" label="Professional headline" hint="For example: Full-stack developer and performance marketer" />
          </div>
          <ImageField name="avatar_url" label="Headshot" entity="profile" hint="Shown on the About page. A portrait (4:5) photo works best." />
        </FormSection>

        <FormSection title="Bio">
          <TextareaField name="short_bio" label="Short bio" rows={3} hint="Two or three sentences. Used at the top of the About page and in search engine data." />
          <MarkdownField name="long_bio" label="Full story" rows={10} />
        </FormSection>

        <FormSection title="Availability and contact" description="Public details. Leave a field empty to hide it.">
          <SwitchField name="is_available" label="Show availability badge" description="Displays the availability text with a status dot in the hero and footer." />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="availability_label" label="Availability text" placeholder="Taking new projects" />
            <TextField name="location_label" label="Location" placeholder="Remote, worldwide" />
            <TextField name="email_public" label="Public email" type="email" />
            <TextField name="phone_public" label="Public phone" type="tel" />
          </div>
          <ImageField
            name="resume_url"
            label="Résumé"
            entity="profile"
            imagesOnly={false}
            hint="Optional. Upload a PDF or paste a link. Shows a download button on the About page."
          />
        </FormSection>

        <FormSection title="Skills" description="Shown as tags on the About page.">
          <LinesField name="skills" label="Skills" rows={6} />
        </FormSection>

        <FormSection title="Tools, grouped by discipline" description="Shown in the homepage Tools section and on the About page.">
          <Repeater
            items={groups.fields.map((f) => ({ key: f.id }))}
            itemLabel={(i) => groupValues?.[i]?.category || `Group ${i + 1}`}
            onAdd={() => groups.append({ category: "", items: "" })}
            onRemove={(i) => groups.remove(i)}
            onMove={(a, b) => groups.move(a, b)}
            addLabel="Add group"
            emptyText="No tool groups yet."
            max={12}
            renderItem={(i) => (
              <>
                <TextField name={`stack_groups.${i}.category`} label="Group name" required placeholder="Development" />
                <LinesField name={`stack_groups.${i}.items`} label="Tools" rows={4} />
              </>
            )}
          />
        </FormSection>

        <FormSection title="Experience" description="A timeline on the About page, in the order shown here. Put the most recent first.">
          <Repeater
            items={experience.fields.map((f) => ({ key: f.id }))}
            itemLabel={(i) => experienceValues?.[i]?.role || `Role ${i + 1}`}
            onAdd={() => experience.append({ role: "", organization: "", period: "", description: "" })}
            onRemove={(i) => experience.remove(i)}
            onMove={(a, b) => experience.move(a, b)}
            addLabel="Add role"
            emptyText="No experience added. The timeline is hidden until you add a role."
            max={30}
            renderItem={(i) => (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField name={`experience.${i}.role`} label="Role" required />
                  <TextField name={`experience.${i}.organization`} label="Organization" />
                  <TextField name={`experience.${i}.period`} label="Period" placeholder="2022 to now" />
                </div>
                <TextareaField name={`experience.${i}.description`} label="What you did" rows={3} />
              </>
            )}
          />
        </FormSection>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-ink/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <div className="flex items-center gap-3">
            <Button type="submit" loading={formState.isSubmitting}>
              Save changes
            </Button>
            {formState.isDirty ? (
              <span className="text-sm text-signal" role="status">
                Unsaved changes
              </span>
            ) : null}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
