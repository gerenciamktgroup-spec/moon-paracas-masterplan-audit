import lotsStatusMap from "../data/lots_status.json";
import type { Amenity, BlockPolygon, Lot, LotStatus, LotTypology, Road, XY } from "../types/map";
import { COMMERCIAL_PRICE_VERSION, getLotPricePerM2, PRIVATE_PARKING_PRICE_PEN } from "../config/pricing";
import { centroid, roadToPolygon, shoelaceArea } from "./geometry";
import { createInnerBuffer } from "./polygonOffset";
import { buildTerrainScene, getMeterToSvgScale } from "./terrainModel";

export const CONSTELLATION_MASTERPLAN_VERSION = "moon-constellations-v2.2";
export const MIN_BUILDABLE_CIRCLE_DIAMETER_M = 8.25;

const VILLAGE_COUNT = 6;
const INNER_OASIS_RADIUS_M = 45;
const RESIDENTIAL_ENVELOPE_OFFSET_M = 10;
const VILLAGE_GAP_DEG = 5.2;
const RING_PATH_WIDTH_M = 4;
const RING_PATH_RESERVE_M = 5.5;
const RADIAL_PATH_WIDTH_M = 4;
const BASE_ANGLE_DEG = -105;

type DraftLot = {
  polygon: XY[];
  blockId: string;
  villageIndex: number;
  typology: LotTypology;
  targetAreaM2: number;
  frontageM: number;
  depthM: number;
  center: XY;
};

type RowTarget = {
  typology: LotTypology;
  areaM2: number;
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

const BASE_ROW_TARGETS: RowTarget[][] = [
  Array.from({ length: 3 }, () => ({ typology: "premium" as const, areaM2: 240 })),
  Array.from({ length: 5 }, () => ({ typology: "premium" as const, areaM2: 240 })),
  [
    { typology: "premium", areaM2: 240 },
    { typology: "adjustment", areaM2: 255 },
    { typology: "standard", areaM2: 185 },
    { typology: "adjustment", areaM2: 255 },
    { typology: "adjustment", areaM2: 255 },
    { typology: "standard", areaM2: 185 },
    { typology: "adjustment", areaM2: 255 },
    { typology: "premium", areaM2: 240 },
  ],
  Array.from({ length: 10 }, () => ({ typology: "standard" as const, areaM2: 185 })),
  [
    ...Array.from({ length: 5 }, () => ({ typology: "standard" as const, areaM2: 185 })),
    { typology: "tiny-house", areaM2: 150 },
    ...Array.from({ length: 5 }, () => ({ typology: "standard" as const, areaM2: 185 })),
  ],
  Array.from({ length: 11 }, () => ({ typology: "tiny-house" as const, areaM2: 150 })),
];

/**
 * The terrain is not radially uniform. The western/eastern tips create lots
 * with excessive depth and little frontage, while the north/south sectors
 * create the inverse. Seven shorter rows correct the narrow villages and five
 * deeper rows correct the wide villages. Each one still contains the same 48
 * lots and sales mix, but uses the terrain's actual proportion instead of
 * forcing the same diagram everywhere.
 */
const NARROW_VILLAGE_ROW_TARGETS: RowTarget[][] = [
  Array.from({ length: 3 }, () => ({ typology: "premium" as const, areaM2: 240 })),
  Array.from({ length: 4 }, () => ({ typology: "premium" as const, areaM2: 240 })),
  [
    ...Array.from({ length: 3 }, () => ({ typology: "premium" as const, areaM2: 240 })),
    ...Array.from({ length: 4 }, () => ({ typology: "adjustment" as const, areaM2: 255 })),
  ],
  Array.from({ length: 7 }, () => ({ typology: "standard" as const, areaM2: 185 })),
  Array.from({ length: 7 }, () => ({ typology: "standard" as const, areaM2: 185 })),
  [
    ...Array.from({ length: 8 }, () => ({ typology: "standard" as const, areaM2: 185 })),
    { typology: "tiny-house", areaM2: 150 },
  ],
  Array.from({ length: 11 }, () => ({ typology: "tiny-house" as const, areaM2: 150 })),
];

const WIDE_VILLAGE_ROW_TARGETS: RowTarget[][] = [
  Array.from({ length: 4 }, () => ({ typology: "premium" as const, areaM2: 240 })),
  [
    ...Array.from({ length: 6 }, () => ({ typology: "premium" as const, areaM2: 240 })),
    ...Array.from({ length: 4 }, () => ({ typology: "adjustment" as const, areaM2: 255 })),
  ],
  Array.from({ length: 10 }, () => ({ typology: "standard" as const, areaM2: 185 })),
  Array.from({ length: 12 }, () => ({ typology: "standard" as const, areaM2: 185 })),
  Array.from({ length: 12 }, () => ({ typology: "tiny-house" as const, areaM2: 150 })),
];

const VILLAGE_ROW_TARGETS: RowTarget[][][] = [
  NARROW_VILLAGE_ROW_TARGETS,
  BASE_ROW_TARGETS,
  WIDE_VILLAGE_ROW_TARGETS,
  NARROW_VILLAGE_ROW_TARGETS,
  BASE_ROW_TARGETS,
  WIDE_VILLAGE_ROW_TARGETS,
];

const VILLAGE_TARGET_WEIGHTS = VILLAGE_ROW_TARGETS.map((rows) =>
  rows.flat().reduce((sum, target) => sum + target.areaM2, 0),
);

const COMMITTED_LEGACY_NUMBERS = [5, 14, 33, 47, 55, 61, 81, 99, 126, 137, 150, 153, 229, 292];
const OFFER_LEGACY_NUMBERS = [60, 62, 64, 65, 72, 77, 80, 82];

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
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
    throw new Error(`No se encontró intersección radial para el ángulo ${angle}.`);
  }
  return closest;
}

