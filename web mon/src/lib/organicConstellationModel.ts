import lotsStatusMap from "../data/lots_status.json";
import type { Amenity, BlockPolygon, Lot, LotStatus, LotTypology, Road, XY } from "../types/map";
import { COMMERCIAL_PRICE_VERSION, getLotPricePerM2, PRIVATE_PARKING_PRICE_PEN } from "../config/pricing";
import { centroid, roadToPolygon, shoelaceArea } from "./geometry";
import { roundPolygonCorners } from "./polygonOffset";
import { buildConstellationMasterplan } from "./constellationModel";

export const ORGANIC_MASTERPLAN_VERSION = "moon-constellations-v3";
export const ORGANIC_MASTERPLAN_LABEL = "Moon Constellations V3";
export const ORGANIC_RESIDENTIAL_COUNT = 270;
export const ORGANIC_MIN_BUILDABLE_DIAMETER_M = 8.25;

const VILLAGE_COUNT = 6;
const INNER_OASIS_RADIUS_M = 45;
const CORNER_ROUNDING_M = 48;
const VILLAGE_GAP_DEG = 5.4;
const RING_PATH_WIDTH_M = 4;
const RING_PATH_RESERVE_M = 5.0;
const RADIAL_PATH_WIDTH_M = 4;
const BASE_ANGLE_DEG = -105;
const ORGANIC_SWAY_DEG = 0.3;

type RowTarget = {
  typology: LotTypology;
  areaM2: number;
};

type DraftLot = {
  polygon: XY[];
  blockId: string;
  villageIndex: number;
  rowIndex: number;
  typology: LotTypology;
  targetAreaM2: number;
  frontageM: number;
  depthM: number;
  center: XY;
};

type RingGap = {
  villageIndex: number;
  rowIndex: number;
  angleStart: number;
  angleEnd: number;
  t: number;
};

type VillageAngles = {
  sectorStart: number;
  sectorEnd: number;
  angleStart: number;
  angleEnd: number;
};

const NARROW_ROW_TARGETS: RowTarget[][] = [
  Array.from({ length: 3 }, () => ({ typology: "premium" as const, areaM2: 240 })),
  Array.from({ length: 4 }, () => ({ typology: "premium" as const, areaM2: 240 })),
  [
    ...Array.from({ length: 3 }, () => ({ typology: "premium" as const, areaM2: 240 })),
    ...Array.from({ length: 3 }, () => ({ typology: "adjustment" as const, areaM2: 255 })),
  ],
  Array.from({ length: 5 }, () => ({ typology: "adjustment" as const, areaM2: 255 })),
  Array.from({ length: 6 }, () => ({ typology: "premium" as const, areaM2: 240 })),
  Array.from({ length: 6 }, () => ({ typology: "adjustment" as const, areaM2: 255 })),
  Array.from({ length: 12 }, () => ({ typology: "tiny-house" as const, areaM2: 150 })),
];

const BASE_ROW_TARGETS: RowTarget[][] = [
  Array.from({ length: 4 }, () => ({ typology: "premium" as const, areaM2: 240 })),
  Array.from({ length: 5 }, () => ({ typology: "premium" as const, areaM2: 240 })),
  [
    ...Array.from({ length: 3 }, () => ({ typology: "premium" as const, areaM2: 240 })),
    ...Array.from({ length: 4 }, () => ({ typology: "adjustment" as const, areaM2: 255 })),
  ],
  Array.from({ length: 8 }, () => ({ typology: "standard" as const, areaM2: 185 })),
  Array.from({ length: 10 }, () => ({ typology: "standard" as const, areaM2: 185 })),
  Array.from({ length: 11 }, () => ({ typology: "tiny-house" as const, areaM2: 150 })),
];

const WIDE_ROW_TARGETS: RowTarget[][] = [
  Array.from({ length: 4 }, () => ({ typology: "premium" as const, areaM2: 240 })),
  [
    ...Array.from({ length: 2 }, () => ({ typology: "premium" as const, areaM2: 240 })),
    ...Array.from({ length: 3 }, () => ({ typology: "adjustment" as const, areaM2: 255 })),
    ...Array.from({ length: 3 }, () => ({ typology: "standard" as const, areaM2: 185 })),
  ],
  Array.from({ length: 10 }, () => ({ typology: "standard" as const, areaM2: 185 })),
  Array.from({ length: 12 }, () => ({ typology: "standard" as const, areaM2: 185 })),
  Array.from({ length: 14 }, () => ({ typology: "tiny-house" as const, areaM2: 150 })),
];

