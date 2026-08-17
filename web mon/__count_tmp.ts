import { buildConstellationMasterplan } from "./src/lib/constellationModel";
import { buildOrganicConstellationMasterplan, ORGANIC_RESIDENTIAL_COUNT } from "./src/lib/organicConstellationModel";
import { buildCourtyardMasterplan, COURTYARD_RESIDENTIAL_COUNT } from "./src/lib/courtyardMasterplanModel";
const t0 = Date.now();
const v2 = buildConstellationMasterplan();
const t1 = Date.now();
const v3 = buildOrganicConstellationMasterplan();
const t2 = Date.now();
const v4 = buildCourtyardMasterplan();
const t3 = Date.now();
console.log(JSON.stringify({
  v2: { res: v2.residentialLots.length, priv: v2.privateParkings.length, common: v2.commonParkings.length, released: v2.releasedLots.length, all: v2.allLots.length, ms: t1-t0 },
  v3: { res: v3.residentialLots.length, priv: v3.privateParkings.length, common: v3.commonParkings.length, all: v3.allLots.length, CONST: ORGANIC_RESIDENTIAL_COUNT, ms: t2-t1 },
  v4: { res: v4.residentialLots.length, priv: v4.privateParkings.length, common: v4.commonParkings.length, all: v4.allLots.length, CONST: COURTYARD_RESIDENTIAL_COUNT, ms: t3-t2, quality: v4.quality, retired: v4.retiredIds.length, roads: v4.roads.length, amen: v4.amenities.length },
  totalMs: t3-t0,
}, null, 2));