function radialPoint(center: XY, outerEnvelope: XY[], innerRadiusPx: number, angle: number, t: number): XY {
  const outerRadius = rayIntersectionDistance(center, angle, outerEnvelope);
  const radius = innerRadiusPx + (outerRadius - innerRadiusPx) * t;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}

function annularSectorAreaM2(
  center: XY,
  outerEnvelope: XY[],
  innerRadiusPx: number,
  angleStart: number,
  angleEnd: number,
  scale: number,
): number {
  const span = angleEnd - angleStart;
  const steps = Math.max(24, Math.ceil((Math.abs(span) / (Math.PI * 2)) * 720));
  let areaPx2 = 0;
  for (let index = 0; index < steps; index += 1) {
    const a = angleStart + (span * index) / steps;
    const b = angleStart + (span * (index + 1)) / steps;
    const radiusA = rayIntersectionDistance(center, a, outerEnvelope);
    const radiusB = rayIntersectionDistance(center, b, outerEnvelope);
    areaPx2 += ((radiusA * radiusA + radiusB * radiusB) / 4 - (innerRadiusPx * innerRadiusPx) / 2) * (b - a);
  }
  return Math.abs(areaPx2) / (scale * scale);
}

function createVillageAngles(center: XY, outerEnvelope: XY[], innerRadiusPx: number, scale: number): VillageAngles[] {
  const baseAngle = degreesToRadians(BASE_ANGLE_DEG);
  const fullEnd = baseAngle + Math.PI * 2;
  const totalArea = annularSectorAreaM2(center, outerEnvelope, innerRadiusPx, baseAngle, fullEnd, scale);
  const totalWeight = VILLAGE_TARGET_WEIGHTS.reduce((sum, weight) => sum + weight, 0);
  const boundaries = [baseAngle];
  let cumulativeWeight = 0;

  for (let villageIndex = 1; villageIndex < VILLAGE_COUNT; villageIndex += 1) {
    cumulativeWeight += VILLAGE_TARGET_WEIGHTS[villageIndex - 1];
    const targetArea = (totalArea * cumulativeWeight) / totalWeight;
    let low = boundaries[boundaries.length - 1];
    let high = fullEnd;
    for (let iteration = 0; iteration < 44; iteration += 1) {
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

function sectorPolygon(
  center: XY,
  outerEnvelope: XY[],
  innerRadiusPx: number,
  angleStart: number,
  angleEnd: number,
  tInner: number,
  tOuter: number,
  steps = 8,
): XY[] {
  const outerArc: XY[] = [];
  const innerArc: XY[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const angle = angleStart + ((angleEnd - angleStart) * index) / steps;
    outerArc.push(radialPoint(center, outerEnvelope, innerRadiusPx, angle, tOuter));
  }
  for (let index = steps; index >= 0; index -= 1) {
    const angle = angleStart + ((angleEnd - angleStart) * index) / steps;
    innerArc.push(radialPoint(center, outerEnvelope, innerRadiusPx, angle, tInner));
  }
  return [...outerArc, ...innerArc];
}

function polygonAreaM2(polygon: XY[], scale: number): number {
  return shoelaceArea(polygon) / (scale * scale);
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
  const ratio = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / squaredLength));
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
    sectorPolygon(center, outerEnvelope, innerRadiusPx, angleStart, angleEnd, tInner, 1, 192),
    scale,
  );
  if (maxArea + 0.05 < targetAreaM2) {
    throw new Error(`La aldea no tiene cabida suficiente: ${maxArea.toFixed(2)} m² para ${targetAreaM2.toFixed(2)} m².`);
  }

  let low = tInner;
  let high = 1;
  for (let iteration = 0; iteration < 48; iteration += 1) {
    const middle = (low + high) / 2;
    const area = polygonAreaM2(
      sectorPolygon(center, outerEnvelope, innerRadiusPx, angleStart, angleEnd, tInner, middle, 192),
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
  for (let iteration = 0; iteration < 48; iteration += 1) {
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
  if (polygon.length < 6) return 0;
  const half = polygon.length / 2;
  const outerStart = polygon[0];
  const outerEnd = polygon[half - 1];
  const innerStart = polygon[polygon.length - 1];
  const innerEnd = polygon[half];
  const outer = Math.hypot(outerEnd.x - outerStart.x, outerEnd.y - outerStart.y) / scale;
  const inner = Math.hypot(innerEnd.x - innerStart.x, innerEnd.y - innerStart.y) / scale;
  return (outer + inner) / 2;
}

function averageDepthM(polygon: XY[], scale: number): number {
  if (polygon.length < 6) return 0;
  const half = polygon.length / 2;
  const left = Math.hypot(polygon[0].x - polygon[polygon.length - 1].x, polygon[0].y - polygon[polygon.length - 1].y) / scale;
  const right = Math.hypot(polygon[half - 1].x - polygon[half].x, polygon[half - 1].y - polygon[half].y) / scale;
  return (left + right) / 2;
}

function circlePolygon(center: XY, radiusM: number, scale: number, steps = 48): XY[] {
  const radius = radiusM * scale;
  return Array.from({ length: steps }, (_, index) => {
    const angle = (index * Math.PI * 2) / steps;
    return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
  });
}

function ellipsePolygon(center: XY, radiusXM: number, radiusYM: number, rotation: number, scale: number, steps = 32): XY[] {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return Array.from({ length: steps }, (_, index) => {
    const angle = (index * Math.PI * 2) / steps;
    const x = Math.cos(angle) * radiusXM * scale;
    const y = Math.sin(angle) * radiusYM * scale;
    return {
      x: center.x + x * cos - y * sin,
      y: center.y + x * sin + y * cos,
    };
  });
}

function orientedRectangle(center: XY, widthM: number, depthM: number, rotation: number, scale: number): XY[] {
  const tangent = { x: Math.cos(rotation), y: Math.sin(rotation) };
  const normal = { x: -tangent.y, y: tangent.x };
  const halfWidth = (widthM * scale) / 2;
  const halfDepth = (depthM * scale) / 2;
  return [
    { x: center.x - tangent.x * halfWidth - normal.x * halfDepth, y: center.y - tangent.y * halfWidth - normal.y * halfDepth },
    { x: center.x + tangent.x * halfWidth - normal.x * halfDepth, y: center.y + tangent.y * halfWidth - normal.y * halfDepth },
    { x: center.x + tangent.x * halfWidth + normal.x * halfDepth, y: center.y + tangent.y * halfWidth + normal.y * halfDepth },
    { x: center.x - tangent.x * halfWidth + normal.x * halfDepth, y: center.y - tangent.y * halfWidth + normal.y * halfDepth },
  ];
}

function createResidentialDrafts(outerEnvelope: XY[], center: XY, scale: number): { drafts: DraftLot[]; ringGaps: RingGap[] } {
  const drafts: DraftLot[] = [];
  const ringGaps: RingGap[] = [];
  const innerRadiusPx = INNER_OASIS_RADIUS_M * scale;
  const villageAngles = createVillageAngles(center, outerEnvelope, innerRadiusPx, scale);

  for (let villageIndex = 0; villageIndex < VILLAGE_COUNT; villageIndex += 1) {
    const { angleStart, angleEnd } = villageAngles[villageIndex];
    const rowTargets = VILLAGE_ROW_TARGETS[villageIndex];
    let tStart = 0;

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
        const polygon = sectorPolygon(
          center,
          outerEnvelope,
          innerRadiusPx,
          currentAngle,
          nextAngle,
          tStart,
          tEnd,
          24,
        );
        drafts.push({
          polygon,
          blockId: `C${villageIndex + 1}`,
          villageIndex,
          typology: target.typology,
          targetAreaM2: target.areaM2,
          frontageM: averageFrontageM(polygon, scale),
          depthM: averageDepthM(polygon, scale),
          center: centroid(polygon),
        });
        currentAngle = nextAngle;
      });

      if (rowIndex < rowTargets.length - 1) {
        const availableRadius = Math.min(...Array.from({ length: 25 }, (_, sampleIndex) => {
          const angle = angleStart + ((angleEnd - angleStart) * sampleIndex) / 24;
          return rayIntersectionDistance(center, angle, outerEnvelope) - innerRadiusPx;
        }));
        const tGap = (RING_PATH_RESERVE_M * scale) / availableRadius;
        ringGaps.push({
          villageIndex,
          rowIndex,
          angleStart,
          angleEnd,
          t: tEnd + tGap / 2,
        });
        tStart = tEnd + tGap;
      }
    });
  }

  return { drafts, ringGaps };
}

