import { Amenity, XY } from "../types/map";
import { getBandPoint, globalOasisBoundary, getMaxTForD, getCurvedD as getCurvedDBlock } from "./blockModel";
import { centroid, shoelaceArea } from "./geometry";
import { getMeterToSvgScale } from "./terrainModel";

// ─────────────────────────────────────────────────────────────────────────────
// COORDINATE SYSTEM REFERENCE
// ─────────────────────────────────────────────────────────────────────────────
// getBandPoint(innerBuffer, t, d, scale)
//   t  — 0..1 along the terrain "length" (0 = south / Block-0 side, 1 = north / Block-2 side)
//   d  — meters from the NW edge of the inner buffer toward the SE edge
//        d = 0   → NW/left boundary  (Band 1: M1–M3)
//        d = 98  → Oasis west edge   (Band 4: M10–M12 ends here)
//        d = 133 → Oasis east edge   (Band 5: M13–M15 starts here)
//        d = 231 → SE/right boundary (Band 8: M22–M24)
//
// Cross-roads divide the t-axis:
//   t ≈ 0.04–0.32 → Block 0 (southernmost lots)
//   t ≈ 0.33      → Cross Road 0
//   t ≈ 0.34–0.62 → Block 1 (middle lots)
//   t ≈ 0.63      → Cross Road 1
//   t ≈ 0.64–0.96 → Block 2 (northernmost lots)
//
// INGRESO / entry:  centroid-pixel approach (c.y + ~280-300) to place correctly
//                   at the south tip of the terrain where the access road starts.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a parallelogram-shaped polygon within the band coordinate system.
 * All oasis amenities must stay within d = 103..128 to guarantee a visible
 * gap from the lot polygons at d = 98 (Band 4 / M10-M12) and d = 133 (Band 5 / M13-M15).
 */
function createPerfectCirclePoly(
  innerBuffer: XY[],
  tCenter: number,
  dCenter: number,
  radiusMeters: number,
  scale: number
): XY[] {
  const center = getBandPoint(innerBuffer, tCenter, dCenter, scale);
  const poly: XY[] = [];
  const steps = 36;
  const radiusPx = radiusMeters * scale;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    poly.push({
      x: center.x + Math.cos(angle) * radiusPx,
      y: center.y + Math.sin(angle) * radiusPx
    });
  }
  return poly;
}

function createOvalPoly(
  innerBuffer: XY[],
  tCenter: number,
  dCenter: number,
  radiusT: number, // radius along t-axis (e.g. 0.04)
  radiusD: number, // radius along d-axis in meters (e.g. 6)
  scale: number
): XY[] {
  const poly: XY[] = [];
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const t = tCenter + Math.cos(angle) * radiusT;
    const d = dCenter + Math.sin(angle) * radiusD;
    poly.push(getBandPoint(innerBuffer, t, d, scale));
  }
  return poly;
}

function createAmenityPoly(
  innerBuffer: XY[],
  tStart: number,
  tEnd: number,
  dStart: number,
  dEnd: number,
  scale: number
): XY[] {
  const getCurvedD = (t: number, dStatic: number) => {
    const f = (dStatic - 111.6) / 30.8;
    const d_low = getCurvedDBlock(t, 111.6) + 1.0;
    const d_high = getCurvedDBlock(t, 142.4) - 1.0;
    return d_low + f * (d_high - d_low);
  };

  const poly: XY[] = [];
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = tStart + (tEnd - tStart) * (i / steps);
    poly.push(getBandPoint(innerBuffer, t, getCurvedD(t, dStart), scale));
  }
  for (let i = steps; i >= 0; i--) {
    const t = tStart + (tEnd - tStart) * (i / steps);
    poly.push(getBandPoint(innerBuffer, t, getCurvedD(t, dEnd), scale));
  }
  
  return poly;
}

// ── TRUE CARTESIAN GEOMETRIC FUNCTIONS ──
// These compute exact SVG coordinates to prevent parallelogram skewing
// and guarantee perfect 90-degree architectural walls.

function createOrganicPoly(innerBuffer: XY[], tCenter: number, dCenter: number, radiusT: number, radiusD: number, scale: number): XY[] {
  const poly: XY[] = [];
  const steps = 36;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    // Add sinusoidal noise for an organic "kidney bean" or natural lagoon shape
    const noiseT = 1 + 0.3 * Math.sin(angle * 2) + 0.15 * Math.cos(angle * 3);
    const noiseD = 1 + 0.2 * Math.cos(angle * 2) + 0.1 * Math.sin(angle * 4);
    
    const t = tCenter + Math.cos(angle) * radiusT * noiseT;
    const d = dCenter + Math.sin(angle) * radiusD * noiseD;
    poly.push(getBandPoint(innerBuffer, t, d, scale));
  }
  return poly;
}

