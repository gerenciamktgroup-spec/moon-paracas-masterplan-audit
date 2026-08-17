import { XY } from "../types/map";

// Computes the intersection of two lines defined by points (p1, p2) and (p3, p4)
function lineIntersection(p1: XY, p2: XY, p3: XY, p4: XY): XY | null {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(d) < 1e-10) return null; // Parallel

  const t1 = p1.x * p2.y - p1.y * p2.x;
  const t2 = p3.x * p4.y - p3.y * p4.x;

  return {
    x: (t1 * (p3.x - p4.x) - (p1.x - p2.x) * t2) / d,
    y: (t1 * (p3.y - p4.y) - (p1.y - p2.y) * t2) / d
  };
}

export function createInnerBuffer(polygon: XY[], meters: number): XY[] {
  if (polygon.length < 3) return polygon;
  
  // 1. Determine winding order (Shoelace area sign)
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i].x * polygon[j].y - polygon[j].x * polygon[i].y;
  }
  const isClockwise = area < 0;

  // 2. Shift each line segment inward by `meters`
  const shiftedLines: { p1: XY, p2: XY }[] = [];
  
  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    
    // Direction vector
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    dx /= len;
    dy /= len;
    
    // Normal vector pointing "inward"
    // If CW, inward is (dy, -dx). If CCW, inward is (-dy, dx).
    const nx = isClockwise ? dy : -dy;
    const ny = isClockwise ? -dx : dx;
    
    // Shift points
    shiftedLines.push({
      p1: { x: p1.x + nx * meters, y: p1.y + ny * meters },
      p2: { x: p2.x + nx * meters, y: p2.y + ny * meters }
    });
  }

  // 3. Intersect adjacent shifted lines to find new vertices
  const innerPolygon: XY[] = [];
  for (let i = 0; i < shiftedLines.length; i++) {
    const l1 = shiftedLines[(i - 1 + shiftedLines.length) % shiftedLines.length];
    const l2 = shiftedLines[i];
    
    const intersect = lineIntersection(l1.p1, l1.p2, l2.p1, l2.p2);
    if (intersect) {
      innerPolygon.push(intersect);
    } else {
      // Fallback if exactly parallel (should not happen for a closed convex poly)
      innerPolygon.push(l2.p1); 
    }
  }

  return innerPolygon;
}

export function roundPolygonCorners(polygon: XY[], radius: number): XY[] {
  if (polygon.length < 3) return polygon;
  const rounded: XY[] = [];

  for (let i = 0; i < polygon.length; i++) {
    const V = polygon[i];
    const P = polygon[(i - 1 + polygon.length) % polygon.length];
    const S = polygon[(i + 1) % polygon.length];

    // Vector directions
    const du = { x: P.x - V.x, y: P.y - V.y };
    const dw = { x: S.x - V.x, y: S.y - V.y };

    const lenU = Math.hypot(du.x, du.y);
    const lenW = Math.hypot(dw.x, dw.y);

    if (lenU === 0 || lenW === 0) {
      rounded.push(V);
      continue;
    }

    const uHat = { x: du.x / lenU, y: du.y / lenU };
    const wHat = { x: dw.x / lenW, y: dw.y / lenW };

    // Limit radius to half of the shortest adjacent edge to prevent overlapping rounding
    const actualRadius = Math.min(radius, lenU / 2, lenW / 2);

    const A = { x: V.x + uHat.x * actualRadius, y: V.y + uHat.y * actualRadius };
    const B = { x: V.x + wHat.x * actualRadius, y: V.y + wHat.y * actualRadius };

    // Generate Bezier points
    const steps = 6;
    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      const x = (1 - t) * (1 - t) * A.x + 2 * (1 - t) * t * V.x + t * t * B.x;
      const y = (1 - t) * (1 - t) * A.y + 2 * (1 - t) * t * V.y + t * t * B.y;
      rounded.push({ x, y });
    }
  }

  return rounded;
}
