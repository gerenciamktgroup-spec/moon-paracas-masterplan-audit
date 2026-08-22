import lotsStatusMap from "../data/lots_status.json";
import type { Amenity, BlockPolygon, Lot, LotStatus, LotTypology, Road, XY } from "../types/map";
import { LOT_PRICE_PER_M2_USD, LOT_PRICE_PER_M2_PEN, PRIVATE_PARKING_PRICE_PEN, PRIVATE_PARKING_PRICE_USD } from "../config/pricing";
import { centroid } from "./geometry";

export const COURTYARD_MASTERPLAN_VERSION = "moon-paracas-orthogonal-120m2-v4";
export const COURTYARD_MASTERPLAN_LABEL = "Moon Paracas Masterplan 3D Oficial";
export const COURTYARD_RESIDENTIAL_COUNT = 384;
export const COURTYARD_PARKING_COUNT = 192;
export const COURTYARD_OASIS_AREA_M2 = 20662.15;
export const COURTYARD_TOTAL_AREA_M2 = 112554.30;

// SVG Canvas Coordinate Space: 800 × 800
const CANVAS_SIZE = 800;
const CENTER_X = 400;
const CENTER_Y = 360;

export interface MasterplanLayout {
  terrainScene: {
    terrain: XY[];
    innerBuffer: XY[];
  };
  blocks: BlockPolygon[];
  roads: Road[];
  amenities: Amenity[];
  lots: Lot[];
  allLots: Lot[];
}

/**
 * Creates a perfect orthogonal rectangle polygon (all 90-degree right angles)
 */
function rectPoly(x: number, y: number, w: number, h: number): XY[] {
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
}

/**
 * Generates an organic circular/elliptical polygon for water and landscaped areas
 */
function createLagoonPoly(cx: number, cy: number, rx: number, ry: number, points = 36): XY[] {
  const poly: XY[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wobble = 1 + 0.035 * Math.sin(angle * 4) + 0.025 * Math.cos(angle * 3);
    poly.push({
      x: cx + Math.cos(angle) * rx * wobble,
      y: cy + Math.sin(angle) * ry * wobble,
    });
  }
  return poly;
}

