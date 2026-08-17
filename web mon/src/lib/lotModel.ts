import { BlockPolygon, Lot, LotStatus, LotTypology, Road, XY } from "../types/map";
import { COMMERCIAL_PRICE_VERSION, getLotPricePerM2, PRIVATE_PARKING_PRICE_PEN } from "../config/pricing";
import { BLOCK_SPECS } from "../data/business";
import { shoelaceArea, centroid, isPointInPolygon } from "./geometry";
import { getMeterToSvgScale, buildTerrainScene } from "./terrainModel";
import { slicePolyRing, getPointOnPoly, getPointAndNormalOnPoly } from "./curve";
import { BAND_BLOCKS, BAND_OFFSETS, getBandPoint, globalOasisBoundary, getCurvedD } from "./blockModel";
import { checkCollision, assertInsidePerimeter } from "./spatialAnalyzer";
import lotsStatusMap from "../data/lots_status.json";
import { buildRoads } from "./roadModel";

export interface GeospatialValidator {
  validateCollision(polygon: XY[], obstacles: XY[][], shrinkM?: number): boolean;
  validateInsidePerimeter(polygon: XY[], label: string): void;
}

export const turfValidator: GeospatialValidator = {
  validateCollision(polygon: XY[], obstacles: XY[][], shrinkM = 0.1): boolean {
    return checkCollision(polygon, obstacles, shrinkM);
  },
  validateInsidePerimeter(polygon: XY[], label: string): void {
    assertInsidePerimeter(polygon, label);
  }
};

function makeLotId(n: number) {
  return `LOTE-${n}`;
}

function getLotCorners(polygon: XY[]): { p1: XY; p2: XY; p3: XY; p4: XY } {
  // polygon has (steps + 1) * 2 = 14 points (from steps = 6)
  const steps = 6;
  return {
    p1: polygon[0],
    p2: polygon[steps],
    p3: polygon[steps + 1],
    p4: polygon[polygon.length - 1]
  };
}

// Parallel block subdivision (1 row per block, aligned t-cuts, curved edges)
export function subdivideParallelBlockCustom(block: BlockPolygon, count: number, d_low_val: number, d_high_val: number): XY[][] {
  if (!block.ringData) return [block.polygon];
  
  const { t_start, t_end } = block.ringData;
  const scale = getMeterToSvgScale();
  const { innerBuffer } = buildTerrainScene();
  
  const gap_t = 0.0015;
  const half = Math.floor(count / 2);
  
  // Compute arc length parameters to equalize frontages in curved streets
  const samples = 50;
  const t_vals: number[] = [];
  const arc_lengths: number[] = [0];
  let total_arc = 0;
  
  for (let s = 0; s <= samples; s++) {
    const t = t_start + s * (t_end - t_start) / samples;
    t_vals.push(t);
    if (s > 0) {
      const prev_t = t_vals[s - 1];
      const p_low_prev = getBandPoint(innerBuffer, prev_t, getCurvedD(prev_t, d_low_val), scale);
      const p_low_curr = getBandPoint(innerBuffer, t, getCurvedD(t, d_low_val), scale);
      
      const p_high_prev = getBandPoint(innerBuffer, prev_t, getCurvedD(prev_t, d_high_val), scale);
      const p_high_curr = getBandPoint(innerBuffer, t, getCurvedD(t, d_high_val), scale);
      
      const d_low = Math.hypot(p_low_curr.x - p_low_prev.x, p_low_curr.y - p_low_prev.y) / scale;
      const d_high = Math.hypot(p_high_curr.x - p_high_prev.x, p_high_curr.y - p_high_prev.y) / scale;
      
      const avg_d = (d_low + d_high) / 2;
      total_arc += avg_d;
      arc_lengths.push(total_arc);
    }
  }

  function getRawEqualCuts(): number[] {
    const u: number[] = [t_start];
    const segment = total_arc / count;
    for (let c = 1; c < count; c++) {
      const target = c * segment;
      let idx = 0;
      while (idx < arc_lengths.length && arc_lengths[idx] < target) {
        idx++;
      }
      if (idx === 0) {
        u.push(t_start);
      } else {
        const l_prev = arc_lengths[idx - 1];
        const l_curr = arc_lengths[idx];
        const t_prev = t_vals[idx - 1];
        const t_curr = t_vals[idx];
        const f = (target - l_prev) / (l_curr - l_prev || 1);
        u.push(t_prev + f * (t_curr - t_prev));
      }
    }
    u.push(t_end);
    return u;
  }
  
  const u = getRawEqualCuts();
  const u_half = u[half];
  const lots: XY[][] = [];
  
  function createLotPolygon(t1: number, t2: number): XY[] {
    const curvedEdgeLow: XY[] = [];
    const curvedEdgeHigh: XY[] = [];
    const steps = 6;
    
    for (let s = 0; s <= steps; s++) {
      const curr_t = t1 + (t2 - t1) * (s / steps);
      const curr_d_low = getCurvedD(curr_t, d_low_val);
      curvedEdgeLow.push(getBandPoint(innerBuffer, curr_t, curr_d_low, scale));
    }
    for (let s = steps; s >= 0; s--) {
      const curr_t = t1 + (t2 - t1) * (s / steps);
      const curr_d_high = getCurvedD(curr_t, d_high_val);
      curvedEdgeHigh.push(getBandPoint(innerBuffer, curr_t, curr_d_high, scale));
    }
    
    return [...curvedEdgeLow, ...curvedEdgeHigh];
  }
  
  for (let c = 0; c < count; c++) {
    const t1 = u[c];
    const t2 = u[c + 1];
    
    let t1_shifted = t1;
    let t2_shifted = t2;
    
    if (c < half) {
      t1_shifted = t1 - (gap_t / 2) * ((t1 - t_start) / (u_half - t_start || 1));
    } else {
      t1_shifted = t1 + (gap_t / 2) * ((t_end - t1) / (t_end - u_half || 1));
    }
    
    if (c < half - 1) {
      t2_shifted = t2 - (gap_t / 2) * ((t2 - t_start) / (u_half - t_start || 1));
    } else if (c === half - 1) {
      t2_shifted = u_half - gap_t / 2;
    } else {
      t2_shifted = t2 + (gap_t / 2) * ((t_end - t2) / (t_end - u_half || 1));
    }
    
    lots.push(createLotPolygon(t1_shifted, t2_shifted));
  }
  
  return lots;
}

