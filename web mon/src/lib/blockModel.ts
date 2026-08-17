import { BlockPolygon, XY } from "../types/map";
import { getMeterToSvgScale } from "./terrainModel";

export let globalOasisBoundary: XY[] = [];

// Offsets in meters from the Northwest boundary of innerBuffer (widen Oasis, narrow Bands 2 and 9)
export const BAND_OFFSETS = [
  { low: 0.0, high: 17.4 },                  // Band 1: M1, M2, M3
  { low: 24.9, high: 36.9 },                 // Band 2: M4, M5, M6 (reduced to 12.0m depth)
  { low: 44.4, high: 61.8 },                 // Band 3: M7, M8, M9
  { low: 69.3, high: 86.7 },                 // Band 4: M10, M11, M12
  { low: 94.2, high: 111.6 },                // Band 5: M13, M14, M15
  // Oasis: 111.6 to 142.4 (30.8m wide)
  { low: 142.4, high: 159.8 },               // Band 6: M16, M17, M18
  { low: 167.3, high: 184.7 },               // Band 7: M19, M20, M21
  { low: 192.2, high: 209.6 },               // Band 8: M22, M23, M24
  { low: 217.1, high: 229.1 },               // Band 9: M25, M26, M27 (reduced to 12.0m depth)
  { low: 236.6, high: 254.0 }                // Band 10: M28, M29, M30
];

export const BAND_BLOCKS = [
  ["M1", "M2", "M3"],
  ["M4", "M5", "M6"],
  ["M7", "M8", "M9"],
  ["M10", "M11", "M12"],
  ["M13", "M14", "M15"],
  ["M16", "M17", "M18"],
  ["M19", "M20", "M21"],
  ["M22", "M23", "M24"],
  ["M25", "M26", "M27"],
  ["M28", "M29", "M30"]
];

export let SCALLOP_AMPLITUDE = 2.5;
export function setScallopAmplitude(val: number) {
  SCALLOP_AMPLITUDE = val;
}

export function getCurvedD(t: number, d: number): number {
  const scallop = SCALLOP_AMPLITUDE * Math.sin(3 * Math.PI * t);
  const oasisStart = BAND_OFFSETS[3]?.high || 86.7;
  if (d <= oasisStart) {
    return d - Math.max(0, scallop) * (d / oasisStart);
  } else {
    const distFromOasis = 254 - d;
    return d + Math.max(0, scallop) * (distFromOasis / (254 - oasisStart));
  }
}

export function getMaxTForD(d: number): number {
  // Pure diagonal from edges to the center entry
  // Center is at d = 121.0
  // Left side: d = 0 to 98
  if (d <= 98) {
    return 0.08 - (0.08 - 0.035) * (d / 98);
  }
  // Center access gap: d = 98 to 136
  if (d > 98 && d < 136) {
    return 0.035;
  }
  // Right side: d = 136 to 254
  if (d >= 136) {
    return 0.035 + (0.08 - 0.035) * ((d - 136) / (254 - 136));
  }
  
  return 0;
}

export function getBandPoint(innerBuffer: XY[], t: number, dMeters: number, scale: number): XY {
  if (innerBuffer.length < 4) {
    return { x: 0, y: 0 };
  }
  // NW boundary is B' -> C' (from t=0 to t=1)
  const B = innerBuffer[1];
  const C = innerBuffer[2];
  const pNW = {
    x: B.x + t * (C.x - B.x),
    y: B.y + t * (C.y - B.y)
  };
  
  // SE boundary is A' -> D' (from t=0 to t=1)
  const A = innerBuffer[0];
  const D = innerBuffer[3];
  const pSE = {
    x: A.x + t * (D.x - A.x),
    y: A.y + t * (D.y - A.y)
  };
  
  // Vector from NW to SE
  const dx = pSE.x - pNW.x;
  const dy = pSE.y - pNW.y;
  const distPixels = Math.sqrt(dx * dx + dy * dy);
  const distMeters = distPixels / scale;
  
  // Map dMeters (0..254) proportionally to the dynamic width distMeters
  const f = Math.max(0, Math.min(1, dMeters / 254));
  const shiftMeters = f * distMeters;
  
  // Unit vector
  const ux = dx / (distPixels || 1);
  const uy = dy / (distPixels || 1);
  
  return {
    x: pNW.x + ux * shiftMeters * scale,
    y: pNW.y + uy * shiftMeters * scale
  };
}
export let BLOCK_0_START = 0.065;
export let BLOCK_0_END = 0.297;
export let BLOCK_1_START = 0.311;
export let BLOCK_1_END = 0.639;
export let BLOCK_2_START = 0.653;
export let BLOCK_2_END = 0.960;