const VILLAGE_ROW_TARGETS = [
  NARROW_ROW_TARGETS,
  BASE_ROW_TARGETS,
  WIDE_ROW_TARGETS,
  NARROW_ROW_TARGETS,
  BASE_ROW_TARGETS,
  WIDE_ROW_TARGETS,
];

const PROTECTED_STATUSES = new Set<LotStatus>(["sold", "reserved", "offer", "blocked"]);

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function pointOnSegment(start: XY, end: XY, ratio: number): XY {
  return {
    x: start.x + (end.x - start.x) * ratio,
    y: start.y + (end.y - start.y) * ratio,
  };
}

function rayIntersectionDistance(center: XY, angle: number, polygon: XY[]): number {
  const direction = { x: Math.cos(angle), y: Math.sin(angle) };
  let closest = Number.POSITIVE_INFINITY;

  for (let index = 0; index < polygon.length; index += 1) {
    const a = polygon[index];
    const b = polygon[(index + 1) % polygon.length];
    const edge = { x: b.x - a.x, y: b.y - a.y };
    const denominator = direction.x * edge.y - direction.y * edge.x;
    if (Math.abs(denominator) < 1e-9) continue;

    const delta = { x: a.x - center.x, y: a.y - center.y };
    const rayT = (delta.x * edge.y - delta.y * edge.x) / denominator;
    const edgeT = (delta.x * direction.y - delta.y * direction.x) / denominator;

    if (rayT >= 0 && edgeT >= -1e-8 && edgeT <= 1 + 1e-8) {
      closest = Math.min(closest, rayT);
    }
  }

  if (!Number.isFinite(closest)) {
    throw new Error(`No se encontró intersección orgánica para el ángulo ${angle}.`);
  }
  return closest;
}

function organicAngle(
  _center: XY,
  _outerEnvelope: XY[],
  _innerRadiusPx: number,
  angle: number,
  t: number,
): number {
  const normalizedT = clamp(t, 0, 1);
  const sway = degreesToRadians(ORGANIC_SWAY_DEG);
  const artisticOffset = Math.sin(Math.PI * normalizedT) ** 2 * sway * Math.sin(angle * 3 + 0.7);
  return angle + artisticOffset;
}

function organicPoint(
  center: XY,
  outerEnvelope: XY[],
  innerRadiusPx: number,
  angle: number,
  t: number,
): XY {
  const warpedAngle = organicAngle(center, outerEnvelope, innerRadiusPx, angle, t);
  const outerRadius = rayIntersectionDistance(center, warpedAngle, outerEnvelope);
  const radius = innerRadiusPx + (outerRadius - innerRadiusPx) * t;
  return {
    x: center.x + Math.cos(warpedAngle) * radius,
    y: center.y + Math.sin(warpedAngle) * radius,
  };
}

function sectorPolygon(
  center: XY,
  outerEnvelope: XY[],
  innerRadiusPx: number,
  angleStart: number,
  angleEnd: number,
  tInner: number,
  tOuter: number,
  steps = 24,
): XY[] {
  const outerArc: XY[] = [];
  const innerArc: XY[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const angle = angleStart + ((angleEnd - angleStart) * index) / steps;
    outerArc.push(organicPoint(center, outerEnvelope, innerRadiusPx, angle, tOuter));
  }
  for (let index = steps; index >= 0; index -= 1) {
    const angle = angleStart + ((angleEnd - angleStart) * index) / steps;
    innerArc.push(organicPoint(center, outerEnvelope, innerRadiusPx, angle, tInner));
  }
  return [...outerArc, ...innerArc];
}

function polygonAreaM2(polygon: XY[], scale: number): number {
  return shoelaceArea(polygon) / (scale * scale);
}

function annularSectorAreaM2(
  center: XY,
  outerEnvelope: XY[],
  innerRadiusPx: number,
  angleStart: number,
  angleEnd: number,
  scale: number,
): number {
  return polygonAreaM2(
    sectorPolygon(center, outerEnvelope, innerRadiusPx, angleStart, angleEnd, 0, 1, 128),
    scale,
  );
}

