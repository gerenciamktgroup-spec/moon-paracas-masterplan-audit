import { terrain } from "../data/terrain";
import { BUSINESS_RULES } from "../data/business";
import { utmToLocal, fitToViewport, getBounds } from "./coordinates";
import { createInnerBuffer } from "./polygonOffset";

// Computed once during first buildTerrainScene call and FROZEN
let _scale = 1;
let _frozen = false;

export function getMeterToSvgScale(): number { return _scale; }

// Legacy named export — always reads latest value
export { _scale as METER_TO_SVG_SCALE };

export function buildTerrainScene(viewportW = 730, viewportH = 820) {
  // 1. Convert to local metric space
  const local = utmToLocal(terrain.vertices);
  
  // 2. Compute TRUE mathematical 4m buffer in metric space
  const localInnerBuffer = createInnerBuffer(local, BUSINESS_RULES.perimeterBufferM);
  
  // 3. Compute scale factor for SVG viewport
  const b = getBounds(local);
  const sx = (viewportW - 70 * 2) / (b.maxX - b.minX);
  const sy = (viewportH - 70 * 2) / (b.maxY - b.minY);
  _scale = Math.min(sx, sy);

  // 4. Transform to SVG space for rendering
  const fitted = fitToViewport(local, viewportW, viewportH, 70);
  const innerBuffer = localInnerBuffer.map(p => ({
    x: (p.x - b.minX) * _scale + 70,
    y: (p.y - b.minY) * _scale + 70
  }));

  return { terrain: fitted, innerBuffer };
}

export function getLocalTerrainBounds() {
  const local = utmToLocal(terrain.vertices);
  return { 
    outer: local, 
    inner: createInnerBuffer(local, BUSINESS_RULES.perimeterBufferM) 
  };
}