function createRectPoly(innerBuffer: XY[], tCenter: number, dCenter: number, widthT: number, heightD: number, scale: number): XY[] {
  const poly: XY[] = [];
  const ht = widthT / 2;
  const hd = heightD / 2;
  // A rounded-corner rectangle (squircle-like) for architectural buildings
  const steps = 8; // per quadrant
  for (let q = 0; q < 4; q++) {
    const cornerT = q === 0 || q === 3 ? ht : -ht;
    const cornerD = q === 0 || q === 1 ? hd : -hd;
    for (let i = 0; i <= steps; i++) {
      const angle = (q * Math.PI / 2) + (i / steps) * (Math.PI / 2);
      // Soft rounded corners
      const t = tCenter + cornerT * 0.7 + Math.cos(angle) * (ht * 0.3);
      const d = dCenter + cornerD * 0.7 + Math.sin(angle) * (hd * 0.3);
      poly.push(getBandPoint(innerBuffer, t, d, scale));
    }
  }
  return poly;
}
// and guarantee perfect 90-degree architectural walls.

function createTrueArchitecturalPoly(
  innerBuffer: XY[],
  tCenter: number,
  dCenter: number,
  widthM: number,
  depthM: number,
  scale: number,
  angleOffsetRad: number = 0
): XY[] {
  const center = getBandPoint(innerBuffer, tCenter, dCenter, scale);
  // Find tangent along the d-axis (street direction)
  const nextPoint = getBandPoint(innerBuffer, tCenter, dCenter + 1, scale);
  const baseAngle = Math.atan2(nextPoint.y - center.y, nextPoint.x - center.x);
  const finalAngle = baseAngle + angleOffsetRad;

  const wPx = (widthM * scale) / 2;
  const dPx = (depthM * scale) / 2;

  const corners = [
    { x: -wPx, y: -dPx },
    { x:  wPx, y: -dPx },
    { x:  wPx, y:  dPx },
    { x: -wPx, y:  dPx },
  ];

  const cosA = Math.cos(finalAngle);
  const sinA = Math.sin(finalAngle);

  return corners.map(c => ({
    x: center.x + c.x * cosA - c.y * sinA,
    y: center.y + c.x * sinA + c.y * cosA
  }));
}

function createTrueLShapedPoly(
  innerBuffer: XY[],
  tCenter: number,
  dCenter: number,
  scale: number,
  angleOffsetRad: number = 0
): XY[] {
  const center = getBandPoint(innerBuffer, tCenter, dCenter, scale);
  const nextPoint = getBandPoint(innerBuffer, tCenter, dCenter + 1, scale);
  const baseAngle = Math.atan2(nextPoint.y - center.y, nextPoint.x - center.x);
  const finalAngle = baseAngle + angleOffsetRad;

  // L-shape dimensions in meters (scaled down to fit 20x20m area max)
  const pointsM = [
    { x: -7.5, y: -10 }, { x:  7.5, y: -10 },
    { x:  7.5, y:   3 }, { x:  15,  y:   3 },
    { x:  15,  y:  10 }, { x: -7.5, y:  10 }
  ];

  const cosA = Math.cos(finalAngle);
  const sinA = Math.sin(finalAngle);

  return pointsM.map(p => {
    const px = p.x * scale;
    const py = p.y * scale;
    return {
      x: center.x + px * cosA - py * sinA,
      y: center.y + px * sinA + py * cosA
    };
  });
}

function createArcPoly(innerBuffer: XY[], tCenter: number, dCenter: number, radiusT: number, radiusD: number, scale: number): XY[] {
  const poly: XY[] = [];
  const steps = 20;
  // A semi-circle / amphitheater arc facing the center
  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI + (i / steps) * Math.PI; // Bottom half
    const t = tCenter + Math.cos(angle) * radiusT;
    const d = dCenter + Math.sin(angle) * radiusD;
    poly.push(getBandPoint(innerBuffer, t, d, scale));
  }
  // Inner arc for thickness
  for (let i = steps; i >= 0; i--) {
    const angle = Math.PI + (i / steps) * Math.PI;
    const t = tCenter + Math.cos(angle) * (radiusT * 0.6);
    const d = dCenter + Math.sin(angle) * (radiusD * 0.6) + 2; // Offset inner curve
    poly.push(getBandPoint(innerBuffer, t, d, scale));
  }
  return poly;
}

