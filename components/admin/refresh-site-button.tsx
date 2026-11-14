"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { refreshPublicSite } from "@/lib/actions/admin/site";

/**
 * Saving in the admin already refreshes the site. This is for changes made
 * elsewhere, such as SQL run in the Supabase dashboard.
 */
export function RefreshSiteButton() {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="secondary"
      size="sm"
      loading={busy}
      title="Use after editing data directly in Supabase. Saving in the admin already does this."
      onClick={async () => {
        setBusy(true);
        const r = await refreshPublicSite();
        setBusy(false);
        if (r.ok) toast.success(r.message ?? "Live site refreshed");
        else toast.error(r.error);
      }}
    >
      {!busy ? <RefreshCw aria-hidden /> : null}
      Refresh the live site
    </Button>
  );
}
