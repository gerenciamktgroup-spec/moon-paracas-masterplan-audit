import { featureCollection, intersect, lineString, polygon } from "@turf/turf";
import { buildConstellationMasterplan } from "../src/lib/constellationModel";
import { MIN_BUILDABLE_CIRCLE_DIAMETER_M } from "../src/lib/constellationModel";
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

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const layout = buildConstellationMasterplan();
const { residentialLots, privateParkings, commonParkings, terrainScene, roads, amenities, releasedLots, releasedAreaM2, scale } = layout;
const allUnits = [...residentialLots, ...privateParkings, ...commonParkings];
const residentialArea = residentialLots.reduce((sum, lot) => sum + shoelaceArea(lot.polygon) / (scale * scale), 0);

assert(terrain.areaM2 === 112_391.8, "El área del lindero UTM cambió.");
assert(residentialLots.length === 278, "El inventario residencial no contiene 278 lotes.");
assert(privateParkings.length === 278, "El inventario no contiene 278 cocheras privadas.");
assert(commonParkings.length === 18, "El inventario no contiene 18 cocheras comunes.");
assert(Math.abs(residentialArea - 54_115.08) < 0.25, `El área residencial es ${residentialArea.toFixed(2)} m².`);
assert(releasedLots.length === 10, "No se liberaron las 10 parcelas críticas previstas.");
assert(Math.abs(releasedAreaM2 - 1_625) < 0.25 && releasedAreaM2 <= 2_000, `El área liberada es ${releasedAreaM2.toFixed(2)} m².`);
assert(releasedLots.every((lot) => lot.status === "available"), "Se intentó liberar un lote reservado, vendido o bloqueado.");
assert(new Set(residentialLots.map((lot) => lot.assignedParkingId)).size === 278, "La asignación lote–cochera no es uno a uno.");
assert(Math.max(...residentialLots.map((lot) => lot.walk_distance_parking_meters ?? Infinity)) <= 135, "Hay una cochera a más de 135 m de su lote.");
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
  lineString(road.path.map(({ x, y }) => [x, y]));
  for (const unit of allUnits) {
    const overlapArea = intersectionAreaM2(roadPolygon, unit.polygon, scale);
    if (overlapArea > 0.35) roadConflicts.push(`${road.id} invade ${unit.id} (${unit.blockId}) en ${overlapArea.toFixed(2)} m²`);
  }
}
assert(roadConflicts.length === 0, `Se detectaron ${roadConflicts.length} conflictos vía–unidad:\n${roadConflicts.join("\n")}`);
assert(residentialLots.every((lot) => lot.fitsDome4m), "Existe un lote sin cabida geométrica para domo de Ø4 m.");
assert(residentialLots.every((lot) => lot.fitsDome8m), "Existe un lote sin cabida geométrica para domo de Ø8 m.");
assert(Math.min(...residentialLots.map((lot) => lot.buildableCircleDiameterM ?? 0)) >= MIN_BUILDABLE_CIRCLE_DIAMETER_M, `La huella circular mínima es menor a Ø${MIN_BUILDABLE_CIRCLE_DIAMETER_M} m.`);

const typeCounts = Object.fromEntries(
  ["premium", "adjustment", "standard", "tiny-house"].map((type) => [type, residentialLots.filter((lot) => lot.typology === type).length]),
);

console.log(JSON.stringify({
  result: "PASS",
  version: layout.masterplanVersion,
  terrainAreaM2: terrain.areaM2,
  residentialAreaM2: Number(residentialArea.toFixed(2)),
  residentialLots: residentialLots.length,
  privateParkings: privateParkings.length,
  commonParkings: commonParkings.length,
  releasedLots: releasedLots.length,
  releasedAreaM2,
  typeCounts,
  roads: roads.length,
  maxParkingWalkM: Math.max(...residentialLots.map((lot) => lot.walk_distance_parking_meters ?? 0)),
  minBuildableCircleDiameterM: Math.min(...residentialLots.map((lot) => lot.buildableCircleDiameterM ?? 0)),
  dome4Fit: residentialLots.filter((lot) => lot.fitsDome4m).length,
  dome8Fit: residentialLots.filter((lot) => lot.fitsDome8m).length,
}, null, 2));