export let BLOCK_0_START_CORNER = 0.065;
export let BLOCK_0_END_CORNER = 0.297;
export let BLOCK_1_START_CORNER = 0.311;
export let BLOCK_1_END_CORNER = 0.639;
export let BLOCK_2_START_CORNER = 0.653;
export let BLOCK_2_END_CORNER = 0.960;

export let BLOCK_0_START_CORNER_SE = 0.065;
export let BLOCK_0_END_CORNER_SE = 0.297;
export let BLOCK_1_START_CORNER_SE = 0.311;
export let BLOCK_1_END_CORNER_SE = 0.639;
export let BLOCK_2_START_CORNER_SE = 0.653;
export let BLOCK_2_END_CORNER_SE = 0.960;

export function setBlockParam(name: string, val: number) {
  if (name === "BLOCK_0_START") BLOCK_0_START = val;
  else if (name === "BLOCK_0_END") BLOCK_0_END = val;
  else if (name === "BLOCK_1_START") BLOCK_1_START = val;
  else if (name === "BLOCK_1_END") BLOCK_1_END = val;
  else if (name === "BLOCK_2_START") BLOCK_2_START = val;
  else if (name === "BLOCK_2_END") BLOCK_2_END = val;
  else if (name === "BLOCK_0_START_CORNER") BLOCK_0_START_CORNER = val;
  else if (name === "BLOCK_0_END_CORNER") BLOCK_0_END_CORNER = val;
  else if (name === "BLOCK_1_START_CORNER") BLOCK_1_START_CORNER = val;
  else if (name === "BLOCK_1_END_CORNER") BLOCK_1_END_CORNER = val;
  else if (name === "BLOCK_2_START_CORNER") BLOCK_2_START_CORNER = val;
  else if (name === "BLOCK_2_END_CORNER") BLOCK_2_END_CORNER = val;
  else if (name === "BLOCK_0_START_CORNER_SE") BLOCK_0_START_CORNER_SE = val;
  else if (name === "BLOCK_0_END_CORNER_SE") BLOCK_0_END_CORNER_SE = val;
  else if (name === "BLOCK_1_START_CORNER_SE") BLOCK_1_START_CORNER_SE = val;
  else if (name === "BLOCK_1_END_CORNER_SE") BLOCK_1_END_CORNER_SE = val;
  else if (name === "BLOCK_2_START_CORNER_SE") BLOCK_2_START_CORNER_SE = val;
  else if (name === "BLOCK_2_END_CORNER_SE") BLOCK_2_END_CORNER_SE = val;
}

