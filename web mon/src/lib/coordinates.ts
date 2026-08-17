import { TerrainVertex, XY } from "../types/map";

export function utmToLocal(vertices: TerrainVertex[]): XY[] {
  const origin = vertices.find(v => v.id === "A")!.utm;
  return vertices.map(v => ({
    x: v.utm.e - origin.e,
    y: -(v.utm.n - origin.n)
  }));
}

export function getBounds(points: XY[]) {
  return {
    minX: Math.min(...points.map(p => p.x)),
    maxX: Math.max(...points.map(p => p.x)),
    minY: Math.min(...points.map(p => p.y)),
    maxY: Math.max(...points.map(p => p.y))
  };
}

export function fitToViewport(points: XY[], width: number, height: number, padding = 40): XY[] {
  const b = getBounds(points);
  const sx = (width - padding * 2) / (b.maxX - b.minX);
  const sy = (height - padding * 2) / (b.maxY - b.minY);
  const scale = Math.min(sx, sy);

  return points.map(p => ({
    x: (p.x - b.minX) * scale + padding,
    y: (p.y - b.minY) * scale + padding
  }));
}
