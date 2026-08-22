import type { LotTypology } from "../types/map";

export const COMMERCIAL_PRICE_VERSION = "2026.08-lanzamiento";
export const COMMERCIAL_PRICE_PERIOD_LABEL = "Precios de Lanzamiento";
export const PRIVATE_PARKING_PRICE_PEN = 7_500;
export const PRIVATE_PARKING_PRICE_USD = 2_000;

// PRECIO COMERCIAL DE LANZAMIENTO
export const LOT_PRICE_PER_M2_USD = 120; // $120 USD / m² dentro del condominio
export const MACRO_LOT_PRICE_PER_M2_USD = 45; // $45 USD / m² fuera del condominio (> 2,000 m²)
export const USD_TO_PEN_RATE = 3.75;
export const LOT_PRICE_PER_M2_PEN = LOT_PRICE_PER_M2_USD * USD_TO_PEN_RATE; // 450 PEN/m²

export const LOT_PRICE_PER_M2_MAP: Record<LotTypology, number> = {
  "tiny-house": LOT_PRICE_PER_M2_PEN,
  standard: LOT_PRICE_PER_M2_PEN,
  zen: LOT_PRICE_PER_M2_PEN,
  adjustment: LOT_PRICE_PER_M2_PEN,
  premium: LOT_PRICE_PER_M2_PEN,
  parking: PRIVATE_PARKING_PRICE_PEN,
  "parking-external": 0,
};

export function getLotPricePerM2(typology?: LotTypology): number {
  return LOT_PRICE_PER_M2_PEN;
}

export function getLotPriceUSD(areaM2: number): number {
  if (areaM2 >= 2000) {
    return Math.round(areaM2 * MACRO_LOT_PRICE_PER_M2_USD);
  }
  return Math.round(areaM2 * LOT_PRICE_PER_M2_USD);
}

export function getLotPricePEN(areaM2: number): number {
  if (areaM2 >= 2000) {
    return Math.round(areaM2 * MACRO_LOT_PRICE_PER_M2_USD * USD_TO_PEN_RATE);
  }
  return Math.round(areaM2 * LOT_PRICE_PER_M2_PEN);
}

// METRAJES OFICIALES
export const STANDARD_LOT_AREA_M2 = 120; // Lote individual 120 m² para casa domo
export const DOUBLE_LOT_AREA_M2 = 240;   // 2 lotes juntos (240 m²)
export const PREMIUM_LOT_AREA_M2 = DOUBLE_LOT_AREA_M2;
export const MACRO_LOT_AREA_M2 = 2000;   // Terreno campestre fuera del condominio

export const STANDARD_LOT_PRICE_USD = getLotPriceUSD(STANDARD_LOT_AREA_M2); // $14,400 USD
export const STANDARD_LOT_PRICE_PEN = getLotPricePEN(STANDARD_LOT_AREA_M2); // S/ 54,000 PEN

export const DOUBLE_LOT_PRICE_USD = getLotPriceUSD(DOUBLE_LOT_AREA_M2);     // $28,800 USD
export const DOUBLE_LOT_PRICE_PEN = getLotPricePEN(DOUBLE_LOT_AREA_M2);     // S/ 108,000 PEN
export const PREMIUM_LOT_PRICE_USD = DOUBLE_LOT_PRICE_USD;
export const PREMIUM_LOT_PRICE_PEN = DOUBLE_LOT_PRICE_PEN;

export const MACRO_LOT_PRICE_USD = getLotPriceUSD(MACRO_LOT_AREA_M2);       // $90,000 USD
export const MACRO_LOT_PRICE_PEN = getLotPricePEN(MACRO_LOT_AREA_M2);       // S/ 337,500 PEN

// FINANCIAMIENTO DIRECTO
export const DIRECT_FINANCE_DOWN_RATIO = 0.3; // 30% inicial sugerida
export const DIRECT_FINANCE_MAX_MONTHS = 36;  // Hasta 36 meses
export const STANDARD_LOT_DOWN_USD = Math.round(STANDARD_LOT_PRICE_USD * DIRECT_FINANCE_DOWN_RATIO); // $4,320 USD
export const STANDARD_LOT_DOWN_PEN = Math.round(STANDARD_LOT_PRICE_PEN * DIRECT_FINANCE_DOWN_RATIO); // S/ 16,200 PEN

export const STANDARD_LOT_MONTHLY_18_PEN = Math.round((STANDARD_LOT_PRICE_PEN * 0.5) / 18);
export const STANDARD_LOT_MONTHLY_36_PEN = getDirectFinanceMonthlyPEN(STANDARD_LOT_PRICE_PEN, 0.3, 36);
export const STANDARD_LOT_MONTHLY_36_USD = getDirectFinanceMonthlyUSD(STANDARD_LOT_PRICE_USD, 0.3, 36);

export function getDirectFinanceMonthlyUSD(priceUsd: number, downRatio = DIRECT_FINANCE_DOWN_RATIO, months = 36): number {
  return Math.round((priceUsd * (1 - downRatio)) / months);
}

export function getDirectFinanceMonthlyPEN(pricePen: number, downRatio = DIRECT_FINANCE_DOWN_RATIO, months = 36): number {
  return Math.round((pricePen * (1 - downRatio)) / months);
}

export function formatPenAmount(value: number, decimals = 0): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatUsdAmount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