function createFunnelPoly(innerBuffer: XY[], tStart: number, dStart: number, dEnd: number, scale: number): XY[] {
  const poly: XY[] = [];
  // Funnel opening wide at t=0 and narrowing down
  poly.push(getBandPoint(innerBuffer, 0.015, dStart, scale)); // Left outer
  poly.push(getBandPoint(innerBuffer, tStart + 0.015, dStart + 8, scale)); // Left inner
  
  // Arching top cap
  for(let i=0; i<=10; i++) {
     const p = i/10;
     const d = (dStart + 8) + p * ((dEnd - 8) - (dStart + 8));
     const tCurve = tStart + 0.015 + Math.sin(p * Math.PI) * 0.01;
     poly.push(getBandPoint(innerBuffer, tCurve, d, scale));
  }
  
  poly.push(getBandPoint(innerBuffer, tStart + 0.015, dEnd - 8, scale)); // Right inner
  poly.push(getBandPoint(innerBuffer, 0.015, dEnd, scale)); // Right outer
  return poly;
}

function createMegaParkingLeft(innerBuffer: XY[], scale: number): XY[] {
  const poly: XY[] = [];
  poly.push(getBandPoint(innerBuffer, 0.02, 0, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(0) + 0.015, 0, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(20) + 0.015, 20, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(26) + 0.015, 26, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(46) + 0.015, 46, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(52) + 0.015, 52, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(72) + 0.015, 72, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(78) + 0.015, 78, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(98) + 0.015, 98, scale)); 
  poly.push(getBandPoint(innerBuffer, 0.02, 98, scale)); 
  return poly;
}

function createMegaParkingRight(innerBuffer: XY[], scale: number): XY[] {
  const poly: XY[] = [];
  poly.push(getBandPoint(innerBuffer, 0.02, 133, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(133) + 0.015, 133, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(153) + 0.015, 153, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(159) + 0.015, 159, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(179) + 0.015, 179, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(185) + 0.015, 185, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(205) + 0.015, 205, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(211) + 0.015, 211, scale)); 
  poly.push(getBandPoint(innerBuffer, getMaxTForD(231) + 0.015, 231, scale)); 
  poly.push(getBandPoint(innerBuffer, 0.02, 231, scale)); 
  return poly;
}

/**
 * Build all amenity polygons.
 * IMPORTANT: buildBlocks() MUST be called before this function so that
 * globalOasisBoundary is populated for A_SAND.
 */
