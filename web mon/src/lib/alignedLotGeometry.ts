import { Lot, XY } from "../types/map";

// Clean 2D Vector CAD Masterplan Bounds (900 x 850 viewBox space)
const ALDEA_BOUNDS: Record<string, { TL: XY; TR: XY; BL: XY; BR: XY; rows: number; cols: number }> = {
  // Aldea 1 (Left / Verde) — 78 lotes
  C1: {
    TL: { x: 80, y: 140 },
    TR: { x: 300, y: 260 },
    BL: { x: 80, y: 710 },
    BR: { x: 300, y: 590 },
    rows: 13,
    cols: 6,
  },
  // Aldea 2 (Top / Dorado) — 76 lotes
  C2: {
    TL: { x: 140, y: 60 },
    TR: { x: 760, y: 60 },
    BL: { x: 260, y: 280 },
    BR: { x: 640, y: 280 },
    rows: 6,
    cols: 13,
  },
  // Aldea 3 (Right / Naranja) — 76 lotes
  C3: {
    TL: { x: 600, y: 260 },
    TR: { x: 820, y: 140 },
    BL: { x: 600, y: 590 },
    BR: { x: 820, y: 710 },
    rows: 13,
    cols: 6,
  },
  // Aldea 4 (Bottom / Bronce) — 68 lotes
  C4: {
    TL: { x: 260, y: 570 },
    TR: { x: 640, y: 570 },
    BL: { x: 140, y: 790 },
    BR: { x: 760, y: 790 },
    rows: 6,
    cols: 12,
  },
};

function interpolatePoint(TL: XY, TR: XY, BL: XY, BR: XY, u: number, v: number): XY {
  const topX = TL.x + u * (TR.x - TL.x);
  const topY = TL.y + u * (TR.y - TL.y);
  const botX = BL.x + u * (BR.x - BL.x);
  const botY = BL.y + u * (BR.y - BL.y);
  return {
    x: topX + v * (botX - topX),
    y: topY + v * (botY - topY),
  };
}

/**
 * Calculates clean vector parcel polygons for lots matching the 2D CAD Masterplan layout
 */
export function getAlignedLotPolygon(lot: Lot, lotIndexInBlock: number): XY[] {
  const blockId = lot.blockId || "C1";
  const bounds = ALDEA_BOUNDS[blockId] ?? ALDEA_BOUNDS.C1;

  const totalCols = bounds.cols;
  const totalRows = bounds.rows;

  const colIndex = lotIndexInBlock % totalCols;
  const rowIndex = Math.floor(lotIndexInBlock / totalCols) % totalRows;

  // Margin spacing between parcel cells
  const gapU = 0.06 / totalCols;
  const gapV = 0.06 / totalRows;

  const u1 = colIndex / totalCols + gapU;
  const u2 = (colIndex + 1) / totalCols - gapU;
  const v1 = rowIndex / totalRows + gapV;
  const v2 = (rowIndex + 1) / totalRows - gapV;

  const p1 = interpolatePoint(bounds.TL, bounds.TR, bounds.BL, bounds.BR, u1, v1);
  const p2 = interpolatePoint(bounds.TL, bounds.TR, bounds.BL, bounds.BR, u2, v1);
  const p3 = interpolatePoint(bounds.TL, bounds.TR, bounds.BL, bounds.BR, u2, v2);
  const p4 = interpolatePoint(bounds.TL, bounds.TR, bounds.BL, bounds.BR, u1, v2);

  return [p1, p2, p3, p4];
}