function createVillageAngles(center: XY, outerEnvelope: XY[], innerRadiusPx: number, scale: number): VillageAngles[] {
  const baseAngle = degreesToRadians(BASE_ANGLE_DEG);
  const fullEnd = baseAngle + Math.PI * 2;
  const totalArea = annularSectorAreaM2(center, outerEnvelope, innerRadiusPx, baseAngle, fullEnd, scale);
  const boundaries = [baseAngle];

  for (let villageIndex = 1; villageIndex < VILLAGE_COUNT; villageIndex += 1) {
    const targetArea = (totalArea * villageIndex) / VILLAGE_COUNT;
    let low = boundaries[boundaries.length - 1];
    let high = fullEnd;
    for (let iteration = 0; iteration < 42; iteration += 1) {
      const middle = (low + high) / 2;
      const area = annularSectorAreaM2(center, outerEnvelope, innerRadiusPx, baseAngle, middle, scale);
      if (area < targetArea) low = middle;
      else high = middle;
    }
    boundaries.push((low + high) / 2);
  }
  boundaries.push(fullEnd);

  const halfGap = degreesToRadians(VILLAGE_GAP_DEG) / 2;
  return Array.from({ length: VILLAGE_COUNT }, (_, villageIndex) => ({
    sectorStart: boundaries[villageIndex],
    sectorEnd: boundaries[villageIndex + 1],
    angleStart: boundaries[villageIndex] + halfGap,
    angleEnd: boundaries[villageIndex + 1] - halfGap,
  }));
}

