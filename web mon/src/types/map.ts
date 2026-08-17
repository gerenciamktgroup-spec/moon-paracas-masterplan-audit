export type XY = { x: number; y: number };
export type UTM = { e: number; n: number };

export type VertexId = "A" | "B" | "C" | "D";

export type TerrainVertex = {
  id: VertexId;
  utm: UTM;
};

export type TerrainEdge = {
  from: VertexId;
  to: VertexId;
  length: number;
};

export type TerrainModel = {
  areaM2: number;
  areaHa: number;
  perimeterMl: number;
  utmZone: string;
  vertices: TerrainVertex[];
  edges: TerrainEdge[];
};

export type LotStatus = "available" | "offer" | "sold" | "blocked" | "reserved";
export type LotTypology = "standard" | "premium" | "adjustment" | "zen" | "tiny-house" | "parking" | "parking-external";

export type BlockRole =
  | "inner-oasis"
  | "middle-ring"
  | "outer-ring"
  | "north-reserve";

export type BlockSpec = {
  id: string;
  role: BlockRole;
  targetLotCount: number;
  targetNetAreaM2: number;
  lotMix: {
    standard: number;
    premium: number;
    adjustment: number;
    zen?: number;
    "tiny-house"?: number;
  };
};

export type Road = {
  id: string;
  kind: "primary" | "secondary" | "pedestrian";
  widthM: number;
  path: XY[];
};

export type Amenity = {
  id: string;
  kind:
    | "entry-plaza"
    | "parking"
    | "clubhouse"
    | "pool"
    | "deck"
    | "firepit"
    | "sand-plaza"
    | "moon-deck"
    | "xerophytic-garden"
    | "yoga-plaza"
    | "water-mirror"
    | "pocket-garden"
    | "palm-forest"
    | "bus-bay"
    | "welcome-center"
    | "helipad"
    | "gatehouse"
    | "gatehouse-roof"
    | "parking-driveway"
    | "visitor-lobby"
    | "parking-spot";
  polygon: XY[];
  areaM2?: number;
};

export type BlockPolygon = {
  id: string;
  role: string;
  polygon: XY[];
  labelPoint?: XY;
  ringData?: {
    innerPoly: XY[];
    outerPoly: XY[];
    t_start: number;
    t_end: number;
    t_start_low?: number;
    t_start_high?: number;
    isFirstRow?: boolean;
  };
  vehiclesAllowed?: boolean;
};

export type Lot = {
  id: string;
  /** Previous procedural identifier, used only to preserve remote inventory state during migration. */
  legacyId?: string;
  blockId: string;
  projectId?: "moon-paracas" | "paracas-dome";
  typology: LotTypology;
  status: LotStatus;
  areaM2: number;
  polygon: XY[];
  dimensions?: string;
  priceLabel?: string;
  availableOffers?: string[];
  defaultOfferId?: string;
  
  // Legacy compatibility for UI
  price: number;
  number: number | string;
  quadrant: string;
  area: number;
  elevation: number;
  distanceToPool: number;
  hubDistance: number;

  // Custom metadata fields
  frontage?: number;
  depth?: number;
  price_soles?: number;
  parking_type?: string;
  walk_distance_parking_meters?: number;
  walk_distance_oasis_meters?: number;
  placementSource?: "technical-inventory" | "procedural" | "masterplan-v2" | "masterplan-v3" | "masterplan-v4";
  masterplanVersion?: string;
  commercialPriceVersion?: string;
  assignedParkingId?: string;
  /** Largest circular footprint geometrically contained by the parcel polygon. */
  buildableCircleCenter?: XY;
  buildableCircleDiameterM?: number;
  fitsDome4m?: boolean;
  fitsDome8m?: boolean;
  recommendedDomeDiameterM?: 4 | 8;
};

export type SalesFilters = {
  search: string;
  blockId: string | "all";
  status: LotStatus | "all";
  typology: LotTypology | "all";
};

export type MasterplanScene = {
  terrain: XY[];
  innerBuffer: XY[];
  roads: Road[];
  amenities: Amenity[];
  blocks: BlockPolygon[];
  lots: Lot[];
};
