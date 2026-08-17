import lotsStatusMap from "../data/lots_status.json";
import type { Amenity, BlockPolygon, Lot, LotStatus, LotTypology, Road, XY } from "../types/map";
import { COMMERCIAL_PRICE_VERSION, getLotPricePerM2, PRIVATE_PARKING_PRICE_PEN } from "../config/pricing";
import { centroid, roadToPolygon } from "./geometry";
import { roundPolygonCorners } from "./polygonOffset";
import { buildConstellationMasterplan, createParkingLots } from "./constellationModel";
import { buildOrganicConstellationMasterplan, organicGeometryInternals } from "./organicConstellationModel";

export const COURTYARD_MASTERPLAN_VERSION = "moon-constellations-v4";
export const COURTYARD_MASTERPLAN_LABEL = "Moon Constellations V4";
export const COURTYARD_RESIDENTIAL_COUNT = 282;
export const COURTYARD_OASIS_AREA_M2 = 5_000;
export const COURTYARD_MIN_BUILDABLE_DIAMETER_M = 8.25;

const INNER_RESIDENTIAL_RADIUS_M = 45.5;
const OASIS_RADIUS_M = Math.sqrt(COURTYARD_OASIS_AREA_M2 / Math.PI);
const CORNER_ROUNDING_M = 48;
const VILLAGE_GAP_DEG = 6;
const GREEN_PAUSE_DEG = 2.2;
const RING_PATH_WIDTH_M = 4;
const RING_PATH_RESERVE_M = 4.5;
const RADIAL_PATH_WIDTH_M = 4;
const ROW_SIDE_INSET_DEG = [4, 3, 2, 1, 0, 0];
const INTERNAL_GARDEN_GAP_DEG = 3;

const {
  degreesToRadians,
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
} = organicGeometryInternals;

type Side = "left" | "top" | "right" | "bottom";

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
  center: XY;
  frontageM: number;
  depthM: number;
};

type RingGap = {
  villageIndex: number;
  subIndex: number;
  rowIndex: number;
  angleStart: number;
  angleEnd: number;
  t: number;
};

type GreenPause = {
  villageIndex: number;
  rowIndex: number;
  polygon: XY[];
};

type VillageAngles = {
  side: Side;
  sectorStart: number;
  sectorEnd: number;
  angleStart: number;
  angleEnd: number;
};

type RowPath = {
  villageIndex: number;
  rowIndex: number;
  path: XY[];
};

function targets(count: number, areaM2: 120 | 240): RowTarget[] {
  return Array.from({ length: count }, () => ({
    typology: areaM2 === 240 ? "premium" as const : "tiny-house" as const,
    areaM2,
  }));
}

function mixedTargets(count: number, largeCount: number): RowTarget[] {
  return Array.from({ length: count }, (_, index) => {
    const large = Math.floor(((index + 1) * largeCount) / count) > Math.floor((index * largeCount) / count);
    return {
      typology: large ? "premium" as const : "tiny-house" as const,
      areaM2: large ? 240 : 120,
    };
  });
}

const LARGE_VILLAGE_ROWS: RowTarget[][] = [
  targets(6, 120),
  targets(8, 120),
  targets(10, 120),
  targets(13, 120),
  targets(16, 120),
  targets(21, 120),
];

const SOUTH_VILLAGE_ROWS: RowTarget[][] = [
  targets(5, 120),
  targets(7, 120),
  targets(9, 120),
  targets(12, 120),
  targets(15, 120),
  targets(20, 120),
];

const PROTECTED_STATUSES = new Set<LotStatus>(["sold", "reserved", "offer", "blocked"]);