function solveOuterT(
  center: XY,
  outerEnvelope: XY[],
  innerRadiusPx: number,
  angleStart: number,
  angleEnd: number,
  tInner: number,
  targetAreaM2: number,
  scale: number,
): number {
  const maxArea = polygonAreaM2(
    sectorPolygon(center, outerEnvelope, innerRadiusPx, angleStart, angleEnd, tInner, 1, 128),
    scale,
  );
  if (maxArea + 0.05 < targetAreaM2) {
    throw new Error(`La banda orgánica no tiene cabida suficiente: ${maxArea.toFixed(2)} m².`);
  }

  let low = tInner;
  let high = 1;
  for (let iteration = 0; iteration < 46; iteration += 1) {
    const middle = (low + high) / 2;
    const area = polygonAreaM2(
      sectorPolygon(center, outerEnvelope, innerRadiusPx, angleStart, angleEnd, tInner, middle, 96),
      scale,
    );
    if (area < targetAreaM2) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

function solveAngleCut(
  center: XY,
  outerEnvelope: XY[],
  innerRadiusPx: number,
  angleStart: number,
  angleLimit: number,
  tInner: number,
  tOuter: number,
  targetAreaM2: number,
  scale: number,
): number {
  let low = angleStart;
  let high = angleLimit;
  for (let iteration = 0; iteration < 46; iteration += 1) {
    const middle = (low + high) / 2;
    const area = polygonAreaM2(
      sectorPolygon(center, outerEnvelope, innerRadiusPx, angleStart, middle, tInner, tOuter, 24),
      scale,
    );
    if (area < targetAreaM2) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

function averageFrontageM(polygon: XY[], scale: number): number {
  const half = polygon.length / 2;
  const outer = Math.hypot(
    polygon[half - 1].x - polygon[0].x,
    polygon[half - 1].y - polygon[0].y,
  ) / scale;
  const inner = Math.hypot(
    polygon[half].x - polygon[polygon.length - 1].x,
    polygon[half].y - polygon[polygon.length - 1].y,
  ) / scale;
  return (outer + inner) / 2;
}

function averageDepthM(polygon: XY[], scale: number): number {
  const half = polygon.length / 2;
  const left = Math.hypot(
    polygon[0].x - polygon[polygon.length - 1].x,
    polygon[0].y - polygon[polygon.length - 1].y,
  ) / scale;
  const right = Math.hypot(
    polygon[half - 1].x - polygon[half].x,
    polygon[half - 1].y - polygon[half].y,
  ) / scale;
  return (left + right) / 2;
}

function pointInsidePolygon(point: XY, polygon: XY[]): boolean {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const a = polygon[index];
    const b = polygon[previous];
    const crosses = (a.y > point.y) !== (b.y > point.y)
      && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function distanceToSegment(point: XY, start: XY, end: XY): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const squaredLength = dx * dx + dy * dy;
  if (squaredLength === 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const ratio = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / squaredLength, 0, 1);
  return Math.hypot(point.x - (start.x + ratio * dx), point.y - (start.y + ratio * dy));
}

function minimumEdgeDistance(point: XY, polygon: XY[]): number {
  let distance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < polygon.length; index += 1) {
    distance = Math.min(distance, distanceToSegment(point, polygon[index], polygon[(index + 1) % polygon.length]));
  }
  return distance;
}

function largestBuildableCircle(polygon: XY[], scale: number): { center: XY; radiusM: number } {
  const bounds = polygon.reduce((result, point) => ({
    minX: Math.min(result.minX, point.x),
    minY: Math.min(result.minY, point.y),
    maxX: Math.max(result.maxX, point.x),
    maxY: Math.max(result.maxY, point.y),
  }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
  let best = centroid(polygon);
  let bestDistance = pointInsidePolygon(best, polygon) ? minimumEdgeDistance(best, polygon) : 0;
  let step = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) / 12;

  for (let y = bounds.minY; y <= bounds.maxY; y += step) {
    for (let x = bounds.minX; x <= bounds.maxX; x += step) {
      const candidate = { x, y };
      if (!pointInsidePolygon(candidate, polygon)) continue;
      const distance = minimumEdgeDistance(candidate, polygon);
      if (distance > bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    }
  }

  for (let iteration = 0; iteration < 9; iteration += 1) {
    step /= 2;
    for (let yOffset = -2; yOffset <= 2; yOffset += 1) {
      for (let xOffset = -2; xOffset <= 2; xOffset += 1) {
        const candidate = { x: best.x + xOffset * step, y: best.y + yOffset * step };
        if (!pointInsidePolygon(candidate, polygon)) continue;
        const distance = minimumEdgeDistance(candidate, polygon);
        if (distance > bestDistance) {
          best = candidate;
          bestDistance = distance;
        }
      }
    }
  }

  return { center: best, radiusM: bestDistance / scale };
}

function roundPrimaryLotCorners(polygon: XY[], radiusPx: number, steps = 5): XY[] {
  if (polygon.length < 6) return polygon;
  const half = polygon.length / 2;
  const corners = new Set([0, half - 1, half, polygon.length - 1]);
  const rounded: XY[] = [];

  polygon.forEach((current, index) => {
    if (!corners.has(index)) {
      rounded.push(current);
      return;
    }
    const previous = polygon[(index - 1 + polygon.length) % polygon.length];
    const next = polygon[(index + 1) % polygon.length];
    const previousLength = Math.hypot(previous.x - current.x, previous.y - current.y);
    const nextLength = Math.hypot(next.x - current.x, next.y - current.y);
    const cut = Math.min(radiusPx, previousLength / 3, nextLength / 3);
    const incoming = pointOnSegment(current, previous, cut / (previousLength || 1));
    const outgoing = pointOnSegment(current, next, cut / (nextLength || 1));
    rounded.push(incoming);
    for (let stepIndex = 1; stepIndex < steps; stepIndex += 1) {
      const t = stepIndex / steps;
      rounded.push({
        x: (1 - t) ** 2 * incoming.x + 2 * (1 - t) * t * current.x + t * t * outgoing.x,
        y: (1 - t) ** 2 * incoming.y + 2 * (1 - t) * t * current.y + t * t * outgoing.y,
      });
    }
    rounded.push(outgoing);
  });

  return rounded;
}

function minimumInteriorAngleDegrees(polygon: XY[]): number {
  return Math.min(...polygon.map((current, index) => {
    const previous = polygon[(index - 1 + polygon.length) % polygon.length];
    const next = polygon[(index + 1) % polygon.length];
    const ux = previous.x - current.x;
    const uy = previous.y - current.y;
    const vx = next.x - current.x;
    const vy = next.y - current.y;
    const denominator = Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1;
    return Math.acos(clamp((ux * vx + uy * vy) / denominator, -1, 1)) * 180 / Math.PI;
  }));
}

function createDrafts(outerEnvelope: XY[], center: XY, scale: number) {
  const drafts: DraftLot[] = [];
  const ringGaps: RingGap[] = [];
  const rowEndsByVillage: number[] = [];
  const innerRadiusPx = INNER_OASIS_RADIUS_M * scale;
  const villageAngles = createVillageAngles(center, outerEnvelope, innerRadiusPx, scale);

  villageAngles.forEach(({ angleStart, angleEnd }, villageIndex) => {
    let tStart = 0;
    const rowTargets = VILLAGE_ROW_TARGETS[villageIndex];
    rowTargets.forEach((targets, rowIndex) => {
      const targetRowArea = targets.reduce((sum, target) => sum + target.areaM2, 0);
      const tEnd = solveOuterT(
        center,
        outerEnvelope,
        innerRadiusPx,
        angleStart,
        angleEnd,
        tStart,
        targetRowArea,
        scale,
      );

      let currentAngle = angleStart;
      targets.forEach((target, lotIndex) => {
        const nextAngle = lotIndex === targets.length - 1
          ? angleEnd
          : solveAngleCut(
              center,
              outerEnvelope,
              innerRadiusPx,
              currentAngle,
              angleEnd,
              tStart,
              tEnd,
              target.areaM2,
              scale,
            );
        const rawPolygon = sectorPolygon(
          center,
          outerEnvelope,
          innerRadiusPx,
          currentAngle,
          nextAngle,
          tStart,
          tEnd,
          24,
        );
        const polygon = roundPrimaryLotCorners(rawPolygon, 0.55 * scale);
        drafts.push({
          polygon,
          blockId: `C${villageIndex + 1}`,
          villageIndex,
          rowIndex,
          typology: target.typology,
          targetAreaM2: target.areaM2,
          frontageM: averageFrontageM(rawPolygon, scale),
          depthM: averageDepthM(rawPolygon, scale),
          center: centroid(polygon),
        });
        currentAngle = nextAngle;
      });

      if (rowIndex < rowTargets.length - 1) {
        const availableRadius = Math.min(...Array.from({ length: 25 }, (_, sampleIndex) => {
          const angle = angleStart + ((angleEnd - angleStart) * sampleIndex) / 24;
          return rayIntersectionDistance(center, angle, outerEnvelope) - innerRadiusPx;
        }));
        const localReserveM = RING_PATH_RESERVE_M + (villageIndex === 0 && rowIndex >= 4 ? 0.8 : 0);
        const tGap = (localReserveM * scale) / availableRadius;
        ringGaps.push({ villageIndex, rowIndex, angleStart, angleEnd, t: tEnd + tGap / 2 });
        tStart = tEnd + tGap;
      }
      rowEndsByVillage[villageIndex] = tEnd;
    });
  });

  return { drafts, ringGaps, rowEndsByVillage, villageAngles };
}

function assignStableIds(drafts: DraftLot[], previousLots: Lot[]): { assignments: string[]; retiredIds: string[] } {
  const assignments = new Array<string>(drafts.length).fill("");
  const usedDrafts = new Set<number>();
  const usedIds = new Set<string>();

  const matchLot = (lot: Lot) => {
    const lotCenter = centroid(lot.polygon);
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;
    drafts.forEach((draft, draftIndex) => {
      if (usedDrafts.has(draftIndex)) return;
      const villagePenalty = draft.blockId === lot.blockId ? 0 : 1_000_000;
      const dx = draft.center.x - lotCenter.x;
      const dy = draft.center.y - lotCenter.y;
      const score = villagePenalty + dx * dx + dy * dy;
      if (score < bestScore) {
        bestScore = score;
        bestIndex = draftIndex;
      }
    });
    if (bestIndex >= 0) {
      assignments[bestIndex] = lot.id;
      usedDrafts.add(bestIndex);
      usedIds.add(lot.id);
    }
  };

  previousLots
    .filter((lot) => PROTECTED_STATUSES.has(lot.status))
    .sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true }))
    .forEach(matchLot);

  previousLots
    .filter((lot) => !usedIds.has(lot.id))
    .sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true }))
    .forEach((lot) => {
      if (usedDrafts.size < drafts.length) matchLot(lot);
    });

  if (assignments.some((id) => !id)) {
    throw new Error("No se pudo completar la migración espacial de IDs hacia V3.");
  }

  return {
    assignments,
    retiredIds: previousLots.filter((lot) => !usedIds.has(lot.id)).map((lot) => lot.id),
  };
}

