import { BlockSpec } from "../types/map";

export const BUSINESS_RULES = {
  perimeterBufferM: 6,
  primaryRoadWidthM: 10, // Updated to 10m total (6m calzada + 4m bermas)
  secondaryRoadWidthM: 10, // Updated to 10m total
  pedestrianRoadWidthM: 4,
  totalLots: 312, // Updated to 312 lots (260 + 52 extra from double-row M7-M9, M22-M24)
  averageLotApproxM2: 249,
  legalDisclaimer:
    "Área de uso exclusivo aproximada dentro de un proyecto privado de desarrollo progresivo."
};

const CONDITIONAL_METADATA = {
  mainAccessSide: "Acceso principal rústico (Provisional - Pendiente de validación final)",
  runoffDirection: "Sentido de escorrentía pluvial preliminar (Sujeto a ingeniería hidráulica)",
  utilitySide: "Puntos de conexión eléctrica/agua provisionales (Sujeto a factibilidad)",
  internalCorridorsValidation: "El diseño de corredores de 10m de ancho requiere conformidad definitiva de Defensa Civil y Municipalidad de Paracas"
};

// Target counts correspond to the optimized block configuration for 10 bands.
export const BLOCK_SPECS: BlockSpec[] = [
  // Band 1 — Premium (M1-M3)
  { id: "M1",  role: "middle-ring",   targetLotCount:  7, targetNetAreaM2: 1880, lotMix: { standard: 0, premium:  7, adjustment: 0 } },
  { id: "M2",  role: "middle-ring",   targetLotCount: 10, targetNetAreaM2: 2115, lotMix: { standard: 0, premium: 10, adjustment: 0 } },
  { id: "M3",  role: "middle-ring",   targetLotCount:  9, targetNetAreaM2: 2115, lotMix: { standard: 0, premium:  9, adjustment: 0 } },
  // Band 2 — Premium (M4-M6)
  { id: "M4",  role: "middle-ring",   targetLotCount:  7, targetNetAreaM2: 1880, lotMix: { standard: 0, premium:  7, adjustment: 0 } },
  { id: "M5",  role: "middle-ring",   targetLotCount: 10, targetNetAreaM2: 2360, lotMix: { standard: 0, premium: 10, adjustment: 0 } },
  { id: "M6",  role: "middle-ring",   targetLotCount:  9, targetNetAreaM2: 2115, lotMix: { standard: 0, premium:  9, adjustment: 0 } },
  // Band 3 — Premium / Tiny House (M7-M9) (Doubled to 14, 20, 18)
  { id: "M7",  role: "middle-ring",   targetLotCount: 14, targetNetAreaM2: 2360, lotMix: { standard: 0, premium: 0, adjustment: 0, "tiny-house": 14 } },
  { id: "M8",  role: "middle-ring",   targetLotCount: 20, targetNetAreaM2: 2360, lotMix: { standard: 0, premium: 0, adjustment: 0, "tiny-house": 20 } },
  { id: "M9",  role: "middle-ring",   targetLotCount: 18, targetNetAreaM2: 2830, lotMix: { standard: 0, premium: 0, adjustment: 0, "tiny-house": 18 } },
  // Band 4 — Oasis North Border (M10-M12)
  { id: "M10", role: "inner-oasis",   targetLotCount:  7, targetNetAreaM2: 2360, lotMix: { standard:  0, premium: 0, adjustment: 0, "tiny-house":  7 } },
  { id: "M11", role: "inner-oasis",   targetLotCount: 10, targetNetAreaM2: 2360, lotMix: { standard:  0, premium: 0, adjustment: 0, "tiny-house": 10 } },
  { id: "M12", role: "inner-oasis",   targetLotCount:  9, targetNetAreaM2: 2830, lotMix: { standard:  0, premium: 0, adjustment: 0, "tiny-house":  9 } },
  // Band 5 — Oasis South Border (M13-M15)
  { id: "M13", role: "inner-oasis",   targetLotCount:  7, targetNetAreaM2: 2360, lotMix: { standard:  0, premium: 0, adjustment: 0, "tiny-house":  7 } },
  { id: "M14", role: "inner-oasis",   targetLotCount: 10, targetNetAreaM2: 2360, lotMix: { standard:  0, premium: 0, adjustment: 0, "tiny-house": 10 } },
  { id: "M15", role: "inner-oasis",   targetLotCount:  9, targetNetAreaM2: 2830, lotMix: { standard:  0, premium: 0, adjustment: 0, "tiny-house":  9 } },
  // Band 6 — Oasis South Outer Border (M16-M18)
  { id: "M16", role: "inner-oasis",   targetLotCount:  7, targetNetAreaM2: 2360, lotMix: { standard:  0, premium: 0, adjustment: 0, "tiny-house":  7 } },
  { id: "M17", role: "inner-oasis",   targetLotCount: 10, targetNetAreaM2: 2360, lotMix: { standard:  0, premium: 0, adjustment: 0, "tiny-house": 10 } },
  { id: "M18", role: "inner-oasis",   targetLotCount:  9, targetNetAreaM2: 2830, lotMix: { standard:  0, premium: 0, adjustment: 0, "tiny-house":  9 } },
  // Band 7 — Standard / Zen (M19-M21)
  { id: "M19", role: "outer-ring",    targetLotCount:  7, targetNetAreaM2: 2360, lotMix: { standard:  7, premium: 0, adjustment: 0 } },
  { id: "M20", role: "outer-ring",    targetLotCount: 10, targetNetAreaM2: 2360, lotMix: { standard:  0, premium: 0, adjustment: 0, zen: 10 } },
  { id: "M21", role: "outer-ring",    targetLotCount:  9, targetNetAreaM2: 2830, lotMix: { standard:  9, premium: 0, adjustment: 0 } },
  // Band 8 — Standard / Zen / Tiny House (M22-M24) (Doubled to 14, 20, 18)
  { id: "M22", role: "outer-ring",    targetLotCount: 14, targetNetAreaM2: 2360, lotMix: { standard: 0, premium: 0, adjustment: 0, "tiny-house": 14 } },
  { id: "M23", role: "outer-ring",    targetLotCount: 20, targetNetAreaM2: 2360, lotMix: { standard: 0, premium: 0, adjustment: 0, "tiny-house": 20 } },
  { id: "M24", role: "outer-ring",    targetLotCount: 18, targetNetAreaM2: 2830, lotMix: { standard: 0, premium: 0, adjustment: 0, "tiny-house": 18 } },
  // Band 9 — Standard (M25-M27)
  { id: "M25", role: "outer-ring",    targetLotCount:  7, targetNetAreaM2: 2360, lotMix: { standard:  7, premium: 0, adjustment: 0 } },
  { id: "M26", role: "outer-ring",    targetLotCount: 10, targetNetAreaM2: 2360, lotMix: { standard: 10, premium: 0, adjustment: 0 } },
  { id: "M27", role: "outer-ring",    targetLotCount:  9, targetNetAreaM2: 2830, lotMix: { standard:  9, premium: 0, adjustment: 0 } },
  // Band 10 — Adjustment / Reserve (M28-M30)
  { id: "M28", role: "north-reserve", targetLotCount:  7, targetNetAreaM2: 1880, lotMix: { standard:  0, premium: 0, adjustment:  7 } },
  { id: "M29", role: "north-reserve", targetLotCount: 10, targetNetAreaM2: 2360, lotMix: { standard:  0, premium: 0, adjustment: 10 } },
  { id: "M30", role: "north-reserve", targetLotCount:  9, targetNetAreaM2: 2115, lotMix: { standard:  0, premium: 0, adjustment:  9 } }
];
