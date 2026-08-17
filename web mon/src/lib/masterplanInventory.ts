import type { Lot, XY } from "../types/map";
import { buildAmenities } from "./amenityModel";
import { buildBlocks } from "./blockModel";
import { roadToPolygon } from "./geometry";
import { attachParkingMetrics, buildLots, buildParkingLots } from "./lotModel";
import { buildRoads } from "./roadModel";
import { buildTerrainScene, getMeterToSvgScale } from "./terrainModel";
import { buildConstellationMasterplan } from "./constellationModel";
import { buildCourtyardMasterplan } from "./courtyardMasterplanModel";

function circleToPolygon(center: XY, radiusM: number, scale: number): XY[] {
  const radius = radiusM * scale;
  return Array.from({ length: 12 }, (_, index) => {
    const angle = (index * 2 * Math.PI) / 12;
    return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
  });
}

export function buildMoonParacasInventoryV1() {
  const terrainScene = buildTerrainScene();
  const scale = getMeterToSvgScale();
  const blocks = buildBlocks(terrainScene.innerBuffer);
  const roads = buildRoads(terrainScene.innerBuffer);
  const amenities = buildAmenities(terrainScene.innerBuffer);
  const roadPolys = roads.map((road) => roadToPolygon(road.path, road.widthM, scale));
  const culDeSacs = roads
    .filter((road) => road.id.startsWith("LINEAR_ROAD"))
    .map((road) => circleToPolygon(road.path[0], 6, scale));
  const activeBuildings = [
    ...amenities
      .filter((amenity) => amenity.id !== "A_SAND" && amenity.kind !== "sand-plaza")
      .map((amenity) => amenity.polygon),
    ...culDeSacs,
    ...roadPolys,
  ];

  const residentialGeometry = buildLots(blocks, [], roadPolys, activeBuildings);
  const parkingObstacles = [...activeBuildings, ...residentialGeometry.map((lot) => lot.polygon)];
  const parkings = buildParkingLots(terrainScene.innerBuffer, parkingObstacles, roadPolys, roads);
  const residentialLots = attachParkingMetrics(residentialGeometry, parkings);
  const allLots: Lot[] = [...residentialLots, ...parkings];

  return {
    terrainScene,
    scale,
    blocks,
    roads,
    amenities,
    roadPolys,
    activeBuildings,
    residentialLots,
    parkings,
    allLots,
  };
}

export function buildMoonParacasInventory() {
  return buildCourtyardMasterplan();
}
