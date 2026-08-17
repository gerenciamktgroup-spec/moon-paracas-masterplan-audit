import type { LotTypology } from "../types/map";

export const COMMERCIAL_PRICE_VERSION = "2026.07";
export const COMMERCIAL_PRICE_PERIOD_LABEL = "julio 2026";
export const PRIVATE_PARKING_PRICE_PEN = 7_500;

export const LOT_PRICE_PER_M2_PEN: Partial<Record<LotTypology, number>> = {
  "tiny-house": 250,
  standard: 260,
  zen: 275,
  adjustment: 290,
  premium: 320,
};

export function getLotPricePerM2(typology: LotTypology): number {
  return LOT_PRICE_PER_M2_PEN[typology] ?? LOT_PRICE_PER_M2_PEN.standard!;
}