function createLegacyAssignment(drafts: DraftLot[]): number[] {
  const assignment = new Array<number>(drafts.length).fill(0);
  const largestDraftIndices = drafts
    .map((draft, index) => ({ index, area: draft.targetAreaM2 }))
    .sort((a, b) => b.area - a.area || a.index - b.index)
    .map((entry) => entry.index);

  COMMITTED_LEGACY_NUMBERS.forEach((legacyNumber, index) => {
    assignment[largestDraftIndices[index]] = legacyNumber;
  });

  const unassignedDraftIndices = assignment
    .map((legacyNumber, index) => ({ legacyNumber, index }))
    .filter((entry) => entry.legacyNumber === 0)
    .map((entry) => entry.index);

  OFFER_LEGACY_NUMBERS.forEach((legacyNumber, index) => {
    assignment[unassignedDraftIndices[index]] = legacyNumber;
  });

  const protectedNumbers = new Set([...COMMITTED_LEGACY_NUMBERS, ...OFFER_LEGACY_NUMBERS]);
  const availableLegacyNumbers = Array.from({ length: 312 }, (_, index) => index + 1)
    .filter((number) => !protectedNumbers.has(number));
  let availableIndex = 0;
  for (let index = 0; index < assignment.length; index += 1) {
    if (assignment[index] !== 0) continue;
    assignment[index] = availableLegacyNumbers[availableIndex];
    availableIndex += 1;
  }
  return assignment;
}