function createResidentialLots(drafts: DraftLot[], assignments: string[], scale: number): Lot[] {
  return drafts.map((draft, index) => {
    const id = assignments[index];
    const status = ((lotsStatusMap as Record<string, LotStatus>)[id] ?? "available") as LotStatus;
    const areaM2 = Math.round(polygonAreaM2(draft.polygon, scale) * 100) / 100;
    const pricePerM2 = getLotPricePerM2(draft.typology);
    const price = Math.round(areaM2 * pricePerM2);
    const frontage = Math.round(draft.frontageM * 100) / 100;
    const depth = Math.round(draft.depthM * 100) / 100;
    const buildableCircle = largestBuildableCircle(draft.polygon, scale);
    const buildableCircleDiameterM = Math.round(buildableCircle.radiusM * 200) / 100;

    return {
      id,
      legacyId: id,
      blockId: draft.blockId,
      projectId: "moon-paracas",
      typology: draft.typology,
      status,
      areaM2,
      polygon: draft.polygon,
      dimensions: `${frontage.toFixed(2)}m de frente × ${depth.toFixed(2)}m de fondo`,
      priceLabel: `S/ ${price.toLocaleString("es-PE")}`,
      price,
      number: index + 1,
      quadrant: draft.blockId,
      area: areaM2,
      elevation: 108 + draft.villageIndex,
      distanceToPool: 0,
      hubDistance: 0,
      frontage,
      depth,
      price_soles: price,
      parking_type: "orbita_perimetral",
      walk_distance_parking_meters: 0,
      walk_distance_oasis_meters: 0,
      placementSource: "masterplan-v3",
      masterplanVersion: ORGANIC_MASTERPLAN_VERSION,
      commercialPriceVersion: COMMERCIAL_PRICE_VERSION,
      buildableCircleCenter: buildableCircle.center,
      buildableCircleDiameterM,
      fitsDome4m: buildableCircleDiameterM >= 4,
      fitsDome8m: buildableCircleDiameterM >= 8,
      recommendedDomeDiameterM: buildableCircleDiameterM >= 8 ? 8 : buildableCircleDiameterM >= 4 ? 4 : undefined,
    };
  });
}

