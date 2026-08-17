import { useEffect, useState } from "react";
import { trackEvent } from "../lib/analytics";

const STORAGE_KEY = "moon_lot_shortlist";
const MAX_SHORTLIST = 5;
const LOT_ID_PATTERN = /^(?:LOTE-\d{1,3}|D-\d{1,3})$/;

function parseIds(value: string | null) {
  if (!value) return [];
  return Array.from(new Set(value.split(",").map((item) => item.trim()).filter((item) => LOT_ID_PATTERN.test(item)))).slice(0, MAX_SHORTLIST);
}

function initialIds() {
  const shared = parseIds(new URLSearchParams(window.location.search).get("favoritos"));
  if (shared.length) return shared;
  try {
    return parseIds(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]").join(","));
  } catch {
    return [];
  }
}

export function useLotShortlist() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialIds);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    const url = new URL(window.location.href);
    if (favoriteIds.length) url.searchParams.set("favoritos", favoriteIds.join(","));
    else url.searchParams.delete("favoritos");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [favoriteIds]);

  const toggleFavorite = (lotId: string) => {
    setFavoriteIds((current) => {
      const exists = current.includes(lotId);
      const next = exists ? current.filter((id) => id !== lotId) : [...current, lotId].slice(-MAX_SHORTLIST);
      trackEvent(exists ? "shortlist_remove" : "shortlist_add", { lotId, total: next.length });
      return next;
    });
  };

  const share = async () => {
    const url = new URL(window.location.href);
    if (favoriteIds.length) url.searchParams.set("favoritos", favoriteIds.join(","));
    url.hash = "";

    if (navigator.share) {
      await navigator.share({ title: "Mis lotes Moon Paracas", text: "Estas son las alternativas que quiero comparar.", url: url.toString() });
      trackEvent("shortlist_share", { method: "native", total: favoriteIds.length });
      return "shared" as const;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url.toString());
      trackEvent("shortlist_share", { method: "clipboard", total: favoriteIds.length });
      return "copied" as const;
    }
    return "unavailable" as const;
  };

  return { favoriteIds, toggleFavorite, share, maxItems: MAX_SHORTLIST };
}
