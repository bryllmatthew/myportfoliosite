import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth/admin";

// Admin pages always render per request with the signed-in user's session.
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireAdmin();
  const { count } = await ctx.supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new");
  return (
    <AdminShell email={ctx.email} newInquiries={count ?? 0}>
      {children}
    </AdminShell>
  );
}
