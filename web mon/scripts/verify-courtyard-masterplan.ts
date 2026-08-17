import { featureCollection, intersect, polygon } from "@turf/turf";
import {
  buildCourtyardMasterplan,
  COURTYARD_MIN_BUILDABLE_DIAMETER_M,
  COURTYARD_OASIS_AREA_M2,
  COURTYARD_RESIDENTIAL_COUNT,
} from "../src/lib/courtyardMasterplanModel";
import { roadToPolygon, shoelaceArea } from "../src/lib/geometry";
import { terrain } from "../src/data/terrain";
import type { XY } from "../src/types/map";

type Box = { minX: number; minY: number; maxX: number; maxY: number };

const closeRing = (points: XY[]) => [...points.map(({ x, y }) => [x, y]), [points[0].x, points[0].y]];

function bounds(points: XY[]): Box {
  return points.reduce<Box>((box, point) => ({
    minX: Math.min(box.minX, point.x),
    minY: Math.min(box.minY, point.y),
    maxX: Math.max(box.maxX, point.x),
    maxY: Math.max(box.maxY, point.y),
  }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
}

function boxesOverlap(a: Box, b: Box): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

function intersectionAreaM2(a: XY[], b: XY[], scale: number): number {
  if (!boxesOverlap(bounds(a), bounds(b))) return 0;
  const clipped = intersect(featureCollection([polygon([closeRing(a)]), polygon([closeRing(b)])]));
  if (!clipped) return 0;
  if (clipped.geometry.type === "Polygon") {
    return shoelaceArea(clipped.geometry.coordinates[0].slice(0, -1).map(([x, y]) => ({ x, y }))) / (scale * scale);
  }
  return clipped.geometry.coordinates.reduce((sum, coordinates) => (
    sum + shoelaceArea(coordinates[0].slice(0, -1).map(([x, y]) => ({ x, y }))) / (scale * scale)
  ), 0);
}

function pointOnSegment(point: XY, start: XY, end: XY, epsilon = 1e-6): boolean {
  const cross = (point.y - start.y) * (end.x - start.x) - (point.x - start.x) * (end.y - start.y);
  if (Math.abs(cross) > epsilon) return false;
  const dot = (point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y);
  const squaredLength = (end.x - start.x) ** 2 + (end.y - start.y) ** 2;
  return dot >= -epsilon && dot <= squaredLength + epsilon;
}

function pointInPolygon(point: XY, boundary: XY[]): boolean {
  let inside = false;
  for (let index = 0, previous = boundary.length - 1; index < boundary.length; previous = index, index += 1) {
    const a = boundary[previous];
    const b = boundary[index];
    if (pointOnSegment(point, a, b)) return true;
    if ((a.y > point.y) !== (b.y > point.y)) {
      const crossingX = ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
      if (point.x < crossingX) inside = !inside;
    }
  }
  return inside;
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const layout = buildCourtyardMasterplan();
const {
  residentialLots,
  privateParkings,
  commonParkings,
  terrainScene,
  roads,
  amenities,
  releasedLots,
  retiredIds,
  scale,
  quality,
} = layout;
const allUnits = [...residentialLots, ...privateParkings, ...commonParkings];
const residentialArea = residentialLots.reduce((sum, lot) => sum + shoelaceArea(lot.polygon) / (scale * scale), 0);
const protectedLots = residentialLots.filter((lot) => lot.status !== "available");
const oasisCore = amenities.find((amenity) => amenity.id === "A_OASIS_CORE_V4");

assert(terrain.areaM2 === 112_391.8, "El área del lindero UTM cambió.");
assert(residentialLots.length === COURTYARD_RESIDENTIAL_COUNT, `V4 no contiene ${COURTYARD_RESIDENTIAL_COUNT} lotes.`);
assert(privateParkings.length === COURTYARD_RESIDENTIAL_COUNT, "V4 no contiene una cochera por lote.");
assert(commonParkings.length === 18, "V4 no conserva las 18 cocheras comunes.");
assert(residentialArea >= 40_000 && residentialArea <= 40_500, `El área residencial V4 es ${residentialArea.toFixed(2)} m².`);
assert(oasisCore?.areaM2 === COURTYARD_OASIS_AREA_M2, "El Oasis V4 no conserva 5,000 m².");
assert(releasedLots.every((lot) => lot.status === "available"), "V4 intentó retirar un lote protegido.");
assert(protectedLots.length === 22, `V4 conserva ${protectedLots.length}/22 estados protegidos.`);
assert(new Set(residentialLots.map((lot) => lot.id)).size === COURTYARD_RESIDENTIAL_COUNT, "Existen IDs residenciales duplicados.");
assert(new Set(residentialLots.map((lot) => lot.assignedParkingId)).size === COURTYARD_RESIDENTIAL_COUNT, "La asignación lote–cochera no es uno a uno.");
assert(quality.maximumParkingWalkM <= 135, "Hay una cochera a más de 135 m de su lote.");
assert(new Set(roads.map((road) => road.id)).size === roads.length, "Existen identificadores de vía duplicados.");
assert(roads.filter((road) => road.kind === "pedestrian").every((road) => road.widthM >= 4), "Existe un sendero peatonal menor a 4 m.");

for (const unit of allUnits) {
  assert(unit.polygon.every((point) => pointInPolygon(point, terrainScene.terrain)), `${unit.id} sale del lindero UTM.`);
}
for (const amenity of amenities) {
  assert(amenity.polygon.every((point) => pointInPolygon(point, terrainScene.terrain)), `${amenity.id} sale del lindero UTM.`);
}

const overlapToleranceM2 = 0.04;
for (const units of [residentialLots, [...privateParkings, ...commonParkings]]) {
  for (let first = 0; first < units.length; first += 1) {
    for (let second = first + 1; second < units.length; second += 1) {
      const overlapArea = intersectionAreaM2(units[first].polygon, units[second].polygon, scale);
      assert(overlapArea <= overlapToleranceM2, `${units[first].id} y ${units[second].id} se solapan ${overlapArea.toFixed(2)} m².`);
    }
  }
}

const roadPolygons = roads.map((road) => ({ road, polygon: roadToPolygon(road.path, road.widthM, scale) }));
const roadConflicts: string[] = [];
for (const { road, polygon: roadPolygon } of roadPolygons) {
  for (const unit of allUnits) {
    const overlapArea = intersectionAreaM2(roadPolygon, unit.polygon, scale);
    if (overlapArea > 0.35) roadConflicts.push(`${road.id} invade ${unit.id} en ${overlapArea.toFixed(2)} m²`);
  }
}
assert(roadConflicts.length === 0, `Se detectaron ${roadConflicts.length} conflictos vía–unidad:\n${roadConflicts.join("\n")}`);

assert(residentialLots.every((lot) => lot.fitsDome4m && lot.fitsDome8m), "Existe un lote sin cabida para domos Ø4/Ø8.");
assert(quality.minimumBuildableCircleDiameterM >= COURTYARD_MIN_BUILDABLE_DIAMETER_M, "La huella circular mínima es menor a Ø8.25 m.");
assert(quality.minimumFrontageM >= 9, "Existe un frente residencial menor a 9 m.");
assert(quality.maximumAspectRatio <= 2.5, "Existe una proporción residencial mayor a 2.5:1.");
assert(quality.minimumPrimaryCornerAngleDeg >= 65, "Existe una esquina residencial menor a 65°.");

const typeCounts = Object.fromEntries(
  ["premium", "tiny-house"].map((type) => [type, residentialLots.filter((lot) => lot.typology === type).length]),
);
const villageCounts = Object.fromEntries(
  ["C1", "C2", "C3", "C4"].map((block) => [block, residentialLots.filter((lot) => lot.blockId === block).length]),
);

console.log(JSON.stringify({
  result: "PASS",
  version: layout.masterplanVersion,
  terrainAreaM2: terrain.areaM2,
  oasisAreaM2: COURTYARD_OASIS_AREA_M2,
  residentialAreaM2: Number(residentialArea.toFixed(2)),
  residentialLots: residentialLots.length,
  privateParkings: privateParkings.length,
  commonParkings: commonParkings.length,
  retiredIds,
  protectedCommercialLots: protectedLots.length,
  villageCounts,
  typeCounts,
  greenPauseAreaM2: Number(layout.greenPauseAreaM2.toFixed(2)),
  roads: roads.length,
  quality,
}, null, 2));
