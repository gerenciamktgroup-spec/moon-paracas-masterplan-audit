import { Lot, LotStatus, LotTypology, XY } from "../types/map";
import { shoelaceArea, isPointInPolygon, centroid } from "./geometry";
import { METER_TO_SVG_SCALE, getLocalTerrainBounds } from "./terrainModel";
import { BLOCK_SPECS } from "../data/business";
import { COMMERCIAL_PRICE_VERSION, getLotPricePerM2 } from "../config/pricing";

interface CadFeatureProperties {
  stableId: string;
  blockId: string;
  lotId: string;
  label: string;
  typology: LotTypology | string;
  status: LotStatus | string;
  version: string;
}

export interface CadImportReport {
  isValid: boolean;
  errors: string[];
  totalLots: number;
  blocksFound: string[];
  missingBlocks: string[];
  newLotsCount: number;
  expectedLotCount: number;
  versionMismatch: boolean;
}

export interface CadImportResult {
  lots: Lot[];
  report: CadImportReport;
}

export function validateAndLoadCadLots(geoJson: any, currentVersion: string = "1.0"): CadImportResult {
  const lots: Lot[] = [];
  const errors: string[] = [];
  const report: CadImportReport = {
    isValid: true,
    errors: errors,
    totalLots: 0,
    blocksFound: [],
    missingBlocks: [],
    newLotsCount: 0,
    expectedLotCount: BLOCK_SPECS.reduce((sum, b) => sum + b.targetLotCount, 0),
    versionMismatch: false
  };

  if (!geoJson || geoJson.type !== "FeatureCollection" || !Array.isArray(geoJson.features)) {
    errors.push("Invalid GeoJSON format. Expected a FeatureCollection.");
    report.isValid = false;
    return { lots, report };
  }

  const seenStableIds = new Set<string>();
  const seenLotIds = new Set<string>();
  const blocksSet = new Set<string>();
  const bounds = getLocalTerrainBounds();

  for (let i = 0; i < geoJson.features.length; i++) {
    const feature = geoJson.features[i];

    if (!feature.geometry || feature.geometry.type !== "Polygon") {
      errors.push(`Feature [${i}]: Geometry must be a Polygon.`);
      continue;
    }

    const exteriorRing = feature.geometry.coordinates[0];
    if (!Array.isArray(exteriorRing) || exteriorRing.length < 4) {
      errors.push(`Feature [${i}]: Polygon must have >= 4 coordinates.`);
      continue;
    }

    const firstPt = exteriorRing[0];
    const lastPt = exteriorRing[exteriorRing.length - 1];
    if (firstPt[0] !== lastPt[0] || firstPt[1] !== lastPt[1]) {
      errors.push(`Feature [${i}]: Polygon is not closed.`);
      continue;
    }

    const props = feature.properties as CadFeatureProperties;
    if (!props) {
      errors.push(`Feature [${i}]: Missing properties.`);
      continue;
    }
    
    const requiredFields = ["stableId", "blockId", "lotId", "label", "typology", "status", "version"];
    let missingProps = false;
    for (const field of requiredFields) {
      if (!props[field as keyof CadFeatureProperties]) {
        errors.push(`Feature [${i}]: Missing required property '${field}'.`);
        missingProps = true;
      }
    }
    if (missingProps) continue;

    if (props.version !== currentVersion) {
      report.versionMismatch = true;
    }

    const compositeLotId = `${props.blockId}-${props.lotId}`;
    if (seenStableIds.has(props.stableId)) {
      errors.push(`Duplicate stableId '${props.stableId}'.`);
      continue;
    }
    if (seenLotIds.has(compositeLotId)) {
      errors.push(`Duplicate Block/Lot ID '${compositeLotId}'.`);
      continue;
    }
    seenStableIds.add(props.stableId);
    seenLotIds.add(compositeLotId);
    blocksSet.add(props.blockId);

    const polygon: XY[] = exteriorRing.slice(0, -1).map((coord: number[]) => ({
      x: coord[0],
      y: coord[1]
    }));

    // SPATIAL BOUNDARY VALIDATION
    const polyCentroid = centroid(polygon);
    if (!isPointInPolygon(polyCentroid, bounds.outer)) {
      errors.push(`Feature [${compositeLotId}]: Centroid is OUTSIDE the accepted masterplan boundary.`);
    }

    const svgArea = shoelaceArea(polygon);
    const realArea = svgArea / (METER_TO_SVG_SCALE * METER_TO_SVG_SCALE);

    if (realArea <= 0.1) {
      errors.push(`Feature [${compositeLotId}]: Area is zero or negative.`);
      continue;
    }

    const typology = props.typology as LotTypology;
    const price = Math.round(realArea * getLotPricePerM2(typology));

    lots.push({
      id: compositeLotId,
      blockId: props.blockId,
      typology,
      status: props.status as LotStatus,
      areaM2: realArea,
      polygon: polygon,
      priceLabel: `S/ ${price.toLocaleString("es-PE")}`,
      price,
      number: parseInt(props.lotId.replace(/\D/g, ''), 10) || (i + 1),
      quadrant: props.blockId,
      area: realArea,
      elevation: 108,
      distanceToPool: 40,
      hubDistance: 20,
      price_soles: price,
      commercialPriceVersion: COMMERCIAL_PRICE_VERSION,
    });
  }

  // INVENTORY CONSISTENCY
  report.totalLots = lots.length;
  report.blocksFound = Array.from(blocksSet).sort();
  
  const expectedBlocks = BLOCK_SPECS.map(b => b.id);
  report.missingBlocks = expectedBlocks.filter(b => !blocksSet.has(b));
  report.newLotsCount = lots.length - report.expectedLotCount;

  if (errors.length > 0) {
    report.isValid = false;
  }

  return { lots, report };
}