function normalizeAngle(angle: number): number {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

function sideForAngle(angle: number): Side {
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  if (Math.abs(x) > Math.abs(y)) return x > 0 ? "right" : "left";
  return y > 0 ? "bottom" : "top";
}

function createVillageAngles(corners: XY[], center: XY): VillageAngles[] {
  const cornerAngles = corners
    .map((corner) => normalizeAngle(Math.atan2(corner.y - center.y, corner.x - center.x)))
    .sort((a, b) => a - b);
  const halfGap = degreesToRadians(VILLAGE_GAP_DEG) / 2;
  const sectors = cornerAngles.map((sectorStart, index) => {
    const rawEnd = cornerAngles[(index + 1) % cornerAngles.length];
    const sectorEnd = rawEnd <= sectorStart ? rawEnd + Math.PI * 2 : rawEnd;
    return {
      side: sideForAngle((sectorStart + sectorEnd) / 2),
      sectorStart,
      sectorEnd,
      angleStart: sectorStart + halfGap,
      angleEnd: sectorEnd - halfGap,
    };
  });
  const order: Side[] = ["left", "top", "right", "bottom"];
  return order.map((side) => {
    const sector = sectors.find((candidate) => candidate.side === side);
    if (!sector) throw new Error(`V4 no pudo construir la aldea ${side}.`);
    return sector;
  });
}

function pauseIndexes(lotCount: number): Set<number> {
  if (lotCount < 6) return new Set();
  if (lotCount >= 13) return new Set([Math.floor(lotCount / 3), Math.floor((lotCount * 2) / 3)]);
  return new Set([Math.floor(lotCount / 2)]);
}

function requiredEndAngle(
  center: XY,
  outerEnvelope: XY[],
  innerRadiusPx: number,
  angleStart: number,
  angleEnd: number,
  tStart: number,
  tEnd: number,
  rowTargets: RowTarget[],
  pauses: Set<number>,
  scale: number,
): number {
  const pauseAngle = degreesToRadians(GREEN_PAUSE_DEG);
  let currentAngle = angleStart;
  for (let index = 0; index < rowTargets.length; index += 1) {
    const target = rowTargets[index];
    const capacity = polygonAreaM2(
      sectorPolygon(center, outerEnvelope, innerRadiusPx, currentAngle, angleEnd, tStart, tEnd, 48),
      scale,
    );
    if (capacity + 0.01 < target.areaM2) return Number.POSITIVE_INFINITY;
    currentAngle = solveAngleCut(
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
    if (pauses.has(index + 1)) currentAngle += pauseAngle;
  }
  return currentAngle;
}

function solveRowOuterT(
  center: XY,
  outerEnvelope: XY[],
  innerRadiusPx: number,
  angleStart: number,
  angleEnd: number,
  tStart: number,
  rowTargets: RowTarget[],
  pauses: Set<number>,
  scale: number,
): number {
  const maximumEnd = requiredEndAngle(
    center,
    outerEnvelope,
    innerRadiusPx,
    angleStart,
    angleEnd,
    tStart,
    1,
    rowTargets,
    pauses,
    scale,
  );
  if (maximumEnd > angleEnd + 1e-7) {
    const targetArea = rowTargets.reduce((sum, target) => sum + target.areaM2, 0);
    const grossCapacity = polygonAreaM2(
      sectorPolygon(center, outerEnvelope, innerRadiusPx, angleStart, angleEnd, tStart, 1, 96),
      scale,
    );
    throw new Error(`V4 no tiene cabida para banda de ${rowTargets.length} lotes / ${targetArea} m² desde t=${tStart.toFixed(3)}; capacidad bruta ${grossCapacity.toFixed(1)} m².`);
  }

  let low = tStart;
  let high = 1;
  for (let iteration = 0; iteration < 48; iteration += 1) {
    const middle = (low + high) / 2;
    const required = requiredEndAngle(
      center,
      outerEnvelope,
      innerRadiusPx,
      angleStart,
      angleEnd,
      tStart,
      middle,
      rowTargets,
      pauses,
      scale,
    );
    if (required > angleEnd) low = middle;
    else high = middle;
  }
  return high;
}

function createDrafts(outerEnvelope: XY[], originalCorners: XY[], center: XY, scale: number) {
  const drafts: DraftLot[] = [];
  const ringGaps: RingGap[] = [];
  const greenPauses: GreenPause[] = [];
  const rowEndsByVillage: number[] = [];
  const innerRadiusPx = INNER_RESIDENTIAL_RADIUS_M * scale;
  const villageAngles = createVillageAngles(originalCorners, center);
  const pauseAngle = degreesToRadians(GREEN_PAUSE_DEG);

  villageAngles.forEach(({ angleStart, angleEnd, side }, villageIndex) => {
    const rows = side === "bottom" ? SOUTH_VILLAGE_ROWS : LARGE_VILLAGE_ROWS;
    const middleAngle = (angleStart + angleEnd) / 2;
    const internalHalfGap = degreesToRadians(INTERNAL_GARDEN_GAP_DEG) / 2;
    const subSectors = [
      { start: angleStart, end: middleAngle - internalHalfGap },
      { start: middleAngle + internalHalfGap, end: angleEnd },
    ];

    subSectors.forEach((subSector, subIndex) => {
      let tStart = 0;
      rows.forEach((fullRowTargets, rowIndex) => {
        const splitIndex = Math.ceil(fullRowTargets.length / 2);
        const rowTargets = subIndex === 0
          ? fullRowTargets.slice(0, splitIndex)
          : fullRowTargets.slice(splitIndex);
        const rowInset = degreesToRadians(ROW_SIDE_INSET_DEG[rowIndex] ?? 0);
        const rowAngleStart = subSector.start + rowInset;
        const rowAngleEnd = subSector.end - rowInset;
        const pauses = pauseIndexes(rowTargets.length);
        const availableRadius = Math.min(...Array.from({ length: 17 }, (_, sampleIndex) => {
          const angle = rowAngleStart + ((rowAngleEnd - rowAngleStart) * sampleIndex) / 16;
          return rayIntersectionDistance(center, angle, outerEnvelope) - innerRadiusPx;
        }));
        const tEnd = solveRowOuterT(
          center,
          outerEnvelope,
          innerRadiusPx,
          rowAngleStart,
          rowAngleEnd,
          tStart,
          rowTargets,
          pauses,
          scale,
        );

        if (rowAngleStart > subSector.start) {
          greenPauses.push({
            villageIndex,
            rowIndex,
            polygon: sectorPolygon(center, outerEnvelope, innerRadiusPx, subSector.start, rowAngleStart, tStart, tEnd, 12),
          });
        }

        let currentAngle = rowAngleStart;
        rowTargets.forEach((target, lotIndex) => {
          const nextAngle = solveAngleCut(
            center,
            outerEnvelope,
            innerRadiusPx,
            currentAngle,
            rowAngleEnd,
            tStart,
            tEnd,
            target.areaM2,
            scale,
          );
          const rawPolygon = sectorPolygon(center, outerEnvelope, innerRadiusPx, currentAngle, nextAngle, tStart, tEnd, 24);
          const polygon = roundPrimaryLotCorners(rawPolygon, 0.45 * scale);
          drafts.push({
            polygon,
            blockId: `C${villageIndex + 1}`,
            villageIndex,
            rowIndex,
            typology: target.typology,
            center: centroid(polygon),
            frontageM: averageFrontageM(rawPolygon, scale),
            depthM: averageDepthM(rawPolygon, scale),
          });
          currentAngle = nextAngle;

          if (pauses.has(lotIndex + 1)) {
            const pauseEnd = currentAngle + pauseAngle;
            greenPauses.push({
              villageIndex,
              rowIndex,
              polygon: sectorPolygon(center, outerEnvelope, innerRadiusPx, currentAngle, pauseEnd, tStart, tEnd, 12),
            });
            currentAngle = pauseEnd;
          }
        });

        if (rowAngleEnd > currentAngle) {
          greenPauses.push({
            villageIndex,
            rowIndex,
            polygon: sectorPolygon(center, outerEnvelope, innerRadiusPx, currentAngle, rowAngleEnd, tStart, tEnd, 12),
          });
        }
        if (subSector.end > rowAngleEnd) {
          greenPauses.push({
            villageIndex,
            rowIndex,
            polygon: sectorPolygon(center, outerEnvelope, innerRadiusPx, rowAngleEnd, subSector.end, tStart, tEnd, 12),
          });
        }

        if (rowIndex < rows.length - 1) {
          const tGap = (RING_PATH_RESERVE_M * scale) / availableRadius;
          ringGaps.push({ villageIndex, subIndex, rowIndex, angleStart: rowAngleStart, angleEnd: rowAngleEnd, t: tEnd + tGap / 2 });
          tStart = tEnd + tGap;
        }
        rowEndsByVillage[villageIndex] = Math.max(rowEndsByVillage[villageIndex] ?? 0, tEnd);
      });
    });
  });

  return { drafts, ringGaps, greenPauses, rowEndsByVillage, villageAngles };
}

function pointInsidePolygon(point: XY, polygon: XY[]): boolean {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const a = polygon[index];
    const b = polygon[previous];
    const intersects = (a.y > point.y) !== (b.y > point.y)
      && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

function inwardNormal(start: XY, end: XY, center: XY): XY {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const candidate = { x: -dy / length, y: dx / length };
  const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const towardCenter = { x: center.x - midpoint.x, y: center.y - midpoint.y };
  return candidate.x * towardCenter.x + candidate.y * towardCenter.y >= 0
    ? candidate
    : { x: -candidate.x, y: -candidate.y };
}

function orientedRectangle(
  edgeStart: XY,
  tangent: XY,
  normal: XY,
  alongPx: number,
  inwardPx: number,
  frontagePx: number,
  depthPx: number,
): XY[] {
  const base = {
    x: edgeStart.x + tangent.x * alongPx + normal.x * inwardPx,
    y: edgeStart.y + tangent.y * alongPx + normal.y * inwardPx,
  };
  return [
    base,
    { x: base.x + tangent.x * frontagePx, y: base.y + tangent.y * frontagePx },
    {
      x: base.x + tangent.x * frontagePx + normal.x * depthPx,
      y: base.y + tangent.y * frontagePx + normal.y * depthPx,
    },
    { x: base.x + normal.x * depthPx, y: base.y + normal.y * depthPx },
  ];
}

function rowRequiredWidth(count: number, frontageM: number): number {
  if (count <= 0) return 0;
  const baseGapM = 0.4;
  const clusterBreaks = Math.floor((count - 1) / 7);
  return count * frontageM + (count - 1) * baseGapM + clusterBreaks * (3.5 - baseGapM);
}

function rowCapacity(availableWidthM: number, frontageM: number): number {
  let count = 0;
  while (rowRequiredWidth(count + 1, frontageM) <= availableWidthM + 1e-6) count += 1;
  return count;
}

function allocateRowCounts(capacities: number[], desired: number[], target: number): number[] {
  const counts = desired.map((count, index) => Math.min(count, capacities[index]));
  let missing = target - counts.reduce((sum, count) => sum + count, 0);
  while (missing > 0) {
    let changed = false;
    for (let index = 0; index < counts.length && missing > 0; index += 1) {
      if (counts[index] >= capacities[index]) continue;
      counts[index] += 1;
      missing -= 1;
      changed = true;
    }
    if (!changed) throw new Error(`V4 solo alcanza ${target - missing}/${target} lotes en una aldea ortogonal.`);
  }
  return counts;
}

function createReferenceDrafts(outerEnvelope: XY[], originalCorners: XY[], center: XY, scale: number) {
  const drafts: DraftLot[] = [];
  const greenPauses: GreenPause[] = [];
  const rowPaths: RowPath[] = [];
  const villageAngles = createVillageAngles(originalCorners, center);
  const edges = originalCorners.map((start, index) => {
    const end = originalCorners[(index + 1) % originalCorners.length];
    const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    return { start, end, side: sideForAngle(Math.atan2(midpoint.y - center.y, midpoint.x - center.x)) };
  });
  const premiumRowSpecs = [
    { typology: "premium" as const, frontageM: 12.5, depthM: 19.2 },
    ...Array.from({ length: 4 }, () => ({ typology: "tiny-house" as const, frontageM: 9.2, depthM: 120 / 9.2 })),
  ];
  const compactRowSpecs = Array.from({ length: 5 }, () => ({
    typology: "tiny-house" as const,
    frontageM: 9.2,
    depthM: 120 / 9.2,
  }));
  const pedestrianGapM = 4.1;
  const sideOrder: Side[] = ["left", "top", "right", "bottom"];

  sideOrder.forEach((side, villageIndex) => {
    const villageSector = villageAngles[villageIndex];
    const rowSpecs = side === "bottom" ? compactRowSpecs : premiumRowSpecs;
    const edge = edges.find((candidate) => candidate.side === side);
    if (!edge) throw new Error(`V4 no encontró el borde ${side}.`);
    const dx = edge.end.x - edge.start.x;
    const dy = edge.end.y - edge.start.y;
    const edgeLengthPx = Math.hypot(dx, dy);
    const tangent = { x: dx / edgeLengthPx, y: dy / edgeLengthPx };
    const normal = inwardNormal(edge.start, edge.end, center);
    let inwardM = 1;

    const rowIntervals = rowSpecs.map((spec) => {
      const frontagePx = spec.frontageM * scale;
      const depthPx = spec.depthM * scale;
      const validStarts: number[] = [];
      for (let alongPx = 0; alongPx <= edgeLengthPx - frontagePx; alongPx += 0.5 * scale) {
        const polygon = orientedRectangle(
          edge.start,
          tangent,
          normal,
          alongPx,
          inwardM * scale,
          frontagePx,
          depthPx,
        );
        const valid = polygon.every((point) => pointInsidePolygon(point, outerEnvelope))
          && polygon.every((point) => Math.hypot(point.x - center.x, point.y - center.y) >= INNER_RESIDENTIAL_RADIUS_M * scale)
          && polygon.every((point) => {
            let angle = normalizeAngle(Math.atan2(point.y - center.y, point.x - center.x));
            while (angle < villageSector.sectorStart) angle += Math.PI * 2;
            return angle >= villageSector.angleStart && angle <= villageSector.angleEnd;
          });
        if (valid) validStarts.push(alongPx);
      }
      if (!validStarts.length) throw new Error(`V4 no encontró franja válida ${side} a ${inwardM.toFixed(1)} m.`);
      const minimum = Math.min(...validStarts);
      const maximum = Math.max(...validStarts) + frontagePx;
      const result = { ...spec, inwardM, minimum, maximum, availableWidthM: (maximum - minimum) / scale };
      inwardM += spec.depthM + pedestrianGapM;
      return result;
    });

    const targetCountBySide: Record<Side, number> = { left: 74, top: 67, right: 74, bottom: 67 };
    const desiredBySide: Record<Side, number[]> = {
      left: [20, 20, 16, 13, 5],
      top: [18, 18, 15, 12, 4],
      right: [20, 20, 16, 13, 5],
      bottom: [18, 18, 15, 12, 4],
    };
    const targetCount = targetCountBySide[side];
    const desired = desiredBySide[side];
    const capacities = rowIntervals.map((row) => rowCapacity(row.availableWidthM, row.frontageM));
    if (capacities.reduce((sum, count) => sum + count, 0) < targetCount) {
      throw new Error(`V4 ${side}: capacidades ${capacities.join("/")} no alcanzan ${targetCount} lotes.`);
    }
    const counts = allocateRowCounts(capacities, desired, targetCount);

    rowIntervals.forEach((row, rowIndex) => {
      const count = counts[rowIndex];
      const requiredM = rowRequiredWidth(count, row.frontageM);
      const leadingM = rowIndex === rowIntervals.length - 1
        ? 0
        : Math.max(0, (row.availableWidthM - requiredM) / 2);
      let cursorM = row.minimum / scale + leadingM;
      const frontagePx = row.frontageM * scale;
      const depthPx = row.depthM * scale;
      for (let lotIndex = 0; lotIndex < count; lotIndex += 1) {
        let rawPolygon = orientedRectangle(
          edge.start,
          tangent,
          normal,
          cursorM * scale,
          row.inwardM * scale,
          frontagePx,
          depthPx,
        );
        const isValidPlacedLot = (candidate: XY[]) => candidate.every((point) => pointInsidePolygon(point, outerEnvelope))
          && candidate.every((point) => Math.hypot(point.x - center.x, point.y - center.y) >= INNER_RESIDENTIAL_RADIUS_M * scale)
          && candidate.every((point) => {
            let angle = normalizeAngle(Math.atan2(point.y - center.y, point.x - center.x));
            while (angle < villageSector.sectorStart) angle += Math.PI * 2;
            return angle >= villageSector.angleStart && angle <= villageSector.angleEnd;
          });
        while (!isValidPlacedLot(rawPolygon) && (cursorM + row.frontageM) * scale <= row.maximum + 1e-6) {
          cursorM += 0.25;
          rawPolygon = orientedRectangle(
            edge.start,
            tangent,
            normal,
            cursorM * scale,
            row.inwardM * scale,
            frontagePx,
            depthPx,
          );
        }
        if (!isValidPlacedLot(rawPolygon)) {
          throw new Error(`V4 ${side}, fila ${rowIndex + 1}: no caben ${count} lotes sin invadir reservas (lote ${lotIndex + 1}, cursor ${cursorM.toFixed(1)} m, máximo ${(row.maximum / scale).toFixed(1)} m, conteos ${counts.join("/")}, capacidades ${capacities.join("/")}).`);
        }
        const polygon = rawPolygon;
        drafts.push({
          polygon,
          blockId: `C${villageIndex + 1}`,
          villageIndex,
          rowIndex,
          typology: row.typology,
          center: centroid(polygon),
          frontageM: row.frontageM,
          depthM: row.depthM,
        });
        cursorM += row.frontageM;
        if (lotIndex >= count - 1) continue;
        const clusterBreak = (lotIndex + 1) % 7 === 0;
        const gapM = clusterBreak ? 3.5 : 0.4;
        if (clusterBreak) {
          const pausePolygon = orientedRectangle(
            edge.start,
            tangent,
            normal,
            cursorM * scale,
            row.inwardM * scale,
            gapM * scale,
            depthPx,
          );
          greenPauses.push({ villageIndex, rowIndex, polygon: pausePolygon });
        }
        cursorM += gapM;
      }

      if (rowIndex < rowIntervals.length - 1) {
        const pathDistanceM = row.inwardM + row.depthM + pedestrianGapM / 2;
        rowPaths.push({
          villageIndex,
          rowIndex,
          path: [
            {
              x: edge.start.x + tangent.x * row.minimum + normal.x * pathDistanceM * scale,
              y: edge.start.y + tangent.y * row.minimum + normal.y * pathDistanceM * scale,
            },
            {
              x: edge.start.x + tangent.x * row.maximum + normal.x * pathDistanceM * scale,
              y: edge.start.y + tangent.y * row.maximum + normal.y * pathDistanceM * scale,
            },
          ],
        });
      }
    });
  });

  return { drafts, greenPauses, rowPaths, villageAngles, rowEndsByVillage: [] as number[] };
}

function uniquePreviousLots(): Lot[] {
  const v3 = buildOrganicConstellationMasterplan();
  const v2 = buildConstellationMasterplan();
  const byId = new Map<string, Lot>();
  [...v3.residentialLots, ...v3.releasedLots, ...v2.releasedLots].forEach((lot) => {
    if (!byId.has(lot.id)) byId.set(lot.id, lot);
  });
  return [...byId.values()];
}

function assignStableIds(drafts: DraftLot[], previousLots: Lot[]) {
  const assignments = new Array<string>(drafts.length).fill("");
  const usedDrafts = new Set<number>();
  const usedIds = new Set<string>();

  const assignNearest = (lot: Lot) => {
    const sourceCenter = centroid(lot.polygon);
    let bestIndex = -1;
    let bestDistance = Number.POSITIVE_INFINITY;
    drafts.forEach((draft, index) => {
      if (usedDrafts.has(index)) return;
      const distance = (draft.center.x - sourceCenter.x) ** 2 + (draft.center.y - sourceCenter.y) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    if (bestIndex < 0) return;
    assignments[bestIndex] = lot.id;
    usedDrafts.add(bestIndex);
    usedIds.add(lot.id);
  };

  previousLots
    .filter((lot) => PROTECTED_STATUSES.has(lot.status))
    .sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true }))
    .forEach(assignNearest);
  previousLots
    .filter((lot) => !usedIds.has(lot.id))
    .sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true }))
    .forEach((lot) => {
      if (usedDrafts.size < drafts.length) assignNearest(lot);
    });

  let nextNumber = Math.max(...previousLots.map((lot) => Number(lot.id.match(/\d+/)?.[0] ?? 0))) + 1;
  assignments.forEach((id, index) => {
    if (id) return;
    while (usedIds.has(`LOTE-${nextNumber}`)) nextNumber += 1;
    const generatedId = `LOTE-${nextNumber}`;
    assignments[index] = generatedId;
    usedIds.add(generatedId);
    nextNumber += 1;
  });

  return {
    assignments,
    retiredIds: previousLots.filter((lot) => !usedIds.has(lot.id)).map((lot) => lot.id),
    previousById: new Map(previousLots.map((lot) => [lot.id, lot])),
  };
}

