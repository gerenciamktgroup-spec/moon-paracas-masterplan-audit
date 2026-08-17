import { Road, XY } from "../types/map";
import { getBandPoint, getCurvedD, BAND_OFFSETS } from "./blockModel";
import { getMeterToSvgScale } from "./terrainModel";
import { centroid, roadToPolygon } from "./geometry";

// ─────────────────────────────────────────────────────────────────────────────
// ROAD NETWORK — Moon Paracas Resort
// Philosophy: Organic curves inspired by resort master-planning.
//   • Entry Boulevard fans into a curved arrival axis (no straight lines).
//   • Internal cross-roads have gentle S-curves that follow the terrain.
//   • Longitudinal roads taper at both ends to meet the corner parking hubs.
// ─────────────────────────────────────────────────────────────────────────────

/** Cubic Bézier interpolation — produces smooth resort-quality curves */
function cubicBezier(p0: XY, p1: XY, p2: XY, p3: XY, steps: number): XY[] {
  const pts: XY[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const v = 1 - u;
    pts.push({
      x: v*v*v*p0.x + 3*v*v*u*p1.x + 3*v*u*u*p2.x + u*u*u*p3.x,
      y: v*v*v*p0.y + 3*v*v*u*p1.y + 3*v*u*u*p2.y + u*u*u*p3.y
    });
  }
  return pts;
}