function createParkingLots(previousParkings: Lot[]): Lot[] {
  const removalIndexes = new Set(
    Array.from({ length: previousParkings.length - ORGANIC_RESIDENTIAL_COUNT }, (_, index) => (
      Math.floor(((index + 0.5) * previousParkings.length) / (previousParkings.length - ORGANIC_RESIDENTIAL_COUNT))
    )),
  );
  return previousParkings
    .filter((_, index) => !removalIndexes.has(index))
    .map((parking, index) => {
      const id = `P${String(index + 1).padStart(3, "0")}`;
      return {
        ...parking,
        id,
        legacyId: parking.id,
        number: id,
        price: PRIVATE_PARKING_PRICE_PEN,
        price_soles: PRIVATE_PARKING_PRICE_PEN,
        priceLabel: `S/ ${PRIVATE_PARKING_PRICE_PEN.toLocaleString("es-PE")}`,
        placementSource: "masterplan-v3" as const,
        masterplanVersion: ORGANIC_MASTERPLAN_VERSION,
        commercialPriceVersion: COMMERCIAL_PRICE_VERSION,
      };
    });
}

function assignParkingAndDistances(residentialLots: Lot[], privateParkings: Lot[], oasisCenter: XY, scale: number): Lot[] {
  const lotCenters = residentialLots.map((lot) => centroid(lot.polygon));
  const parkingCenters = privateParkings.map((parking) => centroid(parking.polygon));
  const count = residentialLots.length;
  if (count !== privateParkings.length) throw new Error("V3 exige una cochera privada por lote.");

  const rowPotentials = new Array<number>(count + 1).fill(0);
  const columnPotentials = new Array<number>(count + 1).fill(0);
  const matchedRowByColumn = new Array<number>(count + 1).fill(0);
  const precedingColumn = new Array<number>(count + 1).fill(0);

  for (let row = 1; row <= count; row += 1) {
    matchedRowByColumn[0] = row;
    let currentColumn = 0;
    const minimumValue = new Array<number>(count + 1).fill(Number.POSITIVE_INFINITY);
    const used = new Array<boolean>(count + 1).fill(false);

    do {
      used[currentColumn] = true;
      const currentRow = matchedRowByColumn[currentColumn];
      let delta = Number.POSITIVE_INFINITY;
      let nextColumn = 0;
      for (let column = 1; column <= count; column += 1) {
        if (used[column]) continue;
        const dx = lotCenters[currentRow - 1].x - parkingCenters[column - 1].x;
        const dy = lotCenters[currentRow - 1].y - parkingCenters[column - 1].y;
        const squaredDistance = dx * dx + dy * dy;
        const preferredWalkPx = 135 * scale;
        const penalty = squaredDistance > preferredWalkPx * preferredWalkPx ? 1_000_000_000 : 0;
        const reducedCost = squaredDistance + penalty - rowPotentials[currentRow] - columnPotentials[column];
        if (reducedCost < minimumValue[column]) {
          minimumValue[column] = reducedCost;
          precedingColumn[column] = currentColumn;
        }
        if (minimumValue[column] < delta) {
          delta = minimumValue[column];
          nextColumn = column;
        }
      }
      for (let column = 0; column <= count; column += 1) {
        if (used[column]) {
          rowPotentials[matchedRowByColumn[column]] += delta;
          columnPotentials[column] -= delta;
        } else {
          minimumValue[column] -= delta;
        }
      }
      currentColumn = nextColumn;
    } while (matchedRowByColumn[currentColumn] !== 0);

    do {
      const previousColumn = precedingColumn[currentColumn];
      matchedRowByColumn[currentColumn] = matchedRowByColumn[previousColumn];
      currentColumn = previousColumn;
    } while (currentColumn !== 0);
  }

  const parkingIndexByLotIndex = new Array<number>(count).fill(-1);
  for (let column = 1; column <= count; column += 1) {
    parkingIndexByLotIndex[matchedRowByColumn[column] - 1] = column - 1;
  }

  return residentialLots.map((lot, lotIndex) => {
    const parkingIndex = parkingIndexByLotIndex[lotIndex];
    const parking = privateParkings[parkingIndex];
    const lotCenter = lotCenters[lotIndex];
    const parkingCenter = parkingCenters[parkingIndex];
    const parkingDistance = Math.hypot(lotCenter.x - parkingCenter.x, lotCenter.y - parkingCenter.y) / scale;
    const oasisDistance = Math.max(0, Math.hypot(lotCenter.x - oasisCenter.x, lotCenter.y - oasisCenter.y) / scale - INNER_OASIS_RADIUS_M);
    return {
      ...lot,
      assignedParkingId: parking.id,
      hubDistance: Math.round(parkingDistance),
      distanceToPool: Math.round(oasisDistance),
      walk_distance_parking_meters: Math.round(parkingDistance),
      walk_distance_oasis_meters: Math.round(oasisDistance),
    };
  });
}

