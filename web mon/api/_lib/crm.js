import { createHmac } from "node:crypto";

export async function deliverLeadToCrm(leadId, lead) {
  const url = process.env.CRM_WEBHOOK_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!url || !secret) return "not_configured";

  const payload = JSON.stringify({ event: "lead.created", leadId, lead });
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Moon-Signature": signature,
        "X-Moon-Event": "lead.created",
      },
      body: payload,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`CRM respondió ${response.status}.`);
    return "delivered";
  } finally {
    clearTimeout(timeout);
  }
}