function createResidentialLots(
  drafts: DraftLot[],
  assignments: string[],
  previousById: Map<string, Lot>,
  scale: number,
): Lot[] {
  return drafts.map((draft, index) => {
    const id = assignments[index];
    const status = previousById.get(id)?.status
      ?? ((lotsStatusMap as Record<string, LotStatus>)[id] ?? "available") as LotStatus;
    const areaM2 = Math.round(polygonAreaM2(draft.polygon, scale) * 100) / 100;
    const frontage = Math.round(draft.frontageM * 100) / 100;
    const depth = Math.round(draft.depthM * 100) / 100;
    const price = Math.round(areaM2 * getLotPricePerM2(draft.typology));
    const buildableCircle = largestBuildableCircle(draft.polygon, scale);
    const buildableCircleDiameterM = Math.round(buildableCircle.radiusM * 200) / 100;
    return {
      id,
      legacyId: previousById.has(id) ? id : undefined,
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
      placementSource: "masterplan-v4",
      masterplanVersion: COURTYARD_MASTERPLAN_VERSION,
      commercialPriceVersion: COMMERCIAL_PRICE_VERSION,
      buildableCircleCenter: buildableCircle.center,
      buildableCircleDiameterM,
      fitsDome4m: buildableCircleDiameterM >= 4,
      fitsDome8m: buildableCircleDiameterM >= 8,
      recommendedDomeDiameterM: buildableCircleDiameterM >= 8 ? 8 : 4,
    };
  });
}

