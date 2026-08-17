import { Amenity, BlockPolygon } from "../types/map";
import { centroid } from "./geometry";

export function buildBlockLabels(blocks: BlockPolygon[]) {
  return blocks.map(block => ({
    id: block.id,
    text: block.id,
    point: centroid(block.polygon)
  }));
}

export function buildAmenityLabels(amenities: Amenity[]) {
  return amenities.map(a => ({
    id: a.id,
    text: a.kind,
    point: centroid(a.polygon)
  }));
}
