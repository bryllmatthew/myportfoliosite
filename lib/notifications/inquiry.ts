import "server-only";

export interface InquiryNotification {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  budget_range: string | null;
  message: string;
  source_page: string | null;
  created_at: string;
}

/**
 * Called after an inquiry is stored. The inquiry is already safe in Supabase,
 * so a notification failure is logged and never shown to the visitor.
 *
 * Built-in channel: when INQUIRY_WEBHOOK_URL is set, the inquiry is POSTed as
 * JSON (works with Zapier, Make, n8n, GoHighLevel inbound webhooks, Slack
 * workflows...).
 *
 * To add transactional email, add a channel here, for example with Resend:
 *   await resend.emails.send({ from, to, subject: `New inquiry from ${n.name}`, text: n.message })
 */
export async function notifyNewInquiry(notification: InquiryNotification): Promise<void> {
  const webhook = process.env.INQUIRY_WEBHOOK_URL;
  if (!webhook) return;

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "inquiry.created", inquiry: notification }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) console.error(`[notify] inquiry webhook responded ${res.status}`);
  } catch (error) {
    console.error(`[notify] inquiry webhook failed: ${(error as Error).name}`);
  }
}