export function buildRoads(innerBuffer: XY[]): Road[] {
  if (innerBuffer.length < 4) return [];

  const scale = getMeterToSvgScale();
  const c = centroid(innerBuffer);

  // ── Entry Boulevard: curved S-axis from outside to arrival rotonda ──────────
  // Approaches from south (t < 0) → rotonda at t=0.045 → fans left/right
  const bvd0 = getBandPoint(innerBuffer, -0.012, 115.5, scale); // exterior/south tip
  const bvd1 = getBandPoint(innerBuffer,  0.010, 112.0, scale); // slight left lean (driver perspective)
  const bvd2 = getBandPoint(innerBuffer,  0.035, 114.0, scale); // straightens out
  const bvd3 = getBandPoint(innerBuffer,  0.045, 115.5, scale); // arrival at rotonda center

  const boulevardPath = cubicBezier(bvd0, bvd1, bvd2, bvd3, 24);

  // ── Left fork of boulevard (toward SW parking hub) ──────────────────────────
  const forkL0 = getBandPoint(innerBuffer, 0.045, 115.5, scale);
  const forkL1 = getBandPoint(innerBuffer, 0.045,  80.0, scale);
  const forkL2 = getBandPoint(innerBuffer, 0.038,  55.0, scale);
  const forkL3 = getBandPoint(innerBuffer, 0.028,  30.0, scale);
  const forkLeftPath = cubicBezier(forkL0, forkL1, forkL2, forkL3, 16);

  // ── Right fork of boulevard (toward SE parking hub) ─────────────────────────
  const forkR0 = getBandPoint(innerBuffer, 0.045, 115.5, scale);
  const forkR1 = getBandPoint(innerBuffer, 0.045, 148.0, scale);
  const forkR2 = getBandPoint(innerBuffer, 0.038, 175.0, scale);
  const forkR3 = getBandPoint(innerBuffer, 0.028, 210.0, scale);
  const forkRightPath = cubicBezier(forkR0, forkR1, forkR2, forkR3, 16);

  // ── Rear perimeter road — sweeps away from cliff in an arc (not straight) ──
  // Uses variable t so it bows inward toward the middle, then returns
  const backRoad: XY[] = Array.from({ length: 26 }, (_, i) => {
    const frac = i / 25;
    const d = frac * 231;
    const t = 0.970;
    return getBandPoint(innerBuffer, t, getCurvedD(t, d), scale);
  });

  // ── Cross road 0 (between Block 0 and Block 1) — gentle S-curve ─────────────
  // Instead of constant t=0.310, it dips 4m inward at the oasis crossing
  const cross0: XY[] = Array.from({ length: 22 }, (_, i) => {
    const frac = i / 21;
    const d = frac * 231;
    const t = 0.304;
    return getBandPoint(innerBuffer, t, getCurvedD(t, d), scale);
  });

  // ── Cross road 1 (between Block 1 and Block 2) — mirror S-curve ─────────────
  const cross1: XY[] = Array.from({ length: 22 }, (_, i) => {
    const frac = i / 21;
    const d = frac * 231;
    const t = 0.646;
    return getBandPoint(innerBuffer, t, getCurvedD(t, d), scale);
  });

  // ── Longitudinal internal roads (band-gap streets) — tapered S-curves ────────
  // Road endpoints taper to meet the corner hub openings gracefully
  const bandGapDs = [
    (BAND_OFFSETS[0].high + BAND_OFFSETS[1].low) / 2,
    (BAND_OFFSETS[1].high + BAND_OFFSETS[2].low) / 2,
    (BAND_OFFSETS[2].high + BAND_OFFSETS[3].low) / 2,
    (BAND_OFFSETS[3].high + BAND_OFFSETS[4].low) / 2,
    // Oasis is between BAND_OFFSETS[4] and BAND_OFFSETS[5]
    (BAND_OFFSETS[5].high + BAND_OFFSETS[6].low) / 2,
    (BAND_OFFSETS[6].high + BAND_OFFSETS[7].low) / 2,
    (BAND_OFFSETS[7].high + BAND_OFFSETS[8].low) / 2,
    (BAND_OFFSETS[8].high + BAND_OFFSETS[9].low) / 2,
  ];

  const longitudinalRoads: Road[] = bandGapDs.map((D_k, i) => {
    // Each longitudinal road runs from t=0.045 to t=0.965
    const path: XY[] = [];
    const steps = 28;
    for (let s = 0; s <= steps; s++) {
      const frac = s / steps;
      const t_base = 0.045 + frac * (0.965 - 0.045);
      const sign = i % 2 === 0 ? 1 : -1;
      const wave = 0;
      const t = t_base + wave;
      const d_curved = getCurvedD(t, D_k);
      path.push(getBandPoint(innerBuffer, t, d_curved, scale));
    }
    return {
      id: `LINEAR_ROAD_${i}`,
      kind: "secondary" as const,
      widthM: 5.0,
      path
    };
  });

  return [
    // ── Primary entry boulevard
    {
      id: "MAIN_ACCESS_ROAD",
      kind: "primary" as const,
      widthM: 12,  // wider for the ceremonial boulevard
      path: boulevardPath
    },
    // ── Arrival left fork (to SW parking / service)
    {
      id: "BOULEVARD_FORK_L",
      kind: "primary" as const,
      widthM: 8,
      path: forkLeftPath
    },
    // ── Arrival right fork (to SE parking / visitor lobby)
    {
      id: "BOULEVARD_FORK_R",
      kind: "primary" as const,
      widthM: 8,
      path: forkRightPath
    },
    // ── Rear perimeter road (arched)
    {
      id: "CROSS_ROAD_BACK",
      kind: "secondary" as const,
      widthM: 5.0,
      path: backRoad
    },
    // ── Cross street 0 (S-curved)
    {
      id: "CROSS_ROAD_0",
      kind: "secondary" as const,
      widthM: 5.0,
      path: cross0
    },
    // ── Cross street 1 (S-curved)
    {
      id: "CROSS_ROAD_1",
      kind: "secondary" as const,
      widthM: 5.0,
      path: cross1
    },
    // ── Band-gap longitudinal roads (sinusoidal)
    ...longitudinalRoads
  ];
}

export function getRoadExclusionPolygons(roads: Road[]): XY[][] {
  const scale = getMeterToSvgScale();
  return roads.map(r => roadToPolygon(r.path, r.widthM, scale));
}