export function buildAmenities(innerBuffer: XY[]): Amenity[] {
  const c     = centroid(innerBuffer); // SVG pixel centroid — used for south-tip elements
  const scale = getMeterToSvgScale();

  // oasisPoly is set by buildBlocks(); if empty the sand-plaza is just hidden
  const oasisPoly =
    globalOasisBoundary && globalOasisBoundary.length > 0 ? globalOasisBoundary : [];

  // ─── OASIS amenities (all confined to d = 110..138 to avoid touching lots) ───
  const amenitiesList: Amenity[] = [
    // ── ZONA 1: Hub Social y Acuático (Centro-Sur, Bulge 1 around t=0.20-0.27) ──
    {
      id: "A_CLUB", kind: "clubhouse",
      // L-shape scaled down to max 20x20m to fit perfectly at t=0.185
      polygon: createTrueLShapedPoly(innerBuffer, 0.185, 127.0, scale, Math.PI / 2)
    },
    {
      id: "A_WATER1", kind: "pool",
      // Enlarge pool radiusD to 11.0m to fit the widened Oasis beautifully at t=0.240
      polygon: createOrganicPoly(innerBuffer, 0.240, 127.0, 0.028, 11.0, scale)
    },
    {
      id: "A_DECK", kind: "deck",
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.36, 127.0, 15, 12, scale) 
    },
    {
      id: "A_YOGA", kind: "yoga-plaza",
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.42, 127.0, 12, 12, scale) 
    },

    // ── ZONA 2: Hub Botánico y Recreativo (Centro, t=0.45-0.75) ──
    {
      id: "A_MIRROR", kind: "water-mirror", // Espejo de Agua central
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.53, 127.0, 18, 22, scale)
    },
    {
      id: "A_PALM", kind: "palm-forest",
      // Enlarged to radiusD=10
      polygon: createOrganicPoly(innerBuffer, 0.70, 127.0, 0.03, 10, scale)
    },
    {
      id: "A_XERO", kind: "xerophytic-garden",
      // Enlarged to radiusD=10
      polygon: createOrganicPoly(innerBuffer, 0.78, 127.0, 0.03, 10, scale)
    },

    // ── ZONA 3: Remate y Utilities (Norte, Bulge 2 around t=0.85) ──
    {
      id: "A_MOON", kind: "moon-deck",
      polygon: createRectPoly(innerBuffer, 0.85, 127.0, 0.02, 12, scale)
    },
    // Cisterna y Bombas (Utility 1)
    {
      id: "A_UTIL1", kind: "deck", 
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.885, 121.0, 8, 12, scale)
    },
    // PTAR (Utility 2)
    {
      id: "A_UTIL2", kind: "deck", 
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.885, 133.0, 10, 15, scale)
    },

    // ── EXTERNAL AMENITIES ──
    // ── Paradero Exterior (Fuera del cerco) ───────────────────────────────
    {
      id: "A_BUS_STOP", kind: "bus-bay",
      polygon: createTrueArchitecturalPoly(innerBuffer, -0.005, 115.5, 20, 4, scale)
    },
    // ── Welcome Center (Oficina Ventas - Left Side) — Shifted t to 0.008 to be outside block
    {
      id: "A_WELCOME", kind: "welcome-center",
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.008, 70, 18, 10, scale)
    },
    // ── Helipad (Moved to a safe, designated parking/utility zone at the east tip) — Shifted d to 239 and size to 12x12
    {
      id: "A_HELI", kind: "helipad",
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.022, 239, 12, 12, scale) 
    },
    // ── Gatehouse & Security (Ingreso/Salida) ─────────────────────────────
    // Left Cabin (Ingreso)
    {
      id: "A_GATE_L", kind: "gatehouse",
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.015, 110, 4, 4, scale)
    },
    // Right Cabin (Salida)
    {
      id: "A_GATE_R", kind: "gatehouse",
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.015, 121, 4, 4, scale)
    },
    // Central Median Island (Xerophytic garden separator)
    {
      id: "A_GATE_MEDIAN", kind: "xerophytic-garden",
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.015, 115.5, 2, 8, scale)
    },
    // Modern Architectural Roof covering both cabins and lanes
    {
      id: "A_GATE_ROOF", kind: "gatehouse-roof",
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.015, 115.5, 16, 4, scale)
    },
    // Control Bar
    {
      id: "A_GATE_BAR", kind: "parking-driveway", // Thin line styling
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.015, 115.5, 7, 0.5, scale)
    },
    // ── Visitor Lobby (Right Side) ────────────────────────────────────────
    {
      id: "A_LOBBY", kind: "visitor-lobby",
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.015, 148, 12, 8, scale)
    },
    // ── Loading & Service Bay (Right Side) — Shifted t to 0.008 to be outside block
    {
      id: "A_BAY", kind: "bus-bay",
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.008, 165, 20, 6, scale)
    },
    // ── Arrival Rotonda — organic circle at the entry plaza ─────────────────
    // Placed at t=0.038, d=115.5. Redesigned to a premium 22x14m rectangular plaza.
    {
      id: "A_ROTONDA", kind: "entry-plaza",
      polygon: createTrueArchitecturalPoly(innerBuffer, 0.038, 115.5, 22, 14, scale)
    },
    // ── Entry Promenade — palm-lined spine from rotonda to oasis ────────────
    // Shifted left promenade to d=113.5 and right to d=126.5 to prevent curve overlaps
    {
      id: "A_PROMENADE_L", kind: "xerophytic-garden",
      polygon: createAmenityPoly(innerBuffer, 0.080, 0.140, 119.5, 122.5, scale)
    },
    {
      id: "A_PROMENADE_R", kind: "xerophytic-garden",
      polygon: createAmenityPoly(innerBuffer, 0.080, 0.140, 131.5, 134.5, scale)
    }
  ];

  // Assign calculated areas
  amenitiesList.forEach(a => {
    // shoelaceArea returns SVG pixels squared. Convert back to meters squared.
    a.areaM2 = Math.round(shoelaceArea(a.polygon) / (scale * scale));
  });

  return amenitiesList;
}