function createRoads(
  baseRoads: Road[],
  outerEnvelope: XY[],
  center: XY,
  ringGaps: RingGap[],
  villageAngles: VillageAngles[],
  scale: number,
): Road[] {
  const innerRadiusPx = INNER_OASIS_RADIUS_M * scale;
  const roads: Road[] = baseRoads.slice(0, 2).map((road) => ({ ...road, path: road.path.map((point) => ({ ...point })) }));

  villageAngles.forEach((angles, villageIndex) => {
    roads.push({
      id: `PASEO-ORGANICO-${villageIndex + 1}`,
      kind: "pedestrian",
      widthM: RADIAL_PATH_WIDTH_M,
      path: Array.from({ length: 25 }, (_, index) => (
        organicPoint(center, outerEnvelope, innerRadiusPx, angles.sectorStart, index / 24)
      )),
    });
  });

  ringGaps.forEach((gap) => {
    roads.push({
      id: `SENDERO-CURVO-${gap.villageIndex + 1}-${gap.rowIndex + 1}`,
      kind: "pedestrian",
      widthM: RING_PATH_WIDTH_M,
      path: Array.from({ length: 49 }, (_, index) => {
        const angle = gap.angleStart + ((gap.angleEnd - gap.angleStart) * index) / 48;
        return organicPoint(center, outerEnvelope, innerRadiusPx, angle, gap.t);
      }),
    });
  });

  return roads;
}

function circlePolygon(center: XY, radiusM: number, scale: number, steps = 32): XY[] {
  const radius = radiusM * scale;
  return Array.from({ length: steps }, (_, index) => {
    const angle = (index * Math.PI * 2) / steps;
    return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
  });
}

function createCornerGardens(outerEnvelope: XY[], center: XY, scale: number): Amenity[] {
  return outerEnvelope.slice(0, 4).map((corner, index) => {
    const gardenCenter = pointOnSegment(corner, center, 0.17);
    return {
      id: `A_V3_CORNER_GARDEN_${index + 1}`,
      kind: "pocket-garden" as const,
      polygon: circlePolygon(gardenCenter, 8.5, scale, 32),
      areaM2: Math.round(Math.PI * 8.5 * 8.5),
    };
  });
}

function createBlocks(
  outerEnvelope: XY[],
  center: XY,
  villageAngles: VillageAngles[],
  scale: number,
): BlockPolygon[] {
  const innerRadiusPx = INNER_OASIS_RADIUS_M * scale;
  return villageAngles.map(({ angleStart, angleEnd }, villageIndex) => {
    const middleAngle = (angleStart + angleEnd) / 2;
    return {
      id: `C${villageIndex + 1}`,
      role: "organic-constellation-village",
      polygon: sectorPolygon(center, outerEnvelope, innerRadiusPx, angleStart, angleEnd, 0, 1, 32),
      labelPoint: organicPoint(center, outerEnvelope, innerRadiusPx, middleAngle, 0.54),
      vehiclesAllowed: false,
    };
  });
}

