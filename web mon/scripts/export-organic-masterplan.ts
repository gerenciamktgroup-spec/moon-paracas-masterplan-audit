import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildOrganicConstellationMasterplan } from "../src/lib/organicConstellationModel";
import { terrain } from "../src/data/terrain";
import { getBounds, utmToLocal } from "../src/lib/coordinates";
import type { XY } from "../src/types/map";

const outputDirectory = resolve("artifacts", "masterplan-v3");
const layout = buildOrganicConstellationMasterplan();
const localTerrain = utmToLocal(terrain.vertices);
const localBounds = getBounds(localTerrain);
const origin = terrain.vertices.find((vertex) => vertex.id === "A")!.utm;
const padding = 70;

function svgToUtm(point: XY): [number, number] {
  const localX = (point.x - padding) / layout.scale + localBounds.minX;
  const localY = (point.y - padding) / layout.scale + localBounds.minY;
  return [localX + origin.e, origin.n - localY];
}

function closedCoordinates(points: XY[]): [number, number][] {
  const coordinates = points.map(svgToUtm);
  return [...coordinates, coordinates[0]];
}

const features = [
  {
    type: "Feature",
    properties: { layer: "LINDEROS", id: "TERRENO", area_m2: terrain.areaM2 },
    geometry: { type: "Polygon", coordinates: [closedCoordinates(layout.terrainScene.terrain)] },
  },
  ...layout.allLots.map((lot) => ({
    type: "Feature",
    properties: {
      layer: lot.typology === "parking" ? "COCHERAS_PRIVADAS" : lot.typology === "parking-external" ? "COCHERAS_COMUNES" : "LOTES",
      id: lot.id,
      numero_v3: lot.number,
      id_anterior: lot.legacyId,
      aldea: lot.blockId,
      tipologia: lot.typology,
      estado: lot.status,
      area_m2: lot.areaM2,
      frente_m: lot.frontage,
      fondo_m: lot.depth,
      cochera_asignada: lot.assignedParkingId,
      recorrido_cochera_m: lot.walk_distance_parking_meters,
      diametro_libre_m: lot.buildableCircleDiameterM,
      cabida_domo_4m: lot.fitsDome4m,
      cabida_domo_8m: lot.fitsDome8m,
      precio_soles: lot.price,
      version_precios: lot.commercialPriceVersion,
      masterplan: lot.masterplanVersion,
    },
    geometry: { type: "Polygon", coordinates: [closedCoordinates(lot.polygon)] },
  })),
  ...layout.roads.map((road) => ({
    type: "Feature",
    properties: { layer: "VIAS_Y_SENDEROS", id: road.id, tipo: road.kind, ancho_m: road.widthM },
    geometry: { type: "LineString", coordinates: road.path.map(svgToUtm) },
  })),
  ...layout.amenities.map((amenity) => ({
    type: "Feature",
    properties: { layer: "AMENIDADES", id: amenity.id, tipo: amenity.kind, area_m2: amenity.areaM2 },
    geometry: { type: "Polygon", coordinates: [closedCoordinates(amenity.polygon)] },
  })),
];

const geojson = {
  type: "FeatureCollection",
  name: "Moon Paracas · Moon Constellations V3",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:EPSG::32718" } },
  metadata: {
    version: layout.masterplanVersion,
    status: "Candidato conceptual para revisión técnica; no reemplaza planos aprobados.",
    terrain_area_m2: terrain.areaM2,
    residential_lots: layout.residentialLots.length,
    private_parkings: layout.privateParkings.length,
    common_parkings: layout.commonParkings.length,
    retired_available_ids: layout.retiredIds,
    quality: layout.quality,
  },
  features,
};

function dxfPolyline(layer: string, points: XY[], closed: boolean): string {
  const vertices = points.map(svgToUtm);
  return [
    "0", "LWPOLYLINE", "8", layer, "90", String(vertices.length), "70", closed ? "1" : "0",
    ...vertices.flatMap(([easting, northing]) => ["10", easting.toFixed(3), "20", northing.toFixed(3)]),
  ].join("\n");
}

const dxfEntities = [
  dxfPolyline("LINDEROS", layout.terrainScene.terrain, true),
  ...layout.residentialLots.map((lot) => dxfPolyline(`LOTES_${lot.blockId}`, lot.polygon, true)),
  ...layout.privateParkings.map((parking) => dxfPolyline("COCHERAS_PRIVADAS", parking.polygon, true)),
  ...layout.commonParkings.map((parking) => dxfPolyline("COCHERAS_COMUNES", parking.polygon, true)),
  ...layout.roads.map((road) => dxfPolyline(road.kind === "primary" ? "VIAS" : "SENDEROS", road.path, false)),
  ...layout.amenities.map((amenity) => dxfPolyline("AMENIDADES", amenity.polygon, true)),
];

