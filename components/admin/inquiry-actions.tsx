"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/misc";
import { deleteInquiry, setInquiryStatus } from "@/lib/actions/admin/site";
import type { InquiryStatus } from "@/types/content";

const LABELS: Record<InquiryStatus, string> = { new: "New", read: "Read", replied: "Replied", archived: "Archived" };

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  const tone = status === "new" ? "signal" : status === "replied" ? "success" : status === "archived" ? "muted" : "neutral";
  return <Badge tone={tone}>{LABELS[status]}</Badge>;
}

export function InquiryActions({ id, email, status: initial }: { id: string; email: string; status: InquiryStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState<InquiryStatus>(initial);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const change = async (next: InquiryStatus) => {
    const previous = status;
    setStatus(next);
    setSaving(true);
    const res = await setInquiryStatus(id, next);
    setSaving(false);
    if (res.ok) {
      toast.success(res.message ?? "Status updated");
      router.refresh();
    } else {
      setStatus(previous);
      toast.error(res.error);
    }
  };

  const remove = async () => {
    setDeleting(true);
    const res = await deleteInquiry(id);
    setDeleting(false);
    if (res.ok) {
      toast.success("Inquiry deleted");
      router.push("/admin/contact");
      router.refresh();
    } else {
      setConfirmDelete(false);
      toast.error(res.error);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="inquiry-status" className="text-sm font-medium">
          Status
        </label>
        <Select id="inquiry-status" value={status} disabled={saving} onChange={(e) => void change(e.target.value as InquiryStatus)}>
          {(Object.keys(LABELS) as InquiryStatus[]).map((s) => (
            <option key={s} value={s}>
              {LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <a
          href={`mailto:${email}?subject=${encodeURIComponent("Re: your inquiry")}`}
          onClick={() => {
            if (status === "new" || status === "read") void change("replied");
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-signal px-5 text-[0.9375rem] font-medium text-signal-ink hover:bg-signal-strong"
        >
          <Mail className="size-4" aria-hidden />
          Reply by email
        </a>
        <p className="text-meta text-subtle">Opens your email app and marks the inquiry as replied.</p>
        {status !== "archived" ? (
          <Button variant="secondary" onClick={() => void change("archived")} disabled={saving}>
            <Archive aria-hidden />
            Archive
          </Button>
        ) : null}
        <Button variant="ghost" className="text-danger hover:text-danger" onClick={() => setConfirmDelete(true)}>
          <Trash2 aria-hidden />
          Delete inquiry
        </Button>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this inquiry?"
        description="The message is permanently removed. Archive it instead to keep a record."
        confirmLabel="Delete inquiry"
        loading={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