function createResidentialLots(drafts: DraftLot[], scale: number): Lot[] {
  const legacyAssignment = createLegacyAssignment(drafts);
  return drafts.map((draft, index) => {
    const legacyNumber = legacyAssignment[index];
    const id = `LOTE-${legacyNumber}`;
    const status = ((lotsStatusMap as Record<string, LotStatus>)[id] ?? "available") as LotStatus;
    const areaM2 = Math.round(polygonAreaM2(draft.polygon, scale) * 100) / 100;
    const pricePerM2 = getLotPricePerM2(draft.typology);
    const price = Math.round(areaM2 * pricePerM2);
    const frontage = Math.round(draft.frontageM * 100) / 100;
    const depth = Math.round(draft.depthM * 100) / 100;
    const buildableCircle = largestBuildableCircle(draft.polygon, scale);
    const buildableCircleDiameterM = Math.max(0, buildableCircle.radiusM * 2);

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
      placementSource: "masterplan-v2",
      masterplanVersion: CONSTELLATION_MASTERPLAN_VERSION,
      commercialPriceVersion: COMMERCIAL_PRICE_VERSION,
      buildableCircleCenter: buildableCircle.center,
      buildableCircleDiameterM: Math.round(buildableCircleDiameterM * 100) / 100,
      fitsDome4m: buildableCircleDiameterM >= 4,
      fitsDome8m: buildableCircleDiameterM >= 8,
      recommendedDomeDiameterM: buildableCircleDiameterM >= 8 ? 8 : buildableCircleDiameterM >= 4 ? 4 : undefined,
    };
  });
}