export function subdivideParallelBlock(block: BlockPolygon, count: number): XY[][] {
  const b = BAND_BLOCKS.findIndex(arr => arr.includes(block.id));
  const offsets = BAND_OFFSETS[b];
  if (!offsets) return [block.polygon];
  return subdivideParallelBlockCustom(block, count, offsets.low, offsets.high);
}

export function subdivideDoubleRowBlock(block: BlockPolygon, count: number): XY[][] {
  const b = BAND_BLOCKS.findIndex(arr => arr.includes(block.id));
  const offsets = BAND_OFFSETS[b];
  if (!offsets) return [block.polygon];
  
  const d_mid = (offsets.low + offsets.high) / 2;
  const countPerRow = Math.floor(count / 2);
  
  const row1 = subdivideParallelBlockCustom(block, countPerRow, offsets.low, d_mid);
  const row2 = subdivideParallelBlockCustom(block, countPerRow, d_mid, offsets.high);
  
  return [...row1, ...row2];
}

export function buildLots(
  blocks: BlockPolygon[],
  parkings: Lot[] = [],
  roadPolys: XY[][] = [],
  activeObstacles: XY[][] = []
): Lot[] {
  let counter = 1;
  let premiumCounter = 0;
  let offerCount = 0;
  const lots: Lot[] = [];
  const scale = getMeterToSvgScale();

  // Seeded shuffle function to select exactly 30 tiny house lots randomly
  function seededShuffle<T>(array: T[], seed: number): T[] {
    const arr = [...array];
    let m = arr.length, t, i;
    let s = seed;
    while (m) {
      s = (s * 9301 + 49297) % 233280;
      i = Math.floor((s / 233280) * m--);
      t = arr[m];
      arr[m] = arr[i];
      arr[i] = t;
    }
    return arr;
  }

  const tinyHousePool: number[] = [];
  // M7-M9: 53 to 104
  for (let c = 53; c <= 104; c++) {
    tinyHousePool.push(c);
  }
  // M22-M24: 209 to 260
  for (let c = 209; c <= 260; c++) {
    tinyHousePool.push(c);
  }

  const shuffledPool = seededShuffle(tinyHousePool, 45); // Seed 45 gives a nice spread
  const selectedOfferCounters = new Set(shuffledPool.slice(0, 30));

  // Helper to compute minimum distance from a point to a polygon of vertices
  function distanceToPolygon(p: XY, poly: XY[]): number {
    if (poly.length === 0) return 100; // default fallback
    let minD = Infinity;
    for (const pt of poly) {
      const d = Math.hypot(p.x - pt.x, p.y - pt.y);
      if (d < minD) minD = d;
    }
    return minD;
  }

  // Cache parking centroids once at the start of buildLots to optimize distance calculations
  const parkingCentroids = parkings ? parkings.map(p => ({
    parking: p,
    centroid: centroid(p.polygon)
  })) : [];

  for (const block of blocks) {
    const spec = BLOCK_SPECS.find(b => b.id === block.id);
    if (!spec) continue;
    
    const b = BAND_BLOCKS.findIndex(arr => arr.includes(block.id));

    const isDoubleRow = ["M7", "M8", "M9", "M22", "M23", "M24"].includes(block.id);
    const subPolygons = isDoubleRow
      ? subdivideDoubleRowBlock(block, spec.targetLotCount)
      : subdivideParallelBlock(block, spec.targetLotCount);

    for (let i = 0; i < spec.targetLotCount; i++) {
      const polygon = subPolygons[i] || block.polygon;
      
      // True mathematically computed area in square meters
      const svgArea = shoelaceArea(polygon);
      const realArea = svgArea / (scale * scale);
      const roundedArea = Math.round(realArea * 100) / 100;

      // Calculate exact frontage and depth
      let frontage = 10;
      let depth = 20;
      let dimensions = "";
      if (polygon.length >= 4) {
        const corners = getLotCorners(polygon);
        const top = Math.hypot(corners.p4.x - corners.p3.x, corners.p4.y - corners.p3.y) / scale;
        const bottom = Math.hypot(corners.p1.x - corners.p2.x, corners.p1.y - corners.p2.y) / scale;
        const avgFrontage = Math.round(((top + bottom) / 2) * 100) / 100;

        const left = Math.hypot(corners.p4.x - corners.p1.x, corners.p4.y - corners.p1.y) / scale;
        const right = Math.hypot(corners.p2.x - corners.p3.x, corners.p2.y - corners.p3.y) / scale;
        const avgDepth = Math.round(((left + right) / 2) * 100) / 100;
        
        frontage = avgFrontage;
        depth = avgDepth;
        dimensions = `${frontage.toFixed(2)}m x ${depth.toFixed(2)}m`;
      }

      // Assign commercial typology
      let finalTypology: LotTypology = "standard";
      if (["M7", "M8", "M9", "M10", "M11", "M12", "M22", "M23", "M24"].includes(block.id)) {
        finalTypology = "tiny-house";
      } else if (["M13", "M14", "M15", "M16", "M17", "M18"].includes(block.id)) {
        finalTypology = "premium";
      } else if (["M1", "M2", "M3", "M4", "M5", "M6"].includes(block.id)) {
        finalTypology = "standard";
      } else if (["M20"].includes(block.id)) {
        finalTypology = "zen";
      } else if (["M28", "M29", "M30"].includes(block.id)) {
        finalTypology = "adjustment";
      }
      
      let status: LotStatus = "available";

      // ── PRICING — Fase 0 / Revista Costos ────────────────────────────────
      const rate = getLotPricePerM2(finalTypology);
      const price = Math.round(roundedArea * rate);
      const priceLabel = `S/ ${price.toLocaleString('es-PE', {maximumFractionDigits:0})}`;

      // Mathematical distances
      const lotCentroid = centroid(polygon);
      const distToPool = Math.round(distanceToPolygon(lotCentroid, globalOasisBoundary) / scale);

      let minParkDist = 100; // fallback
      let assignedParkingType: "externo_ingreso" | "periferico_interno" = "externo_ingreso";
      if (parkingCentroids && parkingCentroids.length > 0) {
        let minD = Infinity;
        let closestP: Lot | null = null;
        for (const pc of parkingCentroids) {
          const d = Math.hypot(lotCentroid.x - pc.centroid.x, lotCentroid.y - pc.centroid.y);
          if (d < minD) {
            minD = d;
            closestP = pc.parking;
          }
        }
        minParkDist = Math.round(minD / scale);
        if (minParkDist > 145) {
          minParkDist = 145;
        }
        if (closestP && (closestP as any).parking_type) {
          assignedParkingType = (closestP as any).parking_type;
        }
      }

      // ── Collision with active obstacles (roads, amenities, cocheras) ──────
      if (activeObstacles && activeObstacles.length > 0) {
        if (checkCollision(polygon, activeObstacles, 0.1)) {
          continue; // Skip lot if it overlaps any active obstacle
        }
      } else if (roadPolys.length > 0 && checkCollision(polygon, roadPolys, 0.1)) {
        continue; // Legacy road fallback
      }

      // ── Bounding Box / Legal Perimeter constraint (Regla A / Phase A) ──────
      assertInsidePerimeter(polygon, `LOTE-${counter}`);

      lots.push({
        id: makeLotId(counter),
        blockId: block.id,
        typology: finalTypology,
        status: status,
        areaM2: roundedArea,
        polygon: polygon,
        dimensions: dimensions,
        priceLabel: priceLabel,
        price: price,
        number: counter,
        quadrant: block.id,
        area: roundedArea,
        elevation: 108 + Math.floor(Math.random() * 5),
        distanceToPool: distToPool,
        hubDistance: minParkDist,
        
        frontage: frontage,
        depth: depth,
        price_soles: price,
        commercialPriceVersion: COMMERCIAL_PRICE_VERSION,
        parking_type: assignedParkingType,
        walk_distance_parking_meters: minParkDist,
        walk_distance_oasis_meters: distToPool
      });

      counter++;
    }
  }

  return lots;
}

