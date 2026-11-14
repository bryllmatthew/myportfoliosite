import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProfileEditor } from "@/components/admin/profile-editor";
import { requireAdmin } from "@/lib/auth/admin";
import { adminProfile } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const ctx = await requireAdmin();
  const profile = await adminProfile(ctx);
  return (
    <>
      <AdminPageHeader title="Profile" description="Your name, bio, availability and tools. This powers the About page and parts of the homepage." />
      <ProfileEditor key={profile?.updated_at ?? "new"} profile={profile} />
    </>
  );
}
