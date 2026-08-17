import { Lot, XY, Road, Amenity } from "../types/map";
import { PARACAS_DOME_OFFERS, PARACAS_DOME_PROJECT } from "../data/paracasDome";

export type DomeScene = {
  terrain: XY[];
  roads: Road[];
  amenities: Amenity[];
  lots: Lot[];
};

// Generates the layout for Paracas Dome (50 lots and Founder/Comfort offers).
export function buildDomeScene(): DomeScene {
  const lots: Lot[] = [];
  const amenities: Amenity[] = [];
  const roads: Road[] = [];

  // SVG dimensions: width = 800, height = 400
  // Metric dimensions: 500m width, 300m height (15 Ha)
  const terrain: XY[] = [
    { x: 0, y: 0 },
    { x: 800, y: 0 },
    { x: 800, y: 400 },
    { x: 0, y: 400 }
  ];

  // Grid specs: 11 columns, 5 rows
  const colWidth = 60;
  const colGap = 6;
  const rowHeight = 60;
  const roadHeight = 16;
  const rowGap = 4;

  // Horizontal roads path
  roads.push({
    id: "ROAD-H1",
    kind: "primary",
    widthM: 8,
    path: [{ x: 10, y: 98 }, { x: 790, y: 98 }]
  });
  roads.push({
    id: "ROAD-H2",
    kind: "primary",
    widthM: 8,
    path: [{ x: 10, y: 302 }, { x: 790, y: 302 }]
  });

  // Helper to generate a rectangle polygon
  const makeRect = (x: number, y: number, w: number, h: number): XY[] => [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h }
  ];

  let lotCounter = 1;

  for (let row = 1; row <= 5; row++) {
    // Determine Y coordinate
    let y = 30;
    if (row === 1) y = 30;
    else if (row === 2) y = 30 + 60 + 16; // Row 1 + Road 1
    else if (row === 3) y = 30 + 60 + 16 + 60 + 4; // Row 2 + Gap 1
    else if (row === 4) y = 30 + 60 + 16 + 60 + 4 + 60 + 4; // Row 3 + Gap 2
    else if (row === 5) y = 30 + 60 + 16 + 60 + 4 + 60 + 4 + 60 + 16; // Row 4 + Road 2

    for (let col = 1; col <= 11; col++) {
      const x = 30 + (col - 1) * (colWidth + colGap);

      // Row 3 has special non-residential plots
      if (row === 3) {
        if (col === 1) {
          // Garita / Gatehouse
          amenities.push({
            id: "DOME-GATEHOUSE",
            kind: "gatehouse",
            polygon: makeRect(x, y, colWidth, rowHeight),
            areaM2: 2000
          });
          continue;
        }
        if (col === 2) {
          // Visitor Parking
          amenities.push({
            id: "DOME-PARKING",
            kind: "parking",
            polygon: makeRect(x, y, colWidth, rowHeight),
            areaM2: 2000
          });
          continue;
        }
        if (col === 6 || col === 7) {
          // Both Col 6 and 7 are merged to form the 3,000 m2 Common Area (Oasis Central)
          if (col === 6) {
            amenities.push({
              id: "DOME-COMMON",
              kind: "pool",
              polygon: makeRect(x, y, colWidth * 2 + colGap, rowHeight),
            areaM2: 4000 // Two light-equipment cells; the remaining project area stays as buffer, access and landscape.
            });
          }
          continue;
        }
        if (col === 11) {
          // Green buffer / lookout point
          amenities.push({
            id: "DOME-LOOKOUT",
            kind: "xerophytic-garden",
            polygon: makeRect(x, y, colWidth, rowHeight),
            areaM2: 2000
          });
          continue;
        }
      }

      // Residential Lot
      const lotId = `D-${lotCounter}`;
      const founderOffer = PARACAS_DOME_OFFERS[0];
      lots.push({
        id: lotId,
        blockId: `Fila ${row}`,
        projectId: PARACAS_DOME_PROJECT.id,
        typology: row === 1 || row === 5 ? "premium" : "standard",
        status: "available", // Will be synchronized with Firestore
        areaM2: PARACAS_DOME_PROJECT.lotAreaM2,
        polygon: makeRect(x, y, colWidth, rowHeight),
        dimensions: "40m x 50m",
        priceLabel: "Desde S/ 70,000",
        price: founderOffer.publicPrice,
        number: lotCounter,
        quadrant: `F${row}-C${col}`,
        area: PARACAS_DOME_PROJECT.lotAreaM2,
        elevation: 12 + Math.random() * 2, // Elevation in Paracas
        distanceToPool: Math.round(Math.sqrt(Math.pow(x - 390, 2) + Math.pow(y - 200, 2)) * 0.625), // walk distance meters
        hubDistance: Math.round(Math.sqrt(Math.pow(x - 60, 2) + Math.pow(y - 200, 2)) * 0.625),
        frontage: 40,
        depth: 50,
        price_soles: founderOffer.publicPrice,
        defaultOfferId: founderOffer.id,
        availableOffers: PARACAS_DOME_OFFERS.map((offer) => offer.id),
        parking_type: "externo_ingreso",
        walk_distance_parking_meters: Math.round(Math.sqrt(Math.pow(x - 120, 2) + Math.pow(y - 200, 2)) * 0.625),
        walk_distance_oasis_meters: Math.round(Math.sqrt(Math.pow(x - 390, 2) + Math.pow(y - 200, 2)) * 0.625)
      });

      lotCounter++;
    }
  }

  return { terrain, roads, amenities, lots };
}