function createRoads(
  baseRoads: Road[],
  outerEnvelope: XY[],
  center: XY,
  rowPaths: RowPath[],
  villageAngles: VillageAngles[],
  scale: number,
): Road[] {
  const innerRadiusPx = INNER_RESIDENTIAL_RADIUS_M * scale;
  const roads = baseRoads.slice(0, 2).map((road) => ({ ...road, path: road.path.map((point) => ({ ...point })) }));
  roads.push({
    id: "PASEO-OASIS-V4",
    kind: "pedestrian",
    widthM: RING_PATH_WIDTH_M,
    path: Array.from({ length: 73 }, (_, index) => {
      const angle = (index * Math.PI * 2) / 72;
      const radius = (OASIS_RADIUS_M + 0.2) * scale;
      return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
    }),
  });
  villageAngles.forEach((angles, index) => {
    roads.push({
      id: `PASEO-DIAGONAL-V4-${index + 1}`,
      kind: "pedestrian",
      widthM: RADIAL_PATH_WIDTH_M,
      path: Array.from({ length: 33 }, (_, pointIndex) => (
        organicPoint(center, outerEnvelope, innerRadiusPx, angles.sectorStart, pointIndex / 32)
      )),
    });
  });
  rowPaths.forEach((rowPath) => {
    roads.push({
      id: `PASEO-ALDEA-V4-${rowPath.villageIndex + 1}-${rowPath.rowIndex + 1}`,
      kind: "pedestrian",
      widthM: RING_PATH_WIDTH_M,
      path: rowPath.path,
    });
  });
  return roads;
}