export function buildBlocks(innerBuffer: XY[]): BlockPolygon[] {
  const scale = getMeterToSvgScale();
  const blocks: BlockPolygon[] = [];
  
  if (innerBuffer.length < 4) return [];

  // Generate the central Oasis boundary polygon (curved crater shape)
  const oasisPoly: XY[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const scallop = 4.5 * Math.sin(3 * Math.PI * t); 
    const d_low = 110.1 - Math.max(0, scallop);
    oasisPoly.push(getBandPoint(innerBuffer, t, d_low, scale));
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const scallop = 4.5 * Math.sin(3 * Math.PI * t);
    const d_high = 138.9 + Math.max(0, scallop);
    oasisPoly.push(getBandPoint(innerBuffer, t, d_high, scale));
  }
  globalOasisBoundary = oasisPoly;
  
  // Now build the blocks for each band
  for (let b = 0; b < 10; b++) {
    const blockIds = BAND_BLOCKS[b];
    const offsets = BAND_OFFSETS[b];
    
    // Dynamic block ranges per band to avoid parking hubs on corners
    let bandTRanges = [
      { start: BLOCK_0_START, end: BLOCK_0_END }, // Block 0 
      { start: BLOCK_1_START, end: BLOCK_1_END }, // Block 1 
      { start: BLOCK_2_START, end: BLOCK_2_END }  // Block 2 
    ];

    if (b === 0 || b === 1) {
      // Band 1 (M1-M3) and Band 2 (M4-M6): avoid SW (0.00-0.05) and NW (0.87-0.92) hubs
      bandTRanges = [
        { start: BLOCK_0_START_CORNER, end: BLOCK_0_END_CORNER },
        { start: BLOCK_1_START_CORNER, end: BLOCK_1_END_CORNER },
        { start: BLOCK_2_START_CORNER, end: BLOCK_2_END_CORNER }
      ];
    } else if (b === 8 || b === 9) {
      // Band 9 (M25-M27) and Band 10 (M28-M30): avoid SE (0.00-0.06) and NE (0.86-0.915) hubs
      bandTRanges = [
        { start: BLOCK_0_START_CORNER_SE, end: BLOCK_0_END_CORNER_SE },
        { start: BLOCK_1_START_CORNER_SE, end: BLOCK_1_END_CORNER_SE },
        { start: BLOCK_2_START_CORNER_SE, end: BLOCK_2_END_CORNER_SE }
      ];
    }
    
    for (let i = 0; i < blockIds.length; i++) {
      const id = blockIds[i];
      let { start: tStart, end: tEnd } = bandTRanges[i];
      
      const blockPoly: XY[] = [];
      const steps = 12;
      for (let s = 0; s <= steps; s++) {
        const curr_t = tStart + (tEnd - tStart) * (s / steps);
        const curr_d_low = getCurvedD(curr_t, offsets.low);
        blockPoly.push(getBandPoint(innerBuffer, curr_t, curr_d_low, scale));
      }
      for (let s = steps; s >= 0; s--) {
        const curr_t = tStart + (tEnd - tStart) * (s / steps);
        const curr_d_high = getCurvedD(curr_t, offsets.high);
        blockPoly.push(getBandPoint(innerBuffer, curr_t, curr_d_high, scale));
      }
      
      const blockCenterD = [8.7, 30.9, 53.1, 78.0, 102.9, 151.1, 176.0, 200.9, 223.1, 245.3][b];
      let tCenter = (tStart + tEnd) / 2;
      
      // Shift block labels slightly along the shared roads to prevent 100% overlap
      if (b === 0) {
        tCenter -= 0.05;
      } else if (b === 1) {
        tCenter += 0.05;
      } else if (b === 8) {
        tCenter -= 0.05;
      } else if (b === 9) {
        tCenter += 0.05;
      }
      
      const labelD = blockCenterD;
      const labelPoint = getBandPoint(innerBuffer, tCenter, labelD, scale);
      
      let role = "outer-ring";
      if (["M10", "M11", "M12", "M13", "M14", "M15"].includes(id)) {
        role = "inner-oasis";
      } else if (["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M16", "M17", "M18", "M19", "M20", "M21", "M22", "M23", "M24", "M25", "M26", "M27"].includes(id)) {
        role = "middle-ring";
      } else if (["M28", "M29", "M30"].includes(id)) {
        role = "north-reserve";
      }
      
      blocks.push({
        id,
        role,
        polygon: blockPoly,
        labelPoint,
        vehiclesAllowed: false,
        ringData: {
          innerPoly: [],
          outerPoly: [],
          t_start: tStart, // logical start for calculating dt
          t_end: tEnd,
          t_start_low: tStart,
          t_start_high: tStart,
          isFirstRow: i === 0
        }
      });
    }
  }
  
  return blocks;
}