function inwardNormal(start: XY, end: XY, polygonCenter: XY): XY {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const tangent = { x: dx / length, y: dy / length };
  const candidate = { x: -tangent.y, y: tangent.x };
  const edgeMiddle = pointOnSegment(start, end, 0.5);
  const towardCenter = { x: polygonCenter.x - edgeMiddle.x, y: polygonCenter.y - edgeMiddle.y };
  const dot = candidate.x * towardCenter.x + candidate.y * towardCenter.y;
  return dot >= 0 ? candidate : { x: -candidate.x, y: -candidate.y };
}

function parkingRectangle(
  edgeStart: XY,
  edgeEnd: XY,
  stationAlongPx: number,
  scale: number,
  polygonCenter: XY,
): XY[] {
  const dx = edgeEnd.x - edgeStart.x;
  const dy = edgeEnd.y - edgeStart.y;
  const edgeLength = Math.hypot(dx, dy) || 1;
  const tangent = { x: dx / edgeLength, y: dy / edgeLength };
  const normal = inwardNormal(edgeStart, edgeEnd, polygonCenter);
  const base = {
    x: edgeStart.x + tangent.x * stationAlongPx - normal.x * 5.5 * scale,
    y: edgeStart.y + tangent.y * stationAlongPx - normal.y * 5.5 * scale,
  };
  const widthPx = 2.5 * scale;
  const depthPx = 5 * scale;
  return [
    base,
    { x: base.x + tangent.x * widthPx, y: base.y + tangent.y * widthPx },
    { x: base.x + tangent.x * widthPx + normal.x * depthPx, y: base.y + tangent.y * widthPx + normal.y * depthPx },
    { x: base.x + normal.x * depthPx, y: base.y + normal.y * depthPx },
  ];
}