function createAmenities(
  baseAmenities: Amenity[],
  center: XY,
  greenPauses: GreenPause[],
  villageAngles: VillageAngles[],
  outerEnvelope: XY[],
  scale: number,
): Amenity[] {
  const sourceCore = baseAmenities.find((amenity) => amenity.id === "A_OASIS_CORE");
  const sourceArea = sourceCore?.areaM2 || 5_854;
  const factor = Math.sqrt(COURTYARD_OASIS_AREA_M2 / sourceArea);
  const central = baseAmenities
    .filter((amenity) => amenity.kind !== "pocket-garden")
    .map((amenity) => ({
      ...amenity,
      id: amenity.id === "A_OASIS_CORE" ? "A_OASIS_CORE_V4" : `${amenity.id}_V4`,
      polygon: amenity.polygon.map((point) => ({
        x: center.x + (point.x - center.x) * factor,
        y: center.y + (point.y - center.y) * factor,
      })),
      areaM2: Math.round(amenity.areaM2 * factor * factor),
    }));
  const pauses: Amenity[] = greenPauses.map((pause, index) => ({
    id: `A_V4_GREEN_PAUSE_${String(index + 1).padStart(2, "0")}`,
    kind: "pocket-garden",
    polygon: pause.polygon,
    areaM2: Math.round(polygonAreaM2(pause.polygon, scale)),
  }));
  const roundabouts: Amenity[] = villageAngles.map((angles, index) => ({
    id: `A_V4_GARDEN_NODE_${index + 1}`,
    kind: "pocket-garden",
    polygon: circlePolygon(
      organicPoint(center, outerEnvelope, INNER_RESIDENTIAL_RADIUS_M * scale, angles.sectorStart, 0.55),
      2.2,
      scale,
      24,
    ),
    areaM2: 15,
  }));
  return [...central, ...pauses, ...roundabouts];
}

