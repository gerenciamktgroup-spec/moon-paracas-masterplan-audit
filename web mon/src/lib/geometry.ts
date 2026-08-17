import { XY } from "../types/map";

export function pathFromPolygon(points: XY[]): string {
  if (!points.length) return "";
  return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ") + " Z";
}

export function centroid(points: XY[]): XY {
  return {
    x: points.reduce((a, p) => a + p.x, 0) / points.length,
    y: points.reduce((a, p) => a + p.y, 0) / points.length
  };
}

export function shoelaceArea(points: XY[]): number {
  let area = 0;
  const n = points.length;
  if (n < 3) return 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

// Ray-casting algorithm to check if a point is strictly inside a polygon
export function isPointInPolygon(point: XY, polygon: XY[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Convert a line path with a given width in meters to a closed polygon in SVG pixels
export function roadToPolygon(path: XY[], widthM: number, scale: number): XY[] {
  if (path.length < 2) return [];
  const halfW = (widthM * scale) / 2;
  const leftSide: XY[] = [];
  const rightSide: XY[] = [];

  for (let i = 0; i < path.length; i++) {
    const curr = path[i];
    let dx = 0;
    let dy = 0;

    if (i < path.length - 1) {
      const next = path[i + 1];
      dx += next.x - curr.x;
      dy += next.y - curr.y;
    }
    if (i > 0) {
      const prev = path[i - 1];
      dx += curr.x - prev.x;
      dy += curr.y - prev.y;
    }

    const len = Math.hypot(dx, dy);
    if (len === 0) continue;

    // Normal vector
    const nx = -dy / len;
    const ny = dx / len;

    leftSide.push({ x: curr.x + nx * halfW, y: curr.y + ny * halfW });
    rightSide.unshift({ x: curr.x - nx * halfW, y: curr.y - ny * halfW });
  }

  return [...leftSide, ...rightSide];
}

/**
 * Computes layout anchor points for dome, text label, decoration, and ATV
 * along the lot's true long axis. Works correctly for rotated parallelograms.
 *
 * Strategy:
 *  1. Dome sits at the true geometric centroid (always the visual center).
 *  2. We find the lot's long axis by comparing the two pairs of opposite
 *     edge midpoints (edges 0-1 vs 2-3, and edges 1-2 vs 3-0).
 *  3. We place decoration and text at small offsets along that axis
 *     from the centroid, guaranteeing they stay inside the lot.
 */
export function getLotLayoutPoints(polygon: XY[]) {
  const c = centroid(polygon);

  if (!polygon || polygon.length < 3) {
    return { dome: c, text: c, decor: c, atv: c };
  }

  if (polygon.length < 4) {
    return {
      dome: c,
      text: { x: c.x, y: c.y + 4 },
      decor: { x: c.x, y: c.y - 4 },
      atv: { x: c.x, y: c.y + 6 }
    };
  }

  // For an ordered quadrilateral: edges 0→1 opposite 2→3, edges 1→2 opposite 3→0
  const mid01 = { x: (polygon[0].x + polygon[1].x) / 2, y: (polygon[0].y + polygon[1].y) / 2 };
  const mid23 = { x: (polygon[2].x + polygon[3].x) / 2, y: (polygon[2].y + polygon[3].y) / 2 };
  const mid12 = { x: (polygon[1].x + polygon[2].x) / 2, y: (polygon[1].y + polygon[2].y) / 2 };
  const mid30 = { x: (polygon[3].x + polygon[0].x) / 2, y: (polygon[3].y + polygon[0].y) / 2 };

  const d1 = Math.hypot(mid23.x - mid01.x, mid23.y - mid01.y);
  const d2 = Math.hypot(mid30.x - mid12.x, mid30.y - mid12.y);

  // Pick the longer axis as the lot's "depth" direction
  const longAxis = d1 >= d2
    ? { dx: mid23.x - mid01.x, dy: mid23.y - mid01.y, len: d1 }
    : { dx: mid30.x - mid12.x, dy: mid30.y - mid12.y, len: d2 };

  // Unit vector along the long axis
  const ux = longAxis.dx / longAxis.len;
  const uy = longAxis.dy / longAxis.len;

  // Offsets proportional to the lot's actual depth (capped for safety)
  const halfLen = Math.min(longAxis.len / 2, 12);

  return {
    dome: c,                                                       // true center
    text:  { x: c.x + ux * halfLen * 0.55, y: c.y + uy * halfLen * 0.55 },  // lower third
    decor: { x: c.x - ux * halfLen * 0.55, y: c.y - uy * halfLen * 0.55 },  // upper third
    atv:   { x: c.x + ux * halfLen * 0.75, y: c.y + uy * halfLen * 0.75 }   // near front edge
  };
}