export function createParkingLots(innerBuffer: XY[], scale: number, privateParkingTarget: number): { privateParkings: Lot[]; commonParkings: Lot[] } {
  const privateParkings: Lot[] = [];
  const commonParkings: Lot[] = [];
  const polygonCenter = centroid(innerBuffer);
  const centersByEdge = [
    [0.14, 0.5, 0.86],
    [0.14, 0.5, 0.86],
    [0.14, 0.5, 0.86],
    [0.14, 0.5, 0.86],
  ];
  let privateCounter = 1;
  let commonCounter = 1;
  let stationIndex = 0;
  const stationTotal = centersByEdge.flat().length;
  const privatePerStation = Math.floor(privateParkingTarget / stationTotal);
  const remainder = privateParkingTarget % stationTotal;
  const extraStations = new Set(
    Array.from({ length: remainder }, (_, index) => Math.floor(((index + 0.5) * stationTotal) / remainder)),
  );

  for (let edgeIndex = 0; edgeIndex < innerBuffer.length; edgeIndex += 1) {
    const edgeStart = innerBuffer[edgeIndex];
    const edgeEnd = innerBuffer[(edgeIndex + 1) % innerBuffer.length];
    const edgeLength = Math.hypot(edgeEnd.x - edgeStart.x, edgeEnd.y - edgeStart.y);

    for (const stationCenterRatio of centersByEdge[edgeIndex]) {
      const commonCount = stationIndex % 2 === 0 ? 2 : 1;
      const privateCount = privatePerStation + (extraStations.has(stationIndex) ? 1 : 0);
      const stationCount = privateCount + commonCount;
      const stationWidthPx = stationCount * 2.5 * scale;
      const stationStartPx = edgeLength * stationCenterRatio - stationWidthPx / 2;

      for (let slotIndex = 0; slotIndex < stationCount; slotIndex += 1) {
        const polygon = parkingRectangle(
          edgeStart,
          edgeEnd,
          stationStartPx + slotIndex * 2.5 * scale,
          scale,
          polygonCenter,
        );
        const isCommon = slotIndex >= privateCount;
        if (isCommon) {
          const id = `V${String(commonCounter).padStart(3, "0")}`;
          commonParkings.push({
            id,
            blockId: "PARKING-COMMON",
            projectId: "moon-paracas",
            typology: "parking-external",
            status: "available",
            areaM2: 12.5,
            polygon,
            dimensions: "2.50m × 5.00m",
            priceLabel: "Uso común",
            price: 0,
            number: id,
            quadrant: `ESTACION-${stationIndex + 1}`,
            area: 12.5,
            elevation: 108,
            distanceToPool: 0,
            hubDistance: 0,
            frontage: 2.5,
            depth: 5,
            parking_type: "visita_accesible_servicio",
            walk_distance_parking_meters: 0,
            walk_distance_oasis_meters: 0,
            placementSource: "masterplan-v2",
            masterplanVersion: CONSTELLATION_MASTERPLAN_VERSION,
          });
          commonCounter += 1;
        } else {
          const id = `P${String(privateCounter).padStart(3, "0")}`;
          privateParkings.push({
            id,
            legacyId: privateCounter <= 138 ? id : undefined,
            blockId: "PARKING",
            projectId: "moon-paracas",
            typology: "parking",
            status: "available",
            areaM2: 12.5,
            polygon,
            dimensions: "2.50m × 5.00m",
            priceLabel: `S/ ${PRIVATE_PARKING_PRICE_PEN.toLocaleString("es-PE")}`,
            price: PRIVATE_PARKING_PRICE_PEN,
            number: id,
            quadrant: `ESTACION-${stationIndex + 1}`,
            area: 12.5,
            elevation: 108,
            distanceToPool: 0,
            hubDistance: 0,
            frontage: 2.5,
            depth: 5,
            price_soles: PRIVATE_PARKING_PRICE_PEN,
            parking_type: "orbita_perimetral",
            walk_distance_parking_meters: 0,
            walk_distance_oasis_meters: 0,
            placementSource: "masterplan-v2",
            masterplanVersion: CONSTELLATION_MASTERPLAN_VERSION,
            commercialPriceVersion: COMMERCIAL_PRICE_VERSION,
          });
          privateCounter += 1;
        }
      }
      stationIndex += 1;
    }
  }

  return { privateParkings, commonParkings };
}

