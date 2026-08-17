import { XY } from "../types/map";
import * as turf from "@turf/turf";
import { centroid, isPointInPolygon } from "./geometry";
import { getMeterToSvgScale, buildTerrainScene } from "./terrainModel";

/**
 * Helper to convert an XY array to a Turf Polygon geometry.
 * Turf expects the first and last coordinates to be identical to close the ring.
 */
export function xyToTurfPolygon(pts: XY[]): any {
  if (pts.length < 3) throw new Error("A polygon must have at least 3 points");
  const coords = pts.map(p => [p.x, p.y]);
  // Close the polygon if not closed
  if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
    coords.push([...coords[0]]);
  }
  return turf.polygon([coords]);
}

/**
 * Convert a Turf Polygon/MultiPolygon feature back to an array of XY rings.
 * Returns an array of rings, where each ring is an array of XY.
 */
export function turfToXYRings(feature: any): XY[][] {
  const rings: XY[][] = [];
  const geom = feature.geometry;

  if (geom.type === "Polygon") {
    geom.coordinates.forEach(ring => {
      rings.push(ring.map(c => ({ x: c[0], y: c[1] })));
    });
  } else if (geom.type === "MultiPolygon") {
    geom.coordinates.forEach(poly => {
      poly.forEach(ring => {
        rings.push(ring.map(c => ({ x: c[0], y: c[1] })));
      });
    });
  }

  return rings;
}

/**
 * Planar shrink towards centroid by a distance in meters.
 * This works perfectly on SVG coordinates without geographic distortions.
 */
export function shrinkPolyPlanar(poly: XY[], amountMeters: number, scale: number): XY[] {
  if (poly.length < 3) return poly;
  const c = centroid(poly);
  const amountPx = amountMeters * scale;
  
  return poly.map(p => {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return p;
    // Shrink by amountPx, but don't cross the centroid
    const factor = Math.max(0.01, len - amountPx) / len;
    return {
      x: c.x + dx * factor,
      y: c.y + dy * factor
    };
  });
}

/**
 * Subtracts all 'obstacles' from the 'base' polygon.
 * Returns the exact remaining empty spaces as an array of XY rings.
 */
export function findEmptySpaces(base: XY[], obstacles: XY[][]): XY[][] {
  try {
    let freeSpace: any = xyToTurfPolygon(base);

    obstacles.forEach(obs => {
      if (obs.length < 3) return;
      try {
        const obsPoly = xyToTurfPolygon(obs);
        // Compute difference
        const diff = turf.difference(turf.featureCollection([freeSpace, obsPoly]));
        if (diff) {
          freeSpace = diff as any;
        }
      } catch (e) {
        // Turf might fail on invalid polygons (e.g., self-intersecting)
        console.warn("Turf difference failed on obstacle", e);
      }
    });

    return turfToXYRings(freeSpace);
  } catch (err) {
    console.error("findEmptySpaces failed", err);
    return [];
  }
}

/**
 * Checks if a candidate polygon overlaps with ANY of the obstacles.
 * Returns true if there is a collision, false if it's completely safe and empty.
 * Uses a tiny 0.1m negative planar buffer to allow adjacent boundaries to touch.
 */
export function checkCollision(candidate: XY[], obstacles: XY[][], shrinkM = 0.1): boolean {
  try {
    if (candidate.length < 3) return false;
    const scale = getMeterToSvgScale();
    const shrunkCand = shrinkPolyPlanar(candidate, shrinkM, scale);
    const tCand = xyToTurfPolygon(shrunkCand);
    
    for (const obs of obstacles) {
      if (obs.length < 3) continue;
      try {
        // Shrink obstacle slightly as well to avoid touching edges
        const shrunkObs = shrinkPolyPlanar(obs, shrinkM, scale);
        const tObs = xyToTurfPolygon(shrunkObs);
        
        // If they intersect, there is a collision
        const intersect = turf.intersect(turf.featureCollection([tCand, tObs]));
        if (intersect) {
          return true; // Collision detected!
        }
      } catch (e) {
        // Ignore invalid obstacle geometries
      }
    }
    return false; // Safe, no collisions
  } catch (err) {
    console.warn("checkCollision failed, assuming collision to be safe", err);
    return true; 
  }
}

/**
  * Assertion that throws if any vertex of the polygon is outside the legal terrain boundary.
  */
export function assertInsidePerimeter(polygon: XY[], label: string) {
  const { terrain } = buildTerrainScene();
  for (const pt of polygon) {
    if (!isPointInPolygon(pt, terrain)) {
      throw new Error(`PERIMETER VIOLATION: Polygon for ${label} has a vertex (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) outside the legal terrain perimeter.`);
    }
  }
}
