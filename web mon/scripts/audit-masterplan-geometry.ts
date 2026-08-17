import { buildTerrainScene, getMeterToSvgScale } from "../src/lib/terrainModel";
import { buildBlocks } from "../src/lib/blockModel";
import { buildRoads } from "../src/lib/roadModel";
import { buildAmenities } from "../src/lib/amenityModel";
import { buildLots, buildParkingLots } from "../src/lib/lotModel";
import { centroid, isPointInPolygon, roadToPolygon, shoelaceArea } from "../src/lib/geometry";
import { checkCollision } from "../src/lib/spatialAnalyzer";
import type { XY } from "../src/types/map";

const terrain = buildTerrainScene();
const blocks = buildBlocks(terrain.innerBuffer);
const roads = buildRoads(terrain.innerBuffer);
const amenities = buildAmenities(terrain.innerBuffer);
const scale = getMeterToSvgScale();
const roadPolys = roads.map((road) => roadToPolygon(road.path, road.widthM, scale));

function circleToPolygon(center: XY, radiusM: number): XY[] {
  const radius = radiusM * scale;
  return Array.from({ length: 12 }, (_, index) => {
    const angle = (index * 2 * Math.PI) / 12;
    return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
  });
}

const culDeSacs = roads
  .filter((road) => road.id.startsWith("LINEAR_ROAD"))
  .map((road) => circleToPolygon(road.path[0], 6));
const nonRoadObstacles = [
  ...amenities
    .filter((amenity) => amenity.id !== "A_SAND" && amenity.kind !== "sand-plaza")
    .map((amenity) => amenity.polygon),
  ...culDeSacs,
];
const allObstacles = [...nonRoadObstacles, ...roadPolys];

function pointAndTangentAtDistance(path: XY[], distanceM: number): { point: XY; tangent: XY } {
  let remaining = distanceM * scale;
  for (let index = 1; index < path.length; index += 1) {
    const previous = path[index - 1];
    const current = path[index];
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const length = Math.hypot(dx, dy);
    if (remaining <= length || index === path.length - 1) {
      const ratio = Math.min(1, Math.max(0, remaining / (length || 1)));
      return {
        point: { x: previous.x + dx * ratio, y: previous.y + dy * ratio },
        tangent: { x: dx / (length || 1), y: dy / (length || 1) },
      };
    }
    remaining -= length;
  }
  return { point: path[0], tangent: { x: 1, y: 0 } };
}

function parkingPolygonAt(road: (typeof roads)[number], stationM: number, side: -1 | 1): XY[] {
  const { point, tangent } = pointAndTangentAtDistance(road.path, stationM);
  const normal = { x: -tangent.y * side, y: tangent.x * side };
  const centerOffset = (road.widthM / 2 + 2.5 + 0.55) * scale;
  const center = { x: point.x + normal.x * centerOffset, y: point.y + normal.y * centerOffset };
  const hf = 1.25 * scale;
  const hd = 2.5 * scale;
  return [
    { x: center.x - tangent.x * hf - normal.x * hd, y: center.y - tangent.y * hf - normal.y * hd },
    { x: center.x + tangent.x * hf - normal.x * hd, y: center.y + tangent.y * hf - normal.y * hd },
    { x: center.x + tangent.x * hf + normal.x * hd, y: center.y + tangent.y * hf + normal.y * hd },
    { x: center.x - tangent.x * hf + normal.x * hd, y: center.y - tangent.y * hf + normal.y * hd },
  ];
}

const preliminaryResidentialLots = buildLots(blocks, [], roadPolys, allObstacles);
const capacityObstacles = [...allObstacles, ...preliminaryResidentialLots.map((lot) => lot.polygon)];
const capacityObstacleBoxes = capacityObstacles.map((polygon) => ({
  polygon,
  minX: Math.min(...polygon.map((point) => point.x)),
  maxX: Math.max(...polygon.map((point) => point.x)),
  minY: Math.min(...polygon.map((point) => point.y)),
  maxY: Math.max(...polygon.map((point) => point.y)),
}));
function collidesWithCapacityObstacle(polygon: XY[]): boolean {
  const minX = Math.min(...polygon.map((point) => point.x));
  const maxX = Math.max(...polygon.map((point) => point.x));
  const minY = Math.min(...polygon.map((point) => point.y));
  const maxY = Math.max(...polygon.map((point) => point.y));
  return capacityObstacleBoxes.some((obstacle) => (
    minX <= obstacle.maxX && maxX >= obstacle.minX && minY <= obstacle.maxY && maxY >= obstacle.minY
    && checkCollision(polygon, [obstacle.polygon], 0.02)
  ));
}
const capacityRoadIds = new Set(["BOULEVARD_FORK_L", "BOULEVARD_FORK_R", "CROSS_ROAD_BACK"]);
const parkingEdgeCapacities = process.argv.includes("--capacity")
  ? roads.filter((road) => capacityRoadIds.has(road.id)).flatMap((road) => ([-1, 1] as const).map((side) => {
  const lengthM = road.path.slice(1).reduce((total, point, index) => {
    const previous = road.path[index];
    return total + Math.hypot(point.x - previous.x, point.y - previous.y) / scale;
  }, 0);
  let count = 0;
  let lastAccepted = Number.NEGATIVE_INFINITY;
  for (let stationM = 8; stationM <= lengthM - 8; stationM += 0.5) {
    if (stationM - lastAccepted < 2.85) continue;
    const polygon = parkingPolygonAt(road, stationM, side);
    if (polygon.every((point) => isPointInPolygon(point, terrain.innerBuffer)) && !collidesWithCapacityObstacle(polygon)) {
      count += 1;
      lastAccepted = stationM;
    }
  }
    return { roadId: road.id, side, count };
  }))
  : [];