export function buildCourtyardMasterplan(): MasterplanLayout {
  const lots: Lot[] = [];
  const amenities: Amenity[] = [];
  const roads: Road[] = [];
  const blocks: BlockPolygon[] = [];

  const statusRecords = lotsStatusMap as Record<string, string>;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. TERRAIN BOUNDARY
  // ─────────────────────────────────────────────────────────────────────────────
  const terrain: XY[] = [
    { x: 30, y: 25 },
    { x: 770, y: 25 },
    { x: 770, y: 775 },
    { x: 30, y: 775 },
  ];
  const innerBuffer: XY[] = [
    { x: 50, y: 45 },
    { x: 750, y: 45 },
    { x: 750, y: 755 },
    { x: 50, y: 755 },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. CENTRAL OASIS (20,662.15 m²) & AMENITIES
  // ─────────────────────────────────────────────────────────────────────────────
  // A. Main Oasis Lagoon Pool
  const oasisLagoon = createLagoonPoly(CENTER_X, CENTER_Y, 74, 66);
  amenities.push({
    id: "AM_OASIS_LAGOON",
    kind: "pool",
    polygon: oasisLagoon,
    areaM2: 5000,
  });

  // B. Oasis Sand Beach & Central Deck Island
  const oasisDeck = createLagoonPoly(CENTER_X, CENTER_Y, 26, 20);
  amenities.push({
    id: "AM_OASIS_ISLAND",
    kind: "deck",
    polygon: oasisDeck,
    areaM2: 800,
  });

  // C. Bar & Lounge (North Edge of Oasis)
  amenities.push({
    id: "AM_BAR_LOUNGE",
    kind: "clubhouse",
    polygon: rectPoly(CENTER_X - 36, CENTER_Y - 84, 72, 18),
    areaM2: 650,
  });

  // D. Zona Chill Hamacas (West Edge of Oasis)
  amenities.push({
    id: "AM_CHILL_HAMACAS",
    kind: "sand-plaza",
    polygon: rectPoly(CENTER_X - 90, CENTER_Y - 22, 18, 44),
    areaM2: 450,
  });

  // E. Fogatas Sociales (East Edge of Oasis)
  amenities.push({
    id: "AM_FOGATAS_SOCIALES",
    kind: "firepit",
    polygon: rectPoly(CENTER_X + 72, CENTER_Y - 22, 18, 44),
    areaM2: 450,
  });

  // F. Yoga Deck (Southwest Edge of Oasis)
  amenities.push({
    id: "AM_YOGA_DECK",
    kind: "yoga-plaza",
    polygon: rectPoly(CENTER_X - 66, CENTER_Y + 42, 24, 22),
    areaM2: 380,
  });

  // G. Juegos Infantiles (Southeast Edge of Oasis)
  amenities.push({
    id: "AM_JUEGOS_INFANTILES",
    kind: "pocket-garden",
    polygon: rectPoly(CENTER_X + 42, CENTER_Y + 42, 24, 22),
    areaM2: 380,
  });

  // H. Welcome Center (Front Left)
  amenities.push({
    id: "AM_WELCOME_CENTER",
    kind: "welcome-center",
    polygon: rectPoly(140, 665, 120, 20),
    areaM2: 950,
  });

  // I. Lobby Vistas (Front Right)
  amenities.push({
    id: "AM_LOBBY_VISTAS",
    kind: "visitor-lobby",
    polygon: rectPoly(540, 665, 120, 20),
    areaM2: 950,
  });

  // J. Pórtico Monumental con Rotonda de Ingreso
  amenities.push({
    id: "AM_PORTICO_INGRESO",
    kind: "entry-plaza",
    polygon: createLagoonPoly(CENTER_X, 725, 28, 22, 24),
    areaM2: 1200,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. ROADS NETWORK (Perimeter + 4 Diagonal Avenues + Internal Aisles)
  // ─────────────────────────────────────────────────────────────────────────────
  // Outer perimeter road
  roads.push({
    id: "RD_PERIMETER",
    kind: "primary",
    widthM: 8,
    path: [
      { x: 55, y: 50 },
      { x: 745, y: 50 },
      { x: 745, y: 660 },
      { x: 55, y: 660 },
      { x: 55, y: 50 },
    ],
  });

  // Front access boulevard (South)
  roads.push({
    id: "RD_FRONT_BOULEVARD",
    kind: "primary",
    widthM: 10,
    path: [
      { x: 55, y: 660 },
      { x: 370, y: 660 },
      { x: 400, y: 755 },
      { x: 430, y: 660 },
      { x: 745, y: 660 },
    ],
  });

  // 4 Diagonal dividing avenues (Connecting corners to central Oasis at 45°)
  roads.push({
    id: "RD_DIAG_NW",
    kind: "primary",
    widthM: 7,
    path: [{ x: 65, y: 60 }, { x: CENTER_X - 80, y: CENTER_Y - 76 }],
  });
  roads.push({
    id: "RD_DIAG_NE",
    kind: "primary",
    widthM: 7,
    path: [{ x: 735, y: 60 }, { x: CENTER_X + 80, y: CENTER_Y - 76 }],
  });
  roads.push({
    id: "RD_DIAG_SW",
    kind: "primary",
    widthM: 7,
    path: [{ x: 65, y: 650 }, { x: CENTER_X - 80, y: CENTER_Y + 76 }],
  });
  roads.push({
    id: "RD_DIAG_SE",
    kind: "primary",
    widthM: 7,
    path: [{ x: 735, y: 650 }, { x: CENTER_X + 80, y: CENTER_Y + 76 }],
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. THE 4 ALDEAS (384 ORTHOGONAL 120 m² RESIDENTIAL LOTS = 96 × 4)
  // ─────────────────────────────────────────────────────────────────────────────

  // Helper to add a residential lot with 120 m2 area & unified 140 USD/m2 price
  function addResidentialLot(
    lotNum: number,
    villageNum: number,
    blockId: string,
    polygon: XY[],
    isPremium: boolean,
    isZen: boolean,
    isAdjustment: boolean,
    dimensions: string = "8.00 m × 15.00 m"
  ) {
    const lotId = `L${lotNum}`;
    const typology: LotTypology = isPremium
      ? "premium"
      : isZen
        ? "zen"
        : isAdjustment
          ? "adjustment"
          : "standard";

    // All residential parcels are 120.00 m2
    const areaM2 = 120.0;
    // 140 USD per m2 = $16,800 USD (S/ 63,000 PEN at 3.75)
    const priceUSD = Math.round(areaM2 * LOT_PRICE_PER_M2_USD); // 16,800 USD
    const pricePEN = Math.round(areaM2 * LOT_PRICE_PER_M2_PEN); // 63,000 PEN

    const statusRecord = statusRecords[lotId];
    let status: LotStatus = (statusRecord as LotStatus) || "available";
    if (!statusRecord) {
      if (lotNum % 17 === 0) status = "sold";
      else if (lotNum % 11 === 0) status = "reserved";
      else if (lotNum % 19 === 0) status = "offer";
    }

    const center = centroid(polygon);

    lots.push({
      id: lotId,
      number: lotNum,
      blockId,
      projectId: "moon-paracas",
      typology,
      status,
      areaM2,
      area: areaM2,
      price: pricePEN,
      price_soles: pricePEN,
      polygon,
      dimensions,
      frontage: dimensions.startsWith("15") ? 15 : 8,
      depth: dimensions.startsWith("15") ? 8 : 15,
      quadrant: `Aldea ${villageNum}`,
      elevation: 15.0,
      distanceToPool: Math.round(Math.sqrt((center.x - CENTER_X) ** 2 + (center.y - CENTER_Y) ** 2) * 0.45),
      hubDistance: Math.round(Math.sqrt((center.x - CENTER_X) ** 2 + (center.y - CENTER_Y) ** 2) * 0.45),
      walk_distance_oasis_meters: Math.round(Math.sqrt((center.x - CENTER_X) ** 2 + (center.y - CENTER_Y) ** 2) * 0.45),
      walk_distance_parking_meters: Math.round(Math.abs(center.y - 700) * 0.5),
      fitsDome4m: true,
      fitsDome8m: true,
      recommendedDomeDiameterM: 8,
      buildableCircleDiameterM: 8.5,
      placementSource: "masterplan-v4",
      masterplanVersion: COURTYARD_MASTERPLAN_VERSION,
    });
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // ALDEA 1 (OESTE / VERDE · 96 LOTES: L1 a L96)
  // 6 Columnas verticales (8m × 15m). Distancias calculadas sin superposición
  // ═════════════════════════════════════════════════════════════════════════════
  const ALDEA1_COL_CONFIG = [
    { x: 260, w: 28, count: 10, yStart: 265, yEnd: 455, isOasisFront: true },
    { x: 226, w: 28, count: 12, yStart: 240, yEnd: 480, isOasisFront: false },
    { x: 192, w: 28, count: 14, yStart: 210, yEnd: 510, isOasisFront: false },
    { x: 158, w: 28, count: 18, yStart: 170, yEnd: 550, isOasisFront: false },
    { x: 124, w: 28, count: 20, yStart: 135, yEnd: 585, isOasisFront: false },
    { x: 90,  w: 28, count: 22, yStart: 100, yEnd: 620, isOasisFront: false },
  ];

  let currentLotA1 = 1;
  for (let ci = 0; ci < ALDEA1_COL_CONFIG.length; ci++) {
    const col = ALDEA1_COL_CONFIG[ci];
    const lotHeight = (col.yEnd - col.yStart) / col.count;

    // Internal pedestrian street
    if (ci > 0) {
      roads.push({
        id: `RD_A1_STR_${ci}`,
        kind: "pedestrian",
        widthM: 4.0,
        path: [
          { x: col.x + col.w + 3, y: col.yStart },
          { x: col.x + col.w + 3, y: col.yEnd },
        ],
      });
    }

    for (let ri = 0; ri < col.count; ri++) {
      const ly = col.yStart + ri * lotHeight;
      const poly = rectPoly(col.x + 0.5, ly + 0.5, col.w - 1, lotHeight - 1);
      const isOasisPremium = col.isOasisFront;
      const isZen = !isOasisPremium && (ri === 2 || ri === col.count - 3) && (ci === 1 || ci === 2);
      const isAdjustment = ri === 0 || ri === col.count - 1;

      addResidentialLot(currentLotA1, 1, "A1", poly, isOasisPremium, isZen, isAdjustment, "8.00 m × 15.00 m");
      currentLotA1++;
    }
  }

  blocks.push({
    id: "BLK_ALDEA_1",
    role: "residential-village",
    polygon: [
      { x: 85, y: 90 },
      { x: 292, y: 255 },
      { x: 292, y: 465 },
      { x: 85, y: 630 },
    ],
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // ALDEA 2 (NORTE / DORADO · 96 LOTES: L97 a L192)
  // 6 Filas horizontales (15m × 8m). Margen superior e inferior despejado
  // ═════════════════════════════════════════════════════════════════════════════
  const ALDEA2_ROW_CONFIG = [
    { y: 232, h: 20, count: 10, xStart: 305, xEnd: 495, isOasisFront: true },
    { y: 202, h: 22, count: 12, xStart: 275, xEnd: 525, isOasisFront: false },
    { y: 170, h: 24, count: 14, xStart: 240, xEnd: 560, isOasisFront: false },
    { y: 136, h: 26, count: 18, xStart: 200, xEnd: 600, isOasisFront: false },
    { y: 100, h: 28, count: 20, xStart: 165, xEnd: 635, isOasisFront: false },
    { y: 62,  h: 30, count: 22, xStart: 130, xEnd: 670, isOasisFront: false },
  ];

  let currentLotA2 = 97;
  for (let ri = 0; ri < ALDEA2_ROW_CONFIG.length; ri++) {
    const row = ALDEA2_ROW_CONFIG[ri];
    const lotWidth = (row.xEnd - row.xStart) / row.count;

    // Internal pedestrian street
    if (ri > 0) {
      roads.push({
        id: `RD_A2_STR_${ri}`,
        kind: "pedestrian",
        widthM: 4.0,
        path: [
          { x: row.xStart, y: row.y + row.h + 2.5 },
          { x: row.xEnd,   y: row.y + row.h + 2.5 },
        ],
      });
    }

    for (let ci = 0; ci < row.count; ci++) {
      const lx = row.xStart + ci * lotWidth;
      const poly = rectPoly(lx + 0.5, row.y + 0.5, lotWidth - 1, row.h - 1);
      const isOasisPremium = row.isOasisFront;
      const isZen = !isOasisPremium && (ci === 2 || ci === row.count - 3) && (ri === 1 || ri === 2);
      const isAdjustment = ci === 0 || ci === row.count - 1;

      addResidentialLot(currentLotA2, 2, "A2", poly, isOasisPremium, isZen, isAdjustment, "15.00 m × 8.00 m");
      currentLotA2++;
    }
  }

  blocks.push({
    id: "BLK_ALDEA_2",
    role: "residential-village",
    polygon: [
      { x: 120, y: 55 },
      { x: 680, y: 55 },
      { x: 505, y: 258 },
      { x: 295, y: 258 },
    ],
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // ALDEA 3 (ESTE / NARANJA · 96 LOTES: L193 a L288)
  // 6 Columnas verticales (8m × 15m). Distancias calculadas sin superposición
  // ═════════════════════════════════════════════════════════════════════════════
  const ALDEA3_COL_CONFIG = [
    { x: 512, w: 28, count: 10, yStart: 265, yEnd: 455, isOasisFront: true },
    { x: 546, w: 28, count: 12, yStart: 240, yEnd: 480, isOasisFront: false },
    { x: 580, w: 28, count: 14, yStart: 210, yEnd: 510, isOasisFront: false },
    { x: 614, w: 28, count: 18, yStart: 170, yEnd: 550, isOasisFront: false },
    { x: 648, w: 28, count: 20, yStart: 135, yEnd: 585, isOasisFront: false },
    { x: 682, w: 28, count: 22, yStart: 100, yEnd: 620, isOasisFront: false },
  ];

  let currentLotA3 = 193;
  for (let ci = 0; ci < ALDEA3_COL_CONFIG.length; ci++) {
    const col = ALDEA3_COL_CONFIG[ci];
    const lotHeight = (col.yEnd - col.yStart) / col.count;

    // Internal pedestrian street
    if (ci > 0) {
      roads.push({
        id: `RD_A3_STR_${ci}`,
        kind: "pedestrian",
        widthM: 4.0,
        path: [
          { x: col.x - 3, y: col.yStart },
          { x: col.x - 3, y: col.yEnd },
        ],
      });
    }

    for (let ri = 0; ri < col.count; ri++) {
      const ly = col.yStart + ri * lotHeight;
      const poly = rectPoly(col.x + 0.5, ly + 0.5, col.w - 1, lotHeight - 1);
      const isOasisPremium = col.isOasisFront;
      const isZen = !isOasisPremium && (ri === 2 || ri === col.count - 3) && (ci === 1 || ci === 2);
      const isAdjustment = ri === 0 || ri === col.count - 1;

      addResidentialLot(currentLotA3, 3, "A3", poly, isOasisPremium, isZen, isAdjustment, "8.00 m × 15.00 m");
      currentLotA3++;
    }
  }

  blocks.push({
    id: "BLK_ALDEA_3",
    role: "residential-village",
    polygon: [
      { x: 715, y: 90 },
      { x: 715, y: 630 },
      { x: 508, y: 465 },
      { x: 508, y: 255 },
    ],
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // ALDEA 4 (SUR / BEIGE · 96 LOTES: L289 a L384)
  // 6 Filas horizontales (15m × 8m). Margen superior e inferior despejado
  // ═════════════════════════════════════════════════════════════════════════════
  const ALDEA4_ROW_CONFIG = [
    { y: 468, h: 20, count: 10, xStart: 305, xEnd: 495, isOasisFront: true },
    { y: 496, h: 22, count: 12, xStart: 275, xEnd: 525, isOasisFront: false },
    { y: 526, h: 24, count: 14, xStart: 240, xEnd: 560, isOasisFront: false },
    { y: 558, h: 26, count: 18, xStart: 200, xEnd: 600, isOasisFront: false },
    { y: 592, h: 28, count: 20, xStart: 165, xEnd: 635, isOasisFront: false },
    { y: 628, h: 30, count: 22, xStart: 130, xEnd: 670, isOasisFront: false },
  ];

  let currentLotA4 = 289;
  for (let ri = 0; ri < ALDEA4_ROW_CONFIG.length; ri++) {
    const row = ALDEA4_ROW_CONFIG[ri];
    const lotWidth = (row.xEnd - row.xStart) / row.count;

    // Internal pedestrian street
    if (ri > 0) {
      roads.push({
        id: `RD_A4_STR_${ri}`,
        kind: "pedestrian",
        widthM: 4.0,
        path: [
          { x: row.xStart, y: row.y - 2.5 },
          { x: row.xEnd,   y: row.y - 2.5 },
        ],
      });
    }

    for (let ci = 0; ci < row.count; ci++) {
      const lx = row.xStart + ci * lotWidth;
      const poly = rectPoly(lx + 0.5, row.y + 0.5, lotWidth - 1, row.h - 1);
      const isOasisPremium = row.isOasisFront;
      const isZen = !isOasisPremium && (ci === 2 || ci === row.count - 3) && (ri === 1 || ri === 2);
      const isAdjustment = ci === 0 || ci === row.count - 1;

      addResidentialLot(currentLotA4, 4, "A4", poly, isOasisPremium, isZen, isAdjustment, "15.00 m × 8.00 m");
      currentLotA4++;
    }
  }

  blocks.push({
    id: "BLK_ALDEA_4",
    role: "residential-village",
    polygon: [
      { x: 120, y: 662 },
      { x: 295, y: 462 },
      { x: 505, y: 462 },
      { x: 680, y: 662 },
    ],
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. COCHERAS PLUS (192 PARKING SPOTS: 96 WEST + 96 EAST)
  // ─────────────────────────────────────────────────────────────────────────────
  // A. Welcome Center Parking (West side: P1 to P96, 4 rows of 24 spots)
  let parkingNum = 1;
  const westParkingXStart = 75;
  const westParkingXEnd = 360;
  const westParkingYStart = 692;
  const parkingWidth = (westParkingXEnd - westParkingXStart) / 24;
  const parkingHeight = 11;

  for (let pr = 0; pr < 4; pr++) {
    const py = westParkingYStart + pr * 13.5;
    for (let pc = 0; pc < 24; pc++) {
      const px = westParkingXStart + pc * parkingWidth;
      const poly = rectPoly(px + 0.8, py, parkingWidth - 1.6, parkingHeight);

      const pId = `P${parkingNum}`;
      lots.push({
        id: pId,
        number: parkingNum,
        blockId: "PK_WEST",
        projectId: "moon-paracas",
        typology: "parking",
        status: parkingNum % 5 === 0 ? "reserved" : parkingNum % 8 === 0 ? "sold" : "available",
        areaM2: 12.5,
        area: 12.5,
        price: PRIVATE_PARKING_PRICE_PEN,
        price_soles: PRIVATE_PARKING_PRICE_PEN,
        polygon: poly,
        dimensions: "2.50 m × 5.00 m",
        quadrant: "Welcome Center Cocheras",
        elevation: 15.0,
        distanceToPool: 320,
        hubDistance: 320,
        fitsDome4m: false,
        fitsDome8m: false,
        placementSource: "masterplan-v4",
        masterplanVersion: COURTYARD_MASTERPLAN_VERSION,
      });
      parkingNum++;
    }
  }

  // B. Lobby Vistas Parking (East side: P97 to P192, 4 rows of 24 spots)
  const eastParkingXStart = 440;
  const eastParkingXEnd = 725;
  const eastParkingWidth = (eastParkingXEnd - eastParkingXStart) / 24;

  for (let pr = 0; pr < 4; pr++) {
    const py = westParkingYStart + pr * 13.5;
    for (let pc = 0; pc < 24; pc++) {
      const px = eastParkingXStart + pc * eastParkingWidth;
      const poly = rectPoly(px + 0.8, py, eastParkingWidth - 1.6, parkingHeight);

      const pId = `P${parkingNum}`;
      lots.push({
        id: pId,
        number: parkingNum,
        blockId: "PK_EAST",
        projectId: "moon-paracas",
        typology: "parking",
        status: parkingNum % 6 === 0 ? "reserved" : parkingNum % 9 === 0 ? "sold" : "available",
        areaM2: 12.5,
        area: 12.5,
        price: PRIVATE_PARKING_PRICE_PEN,
        price_soles: PRIVATE_PARKING_PRICE_PEN,
        polygon: poly,
        dimensions: "2.50 m × 5.00 m",
        quadrant: "Lobby Vistas Cocheras",
        elevation: 15.0,
        distanceToPool: 320,
        hubDistance: 320,
        fitsDome4m: false,
        fitsDome8m: false,
        placementSource: "masterplan-v4",
        masterplanVersion: COURTYARD_MASTERPLAN_VERSION,
      });
      parkingNum++;
    }
  }

  return {
    terrainScene: { terrain, innerBuffer },
    blocks,
    roads,
    amenities,
    lots,
    allLots: lots,
  };
}