function assignParkingAndDistances(residentialLots: Lot[], privateParkings: Lot[], oasisCenter: XY, scale: number): Lot[] {
  if (residentialLots.length !== privateParkings.length) {
    throw new Error("La asignación exige una cochera privada por lote residencial.");
  }

  const lotCenters = residentialLots.map((lot) => centroid(lot.polygon));
  const parkingCenters = privateParkings.map((parking) => centroid(parking.polygon));
  const count = residentialLots.length;
  const potentialsRows = new Array<number>(count + 1).fill(0);
  const potentialsColumns = new Array<number>(count + 1).fill(0);
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
        const overDistancePenalty = squaredDistance > preferredWalkPx * preferredWalkPx ? 1_000_000_000 : 0;
        const reducedCost = squaredDistance + overDistancePenalty - potentialsRows[currentRow] - potentialsColumns[column];
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
          potentialsRows[matchedRowByColumn[column]] += delta;
          potentialsColumns[column] -= delta;
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
    if (!parking) throw new Error(`No se pudo asignar cochera al lote ${lot.id}.`);
    const lotCenter = centroid(lot.polygon);
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

function createRoads(innerBuffer: XY[], outerEnvelope: XY[], center: XY, ringGaps: RingGap[], scale: number): Road[] {
  const orbit = createInnerBuffer(innerBuffer, 4 * scale);
  const roads: Road[] = [
    {
      id: "ORBITA-MOON",
      kind: "primary",
      widthM: 6,
      path: [...orbit, orbit[0]],
    },
    {
      id: "ACCESO-PRINCIPAL",
      kind: "primary",
      widthM: 6,
      path: [pointOnSegment(innerBuffer[0], innerBuffer[1], 0.6), pointOnSegment(orbit[0], orbit[1], 0.6)],
    },
  ];

  const innerRadiusPx = INNER_OASIS_RADIUS_M * scale;
  const villageAngles = createVillageAngles(center, outerEnvelope, innerRadiusPx, scale);
  for (let villageIndex = 0; villageIndex < VILLAGE_COUNT; villageIndex += 1) {
    const angle = villageAngles[villageIndex].sectorStart;
    roads.push({
      id: `PASEO-RADIAL-${villageIndex + 1}`,
      kind: "pedestrian",
      widthM: RADIAL_PATH_WIDTH_M,
      path: [
        radialPoint(center, outerEnvelope, innerRadiusPx, angle, 0),
        radialPoint(center, outerEnvelope, innerRadiusPx, angle, 1),
      ],
    });
  }

  ringGaps.forEach((gap) => {
    const points = Array.from({ length: 49 }, (_, pointIndex) => {
      const angle = gap.angleStart + ((gap.angleEnd - gap.angleStart) * pointIndex) / 48;
      return radialPoint(center, outerEnvelope, innerRadiusPx, angle, gap.t);
    });
    roads.push({
      id: `SENDERO-ALDEA-${gap.villageIndex + 1}-${gap.rowIndex + 1}`,
      kind: "pedestrian",
      widthM: RING_PATH_WIDTH_M,
      path: points,
    });
  });

  return roads;
}

function createAmenities(center: XY, scale: number): Amenity[] {
  const oasisRotation = degreesToRadians(-42);
  const amenities: Amenity[] = [
    {
      id: "A_OASIS_CORE",
      kind: "sand-plaza",
      polygon: circlePolygon(center, INNER_OASIS_RADIUS_M - 1.8, scale, 64),
    },
    {
      id: "A_POOL",
      kind: "pool",
      polygon: ellipsePolygon(center, 22, 9, oasisRotation, scale),
    },
    {
      id: "A_CLUB",
      kind: "clubhouse",
      polygon: orientedRectangle(
        { x: center.x - 24 * scale, y: center.y + 3 * scale },
        18,
        9,
        oasisRotation,
        scale,
      ),
    },
    {
      id: "A_WATER_MIRROR",
      kind: "water-mirror",
      polygon: ellipsePolygon(
        { x: center.x + 24 * scale, y: center.y - 3 * scale },
        12,
        5,
        oasisRotation,
        scale,
      ),
    },
    {
      id: "A_YOGA",
      kind: "yoga-plaza",
      polygon: circlePolygon({ x: center.x + 4 * scale, y: center.y + 27 * scale }, 7, scale, 24),
    },
    {
      id: "A_MOON_DECK",
      kind: "moon-deck",
      polygon: orientedRectangle(
        { x: center.x - 4 * scale, y: center.y - 29 * scale },
        14,
        6,
        oasisRotation,
        scale,
      ),
    },
  ];

  amenities.forEach((amenity) => {
    amenity.areaM2 = Math.round(polygonAreaM2(amenity.polygon, scale));
  });
  return amenities;
}

function createBlocks(outerEnvelope: XY[], center: XY, scale: number): BlockPolygon[] {
  const innerRadiusPx = INNER_OASIS_RADIUS_M * scale;
  const villageAngles = createVillageAngles(center, outerEnvelope, innerRadiusPx, scale);
  return Array.from({ length: VILLAGE_COUNT }, (_, villageIndex) => {
    const { angleStart, angleEnd } = villageAngles[villageIndex];
    const middleAngle = (angleStart + angleEnd) / 2;
    return {
      id: `C${villageIndex + 1}`,
      role: "constellation-village",
      polygon: sectorPolygon(center, outerEnvelope, innerRadiusPx, angleStart, angleEnd, 0, 1, 18),
      labelPoint: radialPoint(center, outerEnvelope, innerRadiusPx, middleAngle, 0.55),
      vehiclesAllowed: false,
    };
  });
}

function createConstellationMasterplan() {
  const terrainScene = buildTerrainScene();
  const scale = getMeterToSvgScale();
  const outerEnvelope = createInnerBuffer(terrainScene.innerBuffer, RESIDENTIAL_ENVELOPE_OFFSET_M * scale);
  const center = centroid(outerEnvelope);
  const { drafts, ringGaps } = createResidentialDrafts(outerEnvelope, center, scale);
  const residentialCandidates = createResidentialLots(drafts, scale);
  const releasedLots = residentialCandidates.filter(
    (lot) => (lot.buildableCircleDiameterM ?? 0) < MIN_BUILDABLE_CIRCLE_DIAMETER_M,
  );
  const residentialBase = residentialCandidates
    .filter((lot) => (lot.buildableCircleDiameterM ?? 0) >= MIN_BUILDABLE_CIRCLE_DIAMETER_M)
    .map((lot, index) => ({ ...lot, number: index + 1 }));
  const { privateParkings, commonParkings } = createParkingLots(
    terrainScene.innerBuffer,
    scale,
    residentialBase.length,
  );
  const residentialLots = assignParkingAndDistances(residentialBase, privateParkings, center, scale);
  const roads = createRoads(terrainScene.innerBuffer, outerEnvelope, center, ringGaps, scale);
  const pocketGardens: Amenity[] = releasedLots.map((lot, index) => ({
    id: `A_POCKET_GARDEN_${String(index + 1).padStart(2, "0")}`,
    kind: "pocket-garden",
    polygon: lot.polygon,
    areaM2: lot.areaM2,
  }));
  const amenities = [...createAmenities(center, scale), ...pocketGardens];
  const blocks = createBlocks(outerEnvelope, center, scale);
  const parkings = [...privateParkings, ...commonParkings];
  const allLots = [...residentialLots, ...parkings];
  const roadPolys = roads.map((road) => roadToPolygon(road.path, road.widthM, scale));

  return {
    masterplanVersion: CONSTELLATION_MASTERPLAN_VERSION,
    terrainScene,
    scale,
    center,
    outerEnvelope,
    blocks,
    roads,
    amenities,
    releasedLots,
    releasedAreaM2: releasedLots.reduce((sum, lot) => sum + lot.areaM2, 0),
    roadPolys,
    activeBuildings: amenities.map((amenity) => amenity.polygon),
    residentialLots,
    privateParkings,
    commonParkings,
    parkings,
    allLots,
  };
}

export type ConstellationMasterplan = ReturnType<typeof createConstellationMasterplan>;

let cachedMasterplan: ConstellationMasterplan | undefined;

export function buildConstellationMasterplan(): ConstellationMasterplan {
  cachedMasterplan ??= createConstellationMasterplan();
  return cachedMasterplan;
}