if (process.argv.includes("--capacity")) {
  console.log(JSON.stringify(parkingEdgeCapacities, null, 2));
  process.exit(0);
}

const parkings = buildParkingLots(terrain.innerBuffer, capacityObstacles, roadPolys, roads);
if (process.argv.includes("--smoke")) {
  console.log(JSON.stringify({ parkingCount: parkings.length, firstId: parkings[0]?.id, lastId: parkings.at(-1)?.id }, null, 2));
  process.exit(0);
}
const residentialLots = preliminaryResidentialLots;
const grouped = parkings.reduce<Record<string, typeof parkings>>((result, parking) => {
  (result[parking.quadrant] ??= []).push(parking);
  return result;
}, {});

function polygonsCollide(a: XY[], b: XY[]): boolean {
  const aMinX = Math.min(...a.map((point) => point.x));
  const aMaxX = Math.max(...a.map((point) => point.x));
  const aMinY = Math.min(...a.map((point) => point.y));
  const aMaxY = Math.max(...a.map((point) => point.y));
  const bMinX = Math.min(...b.map((point) => point.x));
  const bMaxX = Math.max(...b.map((point) => point.x));
  const bMinY = Math.min(...b.map((point) => point.y));
  const bMaxY = Math.max(...b.map((point) => point.y));
  return aMinX <= bMaxX && aMaxX >= bMinX && aMinY <= bMaxY && aMaxY >= bMinY
    && checkCollision(a, [b], 0.01);
}

let pairOverlaps = 0;
for (let i = 0; i < parkings.length; i += 1) {
  for (let j = i + 1; j < parkings.length; j += 1) {
    if (polygonsCollide(parkings[i].polygon, parkings[j].polygon)) pairOverlaps += 1;
  }
}

const areas = parkings.map((parking) => shoelaceArea(parking.polygon) / (scale * scale));
const touchingRoad = parkings.filter((parking) => checkCollision(parking.polygon, roadPolys, 0.01)).length;
const touchingNonRoadObstacle = parkings.filter((parking) => checkCollision(parking.polygon, nonRoadObstacles, 0.01)).length;
const ids = new Set(parkings.map((parking) => parking.id));
const parkingResidentialOverlaps = parkings.reduce((total, parking) => (
  total + residentialLots.filter((lot) => polygonsCollide(parking.polygon, lot.polygon)).length
), 0);
const overlapsByParkingGroup = Object.fromEntries(Object.entries(grouped).map(([key, value]) => [
  key,
  value.reduce((total, parking) => (
    total + residentialLots.filter((lot) => polygonsCollide(parking.polygon, lot.polygon)).length
  ), 0),
]));
const overlapsByRun = [
  ["SW curb -1", 0, 16], ["SW curb +1", 16, 22],
  ["SE curb -1", 22, 38], ["SE curb +1", 38, 55],
  ["Rear perimeter", 55, 138],
].map(([label, start, end]) => ({
  label,
  overlaps: parkings.slice(Number(start), Number(end)).reduce((total, parking) => (
    total + residentialLots.filter((lot) => polygonsCollide(parking.polygon, lot.polygon)).length
  ), 0),
}));

console.log(JSON.stringify({
  scale,
  parkingCount: parkings.length,
  expectedParkingCount: 138,
  residentialLotCount: residentialLots.length,
  expectedResidentialLotCount: 312,
  uniqueIds: ids.size,
  firstId: parkings[0]?.id,
  lastId: parkings.at(-1)?.id,
  groups: Object.fromEntries(Object.entries(grouped).map(([key, value]) => [key, value.length])),
  areaM2: {
    min: Math.min(...areas),
    max: Math.max(...areas),
    total: areas.reduce((sum, area) => sum + area, 0),
  },
  pairOverlaps,
  touchingRoad,
  touchingNonRoadObstacle,
  parkingResidentialOverlaps,
  overlapsByParkingGroup,
  overlapsByRun,
  roadLengthsM: Object.fromEntries(roads.map((road) => [
    road.id,
    road.path.slice(1).reduce((total, point, index) => {
      const previous = road.path[index];
      return total + Math.hypot(point.x - previous.x, point.y - previous.y) / scale;
    }, 0),
  ])),
  parkingEdgeCapacities,
  parking22to45: parkings.slice(21, 45).map((parking) => ({
    id: parking.id,
    number: parking.number,
    quadrant: parking.quadrant,
    center: centroid(parking.polygon),
  })),
}, null, 2));
