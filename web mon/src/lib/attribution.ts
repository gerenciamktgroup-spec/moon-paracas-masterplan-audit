export type LeadAttribution = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  landingPath: string;
  referrerHost: string;
};

const STORAGE_KEY = "moon_first_touch";
const EMPTY_ATTRIBUTION: LeadAttribution = {
  source: "direct",
  medium: "none",
  campaign: "",
  content: "",
  term: "",
  landingPath: "/",
  referrerHost: "",
};

function cleanCampaignValue(value: string | null) {
  return (value || "")
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ _.-]/g, "")
    .trim()
    .slice(0, 100);
}

export function captureAttribution() {
  if (window.localStorage.getItem(STORAGE_KEY)) return;

  const query = new URLSearchParams(window.location.search);
  let referrerHost = "";
  try {
    referrerHost = document.referrer ? new URL(document.referrer).hostname.slice(0, 120) : "";
  } catch {
    referrerHost = "";
  }

  const attribution: LeadAttribution = {
    source: cleanCampaignValue(query.get("utm_source")) || (referrerHost || "direct"),
    medium: cleanCampaignValue(query.get("utm_medium")) || (referrerHost ? "referral" : "none"),
    campaign: cleanCampaignValue(query.get("utm_campaign")),
    content: cleanCampaignValue(query.get("utm_content")),
    term: cleanCampaignValue(query.get("utm_term")),
    landingPath: window.location.pathname.slice(0, 160),
    referrerHost,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
}

export function getAttribution(): LeadAttribution {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null") as Partial<LeadAttribution> | null;
    if (!value) return EMPTY_ATTRIBUTION;
    return {
      source: cleanCampaignValue(value.source || "") || "direct",
      medium: cleanCampaignValue(value.medium || "") || "none",
      campaign: cleanCampaignValue(value.campaign || ""),
      content: cleanCampaignValue(value.content || ""),
      term: cleanCampaignValue(value.term || ""),
      landingPath: String(value.landingPath || "/").slice(0, 160),
      referrerHost: String(value.referrerHost || "").slice(0, 120),
    };
  } catch {
    return EMPTY_ATTRIBUTION;
  }
}
