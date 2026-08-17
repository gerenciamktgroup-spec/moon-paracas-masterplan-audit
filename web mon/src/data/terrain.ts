import { TerrainModel } from "../types/map";

export const terrain: TerrainModel = {
  areaM2: 112391.8,
  areaHa: 11.23918,
  perimeterMl: 1357.21,
  utmZone: "WGS84 UTM 18S",
  vertices: [
    { id: "A", utm: { e: 374763.556, n: 8460135.042 } },
    { id: "B", utm: { e: 374552.533, n: 8460334.307 } },
    { id: "C", utm: { e: 374772.257, n: 8460646.472 } },
    { id: "D", utm: { e: 374993.877, n: 8460441.531 } }
  ],
  edges: [
    { from: "A", to: "B", length: 290.24 },
    { from: "B", to: "C", length: 381.74 },
    { from: "C", to: "D", length: 301.85 },
    { from: "D", to: "A", length: 383.38 }
  ]
};