function createOrganicMasterplan() {
  const previous = buildConstellationMasterplan();
  const { terrainScene, scale } = previous;
  const organicEnvelope = roundPolygonCorners(previous.outerEnvelope, CORNER_ROUNDING_M * scale);
  const center = centroid(organicEnvelope);
  const { drafts, ringGaps, rowEndsByVillage, villageAngles } = createDrafts(organicEnvelope, center, scale);
  const { assignments, retiredIds } = assignStableIds(drafts, previous.residentialLots);
  const residentialBase = createResidentialLots(drafts, assignments, scale);
  const privateParkings = createParkingLots(previous.privateParkings);
  const residentialLots = assignParkingAndDistances(residentialBase, privateParkings, center, scale);
  const commonParkings = previous.commonParkings.map((parking) => ({
    ...parking,
    placementSource: "masterplan-v3" as const,
    masterplanVersion: ORGANIC_MASTERPLAN_VERSION,
  }));
  const parkings = [...privateParkings, ...commonParkings];
  const roads = createRoads(previous.roads, organicEnvelope, center, ringGaps, villageAngles, scale);
  const amenities = [
    ...previous.amenities.filter((amenity) => amenity.kind !== "pocket-garden"),
    ...createCornerGardens(previous.outerEnvelope, center, scale),
  ];
  const blocks = createBlocks(organicEnvelope, center, villageAngles, scale);
  const allLots = [...residentialLots, ...parkings];
  const roadPolys = roads.map((road) => roadToPolygon(road.path, road.widthM, scale));
  const frontages = residentialLots.map((lot) => lot.frontage ?? 0);
  const aspectRatios = residentialLots.map((lot) => {
    const frontage = lot.frontage ?? 1;
    const depth = lot.depth ?? 1;
    return Math.max(frontage / depth, depth / frontage);
  });
  const cornerAngles = drafts.map((draft) => minimumInteriorAngleDegrees(draft.polygon));

  return {
    masterplanVersion: ORGANIC_MASTERPLAN_VERSION,
    masterplanLabel: ORGANIC_MASTERPLAN_LABEL,
    terrainScene,
    scale,
    center,
    outerEnvelope: organicEnvelope,
    blocks,
    roads,
    amenities,
    releasedLots: previous.residentialLots.filter((lot) => retiredIds.includes(lot.id)),
    releasedAreaM2: previous.residentialLots
      .filter((lot) => retiredIds.includes(lot.id))
      .reduce((sum, lot) => sum + lot.areaM2, 0),
    retiredIds,
    rowEndsByVillage,
    roadPolys,
    activeBuildings: amenities.map((amenity) => amenity.polygon),
    residentialLots,
    privateParkings,
    commonParkings,
    parkings,
    allLots,
    quality: {
      minimumFrontageM: Math.min(...frontages),
      maximumAspectRatio: Math.max(...aspectRatios),
      minimumPrimaryCornerAngleDeg: Math.min(...cornerAngles),
      minimumBuildableCircleDiameterM: Math.min(...residentialLots.map((lot) => lot.buildableCircleDiameterM ?? 0)),
      maximumParkingWalkM: Math.max(...residentialLots.map((lot) => lot.walk_distance_parking_meters ?? 0)),
    },
  };
}

export type OrganicConstellationMasterplan = ReturnType<typeof createOrganicMasterplan>;

let cachedMasterplan: OrganicConstellationMasterplan | undefined;

export function buildOrganicConstellationMasterplan(): OrganicConstellationMasterplan {
  cachedMasterplan ??= createOrganicMasterplan();
  return cachedMasterplan;
}

// Deterministic geometry primitives shared with later masterplan versions.
// V3 keeps its own fixed configuration and remains available as rollback.
export const organicGeometryInternals = {
  degreesToRadians,
  clamp,
  pointOnSegment,
  rayIntersectionDistance,
  organicPoint,
  sectorPolygon,
  polygonAreaM2,
  solveAngleCut,
  averageFrontageM,
  averageDepthM,
  largestBuildableCircle,
  roundPrimaryLotCorners,
  minimumInteriorAngleDegrees,
  assignParkingAndDistances,
  circlePolygon,
};