export function attachParkingMetrics(residentialLots: Lot[], parkings: Lot[]): Lot[] {
  if (parkings.length === 0) return residentialLots;
  const scale = getMeterToSvgScale();
  const parkingCenters = parkings.map((parking) => ({ parking, center: centroid(parking.polygon) }));

  return residentialLots.map((lot) => {
    const lotCenter = centroid(lot.polygon);
    let closest = parkingCenters[0];
    let distancePx = Number.POSITIVE_INFINITY;
    for (const candidate of parkingCenters) {
      const candidateDistance = Math.hypot(lotCenter.x - candidate.center.x, lotCenter.y - candidate.center.y);
      if (candidateDistance < distancePx) {
        distancePx = candidateDistance;
        closest = candidate;
      }
    }
    const distanceM = Math.min(145, Math.round(distancePx / scale));
    return {
      ...lot,
      hubDistance: distanceM,
      parking_type: closest.parking.parking_type,
      walk_distance_parking_meters: distanceM,
    };
  });
}

export function buildParkingLots(
  innerBuffer: XY[],
  obstacles: XY[][] = [],
  _roadPolys: XY[][] = [],
  roadNetwork: Road[] = []
 ): Lot[] {
  const scale = getMeterToSvgScale();
  const lots: Lot[] = [];
  const roads = roadNetwork.length > 0 ? roadNetwork : buildRoads(innerBuffer);
  const protectedObstacles = obstacles.map((polygon) => ({
    polygon,
    minX: Math.min(...polygon.map((point) => point.x)),
    maxX: Math.max(...polygon.map((point) => point.x)),
    minY: Math.min(...polygon.map((point) => point.y)),
    maxY: Math.max(...polygon.map((point) => point.y)),
  }));

  function polygonsOverlap(a: XY[], b: XY[]): boolean {
    const orientation = (p: XY, q: XY, r: XY) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    const onSegment = (p: XY, q: XY, r: XY) => (
      q.x >= Math.min(p.x, r.x) - 1e-7 && q.x <= Math.max(p.x, r.x) + 1e-7
      && q.y >= Math.min(p.y, r.y) - 1e-7 && q.y <= Math.max(p.y, r.y) + 1e-7
    );
    const segmentsIntersect = (p1: XY, p2: XY, q1: XY, q2: XY) => {
      const o1 = orientation(p1, p2, q1);
      const o2 = orientation(p1, p2, q2);
      const o3 = orientation(q1, q2, p1);
      const o4 = orientation(q1, q2, p2);
      if ((o1 > 0) !== (o2 > 0) && (o3 > 0) !== (o4 > 0)) return true;
      if (Math.abs(o1) < 1e-7 && onSegment(p1, q1, p2)) return true;
      if (Math.abs(o2) < 1e-7 && onSegment(p1, q2, p2)) return true;
      if (Math.abs(o3) < 1e-7 && onSegment(q1, p1, q2)) return true;
      return Math.abs(o4) < 1e-7 && onSegment(q1, p2, q2);
    };
    for (let aIndex = 0; aIndex < a.length; aIndex += 1) {
      const aNext = (aIndex + 1) % a.length;
      for (let bIndex = 0; bIndex < b.length; bIndex += 1) {
        const bNext = (bIndex + 1) % b.length;
        if (segmentsIntersect(a[aIndex], a[aNext], b[bIndex], b[bNext])) return true;
      }
    }
    return isPointInPolygon(a[0], b) || isPointInPolygon(b[0], a);
  }

  function collidesWithProtectedGeometry(polygon: XY[]): boolean {
    const minX = Math.min(...polygon.map((point) => point.x));
    const maxX = Math.max(...polygon.map((point) => point.x));
    const minY = Math.min(...polygon.map((point) => point.y));
    const maxY = Math.max(...polygon.map((point) => point.y));
    return protectedObstacles.some((obstacle) => (
      minX <= obstacle.maxX && maxX >= obstacle.minX && minY <= obstacle.maxY && maxY >= obstacle.minY
      && polygonsOverlap(polygon, obstacle.polygon)
    ));
  }

  type ParkingType = "externo_ingreso" | "periferico_interno";
  interface ParkingRun {
    roadId: string;
    side: -1 | 1;
    startM: number;
    endM: number;
    count: number;
    quadrant: string;
    legacyPrefix: string;
    parkingType: ParkingType;
  }

  // The inventory defines 138 stalls. The layout reserves clear areas at the
  // arrival split, road ends and the midpoint of the rear service road.
  const runs: ParkingRun[] = [
    { roadId: "BOULEVARD_FORK_L", side: -1, startM: 8, endM: 85, count: 16, quadrant: "PARKING_SW", legacyPrefix: "SW-", parkingType: "externo_ingreso" },
    { roadId: "BOULEVARD_FORK_L", side: 1, startM: 8, endM: 85, count: 6, quadrant: "PARKING_SW", legacyPrefix: "SW-", parkingType: "externo_ingreso" },
    { roadId: "BOULEVARD_FORK_R", side: -1, startM: 8, endM: 96.7, count: 16, quadrant: "PARKING_SE", legacyPrefix: "SE-", parkingType: "externo_ingreso" },
    { roadId: "BOULEVARD_FORK_R", side: 1, startM: 8, endM: 96.7, count: 17, quadrant: "PARKING_SE", legacyPrefix: "SE-", parkingType: "externo_ingreso" },
    { roadId: "CROSS_ROAD_BACK", side: -1, startM: 8, endM: 255.1, count: 83, quadrant: "PARKING_NW", legacyPrefix: "NW-", parkingType: "periferico_interno" },
  ];

  function pointAndTangentAtDistance(path: XY[], distanceM: number): { point: XY; tangent: XY } {
    let remaining = distanceM * scale;
    for (let index = 1; index < path.length; index += 1) {
      const previous = path[index - 1];
      const current = path[index];
      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      const segmentLength = Math.hypot(dx, dy);
      if (remaining <= segmentLength || index === path.length - 1) {
        const ratio = Math.min(1, Math.max(0, remaining / (segmentLength || 1)));
        return {
          point: { x: previous.x + dx * ratio, y: previous.y + dy * ratio },
          tangent: { x: dx / (segmentLength || 1), y: dy / (segmentLength || 1) },
        };
      }
      remaining -= segmentLength;
    }
    return { point: path[0], tangent: { x: 1, y: 0 } };
  }

  function createParkingLot(run: ParkingRun, road: Road, stationM: number, idNum: number): Lot {
    const { point, tangent } = pointAndTangentAtDistance(road.path, stationM);
    const normal = { x: -tangent.y * run.side, y: tangent.x * run.side };
    const curbClearanceM = 0.55;
    const centerOffset = (road.widthM / 2 + 2.5 + curbClearanceM) * scale;
    const center = {
      x: point.x + normal.x * centerOffset,
      y: point.y + normal.y * centerOffset,
    };
    const halfFrontage = 1.25 * scale;
    const halfDepth = 2.5 * scale;
    const polygon = [
      { x: center.x - tangent.x * halfFrontage - normal.x * halfDepth, y: center.y - tangent.y * halfFrontage - normal.y * halfDepth },
      { x: center.x + tangent.x * halfFrontage - normal.x * halfDepth, y: center.y + tangent.y * halfFrontage - normal.y * halfDepth },
      { x: center.x + tangent.x * halfFrontage + normal.x * halfDepth, y: center.y + tangent.y * halfFrontage + normal.y * halfDepth },
      { x: center.x - tangent.x * halfFrontage + normal.x * halfDepth, y: center.y - tangent.y * halfFrontage + normal.y * halfDepth },
    ];
    const canonicalId = `P${String(idNum).padStart(3, "0")}`;
    const isRearEast = run.roadId === "CROSS_ROAD_BACK" && stationM >= 131.5;
    const quadrant = isRearEast ? "PARKING_NE" : run.quadrant;
    const legacyPrefix = isRearEast ? "NE-" : run.legacyPrefix;

    return {
      id: canonicalId,
      legacyId: `P-${legacyPrefix}${idNum}`,
      number: canonicalId,
      blockId: "PARKING",
      typology: "parking",
      areaM2: 12.5,
      status: "available",
      priceLabel: `S/ ${PRIVATE_PARKING_PRICE_PEN.toLocaleString("es-PE")}`,
      price: PRIVATE_PARKING_PRICE_PEN,
      polygon,
      dimensions: "2.50m × 5.00m",
      quadrant,
      area: 12.5,
      elevation: 108,
      distanceToPool: 50,
      hubDistance: 0,
      frontage: 2.5,
      depth: 5,
      price_soles: PRIVATE_PARKING_PRICE_PEN,
      commercialPriceVersion: COMMERCIAL_PRICE_VERSION,
      parking_type: run.parkingType,
      walk_distance_parking_meters: 0,
      walk_distance_oasis_meters: 50,
      placementSource: "technical-inventory",
    };
  }

  const generatedPolygons: XY[][] = [];
  let parkingCount = 1;
  for (const run of runs) {
    const road = roads.find((candidate) => candidate.id === run.roadId);
    if (!road) throw new Error(`Parking layout requires road ${run.roadId}`);

    // Build a dense set of valid curb stations first. Protected entry buildings,
    // intersections and turning heads automatically create interruption gaps.
    const availableStations: number[] = [];
    const sampleStepM = 0.25;
    const minimumPitchM = 2.85;
    let lastAcceptedStation = Number.NEGATIVE_INFINITY;
    for (let stationM = run.startM; stationM <= run.endM + 0.001; stationM += sampleStepM) {
      if (stationM - lastAcceptedStation < minimumPitchM) continue;
      const candidate = createParkingLot(run, road, stationM, parkingCount);
      const isInside = candidate.polygon.every((point) => isPointInPolygon(point, innerBuffer));
      const collides = collidesWithProtectedGeometry(candidate.polygon);
      if (isInside && !collides) {
        availableStations.push(stationM);
        lastAcceptedStation = stationM;
      }
    }

    if (availableStations.length < run.count) {
      throw new Error(`${run.roadId} side ${run.side} supports ${availableStations.length} stalls; ${run.count} required`);
    }

    const selectedStations = Array.from({ length: run.count }, (_, index) => {
      const sourceIndex = run.count === 1
        ? 0
        : Math.round(index * (availableStations.length - 1) / (run.count - 1));
      return availableStations[sourceIndex];
    });

    for (const stationM of selectedStations) {
      const parking = createParkingLot(run, road, stationM, parkingCount);
      const isInside = parking.polygon.every((point) => isPointInPolygon(point, innerBuffer));
      const collidesWithProtected = collidesWithProtectedGeometry(parking.polygon);
      const collidesWithParking = generatedPolygons.some((polygon) => polygonsOverlap(parking.polygon, polygon));
      if (!isInside || collidesWithProtected || collidesWithParking) {
        const reason = !isInside
          ? "outside the legal buffer"
          : collidesWithParking
            ? "collides with another parking stall"
            : "collides with protected geometry";
        throw new Error(`${parking.id} ${reason} on ${run.roadId} at ${stationM.toFixed(2)}m`);
      }
      assertInsidePerimeter(parking.polygon, parking.id);
      generatedPolygons.push(parking.polygon);
      lots.push(parking);
      parkingCount += 1;
    }
  }

  if (lots.length !== 138) {
    throw new Error(`Technical inventory requires 138 parking stalls; generated ${lots.length}`);
  }

  return lots;
}