const dxf = [
  "0", "SECTION", "2", "HEADER", "9", "$ACADVER", "1", "AC1027", "0", "ENDSEC",
  "0", "SECTION", "2", "ENTITIES", ...dxfEntities, "0", "ENDSEC", "0", "EOF",
].join("\n");

const typologyName: Record<string, string> = {
  premium: "Oasis",
  adjustment: "Horizonte",
  standard: "Jardín de Duna",
  "tiny-house": "Patio Lunar",
};

const csvRows = layout.residentialLots.map((lot) => [
  lot.number,
  lot.id,
  lot.blockId,
  typologyName[lot.typology] ?? lot.typology,
  lot.areaM2.toFixed(2),
  lot.frontage?.toFixed(2) ?? "",
  lot.depth?.toFixed(2) ?? "",
  lot.assignedParkingId ?? "",
  lot.walk_distance_parking_meters ?? "",
  lot.walk_distance_oasis_meters ?? "",
  lot.status,
  lot.buildableCircleDiameterM?.toFixed(2) ?? "",
  lot.fitsDome4m ? "SI" : "NO",
  lot.fitsDome8m ? "SI" : "NO",
  lot.price,
  lot.commercialPriceVersion ?? "",
].join(";"));

const csv = [
  "numero_v3;codigo_compatible;aldea;tipologia;area_m2;frente_m;fondo_m;cochera_asignada;recorrido_cochera_m;recorrido_oasis_m;estado;diametro_libre_m;cabida_domo_4m;cabida_domo_8m;precio_soles;version_precios",
  ...csvRows,
].join("\n");

const residentialArea = layout.residentialLots.reduce((sum, lot) => sum + lot.areaM2, 0);
const protectedLots = layout.residentialLots.filter((lot) => lot.status !== "available").length;
const report = `# Moon Paracas · Moon Constellations V3

- Estado: candidato conceptual para revisión urbanística, topográfica y municipal.
- Sistema de referencia: WGS 84 / UTM zona 18S (EPSG:32718).
- Lindero preservado: ${terrain.areaM2.toLocaleString("es-PE", { minimumFractionDigits: 2 })} m².
- Lotes residenciales: ${layout.residentialLots.length} distribuidos en seis aldeas orgánicas.
- Área residencial geométrica: ${residentialArea.toLocaleString("es-PE", { minimumFractionDigits: 2 })} m².
- Cocheras privadas: ${layout.privateParkings.length}; cocheras comunes: ${layout.commonParkings.length}.
- Movilidad: órbita vehicular de 6 m y treinta y seis paseos peatonales de 4 m.
- Caminata lote–cochera: máximo ${layout.quality.maximumParkingWalkM} m.
- Cabida circular mínima: Ø${layout.quality.minimumBuildableCircleDiameterM.toFixed(2)} m.
- Frente residencial mínimo: ${layout.quality.minimumFrontageM.toFixed(2)} m.
- Proporción máxima: ${layout.quality.maximumAspectRatio.toFixed(2)}:1.
- Esquina redondeada mínima: ${layout.quality.minimumPrimaryCornerAngleDeg.toFixed(2)}°.
- Inventario protegido: ${protectedLots}/22 IDs vendidos, reservados o en oferta conservados.
- IDs disponibles retirados: ${layout.retiredIds.join(", ")}.

Los archivos DXF y GeoJSON conservan coordenadas UTM para coordinación. Deben ser revisados y firmados por profesionales competentes antes de habilitación urbana, licencia, preventa contractual o ejecución de obra.
`;

const retirementCsv = [
  "id_retirado;estado_anterior;motivo",
  ...layout.releasedLots.map((lot) => `${lot.id};${lot.status};optimización orgánica V3`),
].join("\n");

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(resolve(outputDirectory, "moon-constellations-v3.geojson"), JSON.stringify(geojson, null, 2), "utf8"),
  writeFile(resolve(outputDirectory, "moon-constellations-v3.dxf"), dxf, "utf8"),
  writeFile(resolve(outputDirectory, "moon-constellations-v3-inventario.csv"), `\uFEFF${csv}`, "utf8"),
  writeFile(resolve(outputDirectory, "moon-constellations-v3-retiros.csv"), `\uFEFF${retirementCsv}`, "utf8"),
  writeFile(resolve(outputDirectory, "AUDITORIA-MASTERPLAN-V3.md"), report, "utf8"),
]);

console.log(`Entregables V3 generados en ${outputDirectory}`);
