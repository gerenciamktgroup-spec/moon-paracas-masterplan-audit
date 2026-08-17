import { XY } from "../types/map";

export function getPolyLength(poly: XY[]): number {
  let len = 0;
  for (let i = 0; i < poly.length; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % poly.length];
    len += Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }
  return len;
}

export function getPointOnPoly(poly: XY[], t: number): XY {
  // t is 0.0 to 1.0
  let targetLen = getPolyLength(poly) * ((t % 1.0 + 1.0) % 1.0); // handle wrap around
  
  for (let i = 0; i < poly.length; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % poly.length];
    const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    
    if (targetLen <= segLen + 1e-9) {
      const ratio = segLen === 0 ? 0 : targetLen / segLen;
      return {
        x: p1.x + (p2.x - p1.x) * ratio,
        y: p1.y + (p2.y - p1.y) * ratio
      };
    }
    targetLen -= segLen;
  }
  return poly[0];
}

export function getPointAndNormalOnPoly(poly: XY[], t: number): { pt: XY, normal: XY } {
  const totalLen = getPolyLength(poly);
  let targetLen = totalLen * ((t % 1.0 + 1.0) % 1.0);

  // Winding order check to orient normal inward
  let area = 0;
  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    area += poly[i].x * poly[j].y - poly[j].x * poly[i].y;
  }
  const isClockwise = area < 0;

  for (let i = 0; i < poly.length; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % poly.length];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const segLen = Math.hypot(dx, dy);

    if (targetLen <= segLen + 1e-9) {
      const ratio = segLen === 0 ? 0 : targetLen / segLen;
      const pt = {
        x: p1.x + dx * ratio,
        y: p1.y + dy * ratio
      };

      // Normal vector pointing inward
      let nx = dx / (segLen || 1);
      let ny = dy / (segLen || 1);
      // If CW, inward is (-ny, nx). If CCW, inward is (ny, -nx).
      const normal = isClockwise
        ? { x: -ny, y: nx }
        : { x: ny, y: -nx };

      return { pt, normal };
    }
    targetLen -= segLen;
  }

  return { pt: poly[0], normal: { x: 0, y: 1 } };
}

export function slicePolyRing(innerPoly: XY[], outerPoly: XY[], tStart: number, tEnd: number, steps: number = 20): XY[] {
  const slice: XY[] = [];
  const dt = (tEnd - tStart) / steps;
  
  // Outer curve (front)
  for (let i = 0; i <= steps; i++) {
    slice.push(getPointOnPoly(outerPoly, tStart + i * dt));
  }
  
  // Inner curve (back, reversed)
  for (let i = steps; i >= 0; i--) {
    slice.push(getPointOnPoly(innerPoly, tStart + i * dt));
  }
  
  return slice;
}
