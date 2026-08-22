import { track } from "@vercel/analytics";

export type AnalyticsEvent =
  | "select_intent"
  | "select_typology"
  | "compare_typologies"
  | "view_documents"
  | "view_lot"
  | "shortlist_add"
  | "shortlist_remove"
  | "shortlist_share"
  | "start_reservation"
  | "whatsapp_click"
  | "submit_lead"
  | "lead_submitted"
  | "download_dossier"
  | "schedule_visit"
  | "payment_result";

type AnalyticsProperties = Record<string, string | number | boolean | null>;

export const METRICS_PREFERENCE_KEY = "moon_metrics_preference";

export function metricsAllowed() {
  return window.localStorage.getItem(METRICS_PREFERENCE_KEY) === "accepted";
}

export function trackEvent(name: AnalyticsEvent, properties: AnalyticsProperties = {}) {
  if (!metricsAllowed()) return;

  const safeProperties = Object.fromEntries(
    Object.entries(properties)
      .filter(([, value]) => value !== null)
      .slice(0, 12)
      .map(([key, value]) => [key.slice(0, 40), typeof value === "string" ? value.slice(0, 120) : value]),
  );

  try {
    track(name, safeProperties);
    if (import.meta.env.DEV) {
      window.dispatchEvent(new CustomEvent("moon:analytics", { detail: { name, properties: safeProperties } }));
    }
  } catch {
    // Metrics must never interrupt a commercial or payment flow.
  }
}