function createBlocks(
  outerEnvelope: XY[],
  center: XY,
  villageAngles: VillageAngles[],
  scale: number,
): BlockPolygon[] {
  const innerRadiusPx = INNER_RESIDENTIAL_RADIUS_M * scale;
  return villageAngles.map((angles, index) => ({
    id: `C${index + 1}`,
    role: "courtyard-village",
    polygon: sectorPolygon(center, outerEnvelope, innerRadiusPx, angles.angleStart, angles.angleEnd, 0, 1, 40),
    labelPoint: organicPoint(
      center,
      outerEnvelope,
      innerRadiusPx,
      (angles.angleStart + angles.angleEnd) / 2,
      0.58,
    ),
    vehiclesAllowed: false,
  }));
}

function createCourtyardMasterplan() {
  const base = buildConstellationMasterplan();
  const { terrainScene, scale } = base;
  const outerEnvelope = roundPolygonCorners(base.outerEnvelope, CORNER_ROUNDING_M * scale);
  const center = centroid(outerEnvelope);
  const { drafts, greenPauses, rowPaths, rowEndsByVillage, villageAngles } = createReferenceDrafts(
    outerEnvelope,
    base.outerEnvelope,
    center,
    scale,
  );
  const previousLots = uniquePreviousLots();
  const { assignments, retiredIds, previousById } = assignStableIds(drafts, previousLots);
  const residentialBase = createResidentialLots(drafts, assignments, previousById, scale);
  const generatedParkings = createParkingLots(terrainScene.innerBuffer, scale, COURTYARD_RESIDENTIAL_COUNT);
  const privateParkings = generatedParkings.privateParkings.map((parking) => ({
    ...parking,
    price: PRIVATE_PARKING_PRICE_PEN,
    price_soles: PRIVATE_PARKING_PRICE_PEN,
    placementSource: "masterplan-v4" as const,
    masterplanVersion: COURTYARD_MASTERPLAN_VERSION,
    commercialPriceVersion: COMMERCIAL_PRICE_VERSION,
  }));
  const commonParkings = generatedParkings.commonParkings.map((parking) => ({
    ...parking,
    placementSource: "masterplan-v4" as const,
    masterplanVersion: COURTYARD_MASTERPLAN_VERSION,
  }));
  const residentialLots = assignParkingAndDistances(residentialBase, privateParkings, center, scale).map((lot) => {
    const lotCenter = centroid(lot.polygon);
    const oasisDistance = Math.max(0, Math.hypot(lotCenter.x - center.x, lotCenter.y - center.y) / scale - OASIS_RADIUS_M);
    return {
      ...lot,
      distanceToPool: Math.round(oasisDistance),
      walk_distance_oasis_meters: Math.round(oasisDistance),
    };
  });
  const roads = createRoads(base.roads, outerEnvelope, center, rowPaths, villageAngles, scale);
  const amenities = createAmenities(base.amenities, center, greenPauses, villageAngles, outerEnvelope, scale);
  const blocks = createBlocks(outerEnvelope, center, villageAngles, scale);
  const parkings = [...privateParkings, ...commonParkings];
  const allLots = [...residentialLots, ...parkings];
  const roadPolys = roads.map((road) => roadToPolygon(road.path, road.widthM, scale));
  const frontages = residentialLots.map((lot) => lot.frontage ?? 0);
  const aspectRatios = residentialLots.map((lot) => {
    const frontage = lot.frontage ?? 1;
    const depth = lot.depth ?? 1;
    return Math.max(frontage / depth, depth / frontage);
  });
  const sourceById = new Map(previousLots.map((lot) => [lot.id, lot]));
  const greenPauseAreaM2 = greenPauses.reduce((sum, pause) => sum + polygonAreaM2(pause.polygon, scale), 0);

  return {
    masterplanVersion: COURTYARD_MASTERPLAN_VERSION,
    masterplanLabel: COURTYARD_MASTERPLAN_LABEL,
    terrainScene,
    scale,
    center,
    outerEnvelope,
    blocks,
    roads,
    amenities,
    oasisAreaM2: COURTYARD_OASIS_AREA_M2,
    greenPauseAreaM2,
    releasedLots: previousLots.filter((lot) => retiredIds.includes(lot.id)),
    releasedAreaM2: previousLots
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
    protectedSourceIds: previousLots.filter((lot) => PROTECTED_STATUSES.has(lot.status)).map((lot) => lot.id),
    statusBySourceId: sourceById,
    quality: {
      minimumFrontageM: Math.min(...frontages),
      maximumAspectRatio: Math.max(...aspectRatios),
      minimumPrimaryCornerAngleDeg: Math.min(...drafts.map((draft) => minimumInteriorAngleDegrees(draft.polygon))),
      minimumBuildableCircleDiameterM: Math.min(...residentialLots.map((lot) => lot.buildableCircleDiameterM ?? 0)),
      maximumParkingWalkM: Math.max(...residentialLots.map((lot) => lot.walk_distance_parking_meters ?? 0)),
    },
  };
}

export type CourtyardMasterplan = ReturnType<typeof createCourtyardMasterplan>;

let cachedMasterplan: CourtyardMasterplan | undefined;

export function buildCourtyardMasterplan(): CourtyardMasterplan {
  cachedMasterplan ??= createCourtyardMasterplan();
  return cachedMasterplan;
}
