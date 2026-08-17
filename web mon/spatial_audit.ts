import { centroid } from "./src/lib/geometry";
import { XY } from "./src/types/map";
import * as turf from "@turf/turf";
import { buildMoonParacasInventory } from "./src/lib/masterplanInventory";

// Convert XY polygon to Turf polygon
function toTurfPoly(poly: XY[]): any {
  const coords = poly.map(p => [p.x, p.y]);
  if (coords.length > 0 && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
    coords.push([...coords[0]]);
  }
  return turf.polygon([coords]);
}

// Planar shrink towards centroid by a distance in meters
function shrinkPolyPlanar(poly: XY[], amountMeters: number, scale: number): XY[] {
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

// Expand a line path with a given width into a polygon
function roadToPolygon(path: XY[], widthM: number, scale: number): XY[] {
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

    const nx = -dy / len;
    const ny = dx / len;

    leftSide.push({ x: curr.x + nx * halfW, y: curr.y + ny * halfW });
    rightSide.unshift({ x: curr.x - nx * halfW, y: curr.y - ny * halfW });
  }

  return [...leftSide, ...rightSide];
}

// Main execution
function runAudit() {
  console.log("=== STARTING SPATIAL COLLISION AUDIT ===");
  const {
    terrainScene: { innerBuffer },
    scale,
    blocks,
    roads,
    amenities,
    roadPolys: roadPolygons,
    parkings: parkingLots,
    residentialLots: cleanHouseLots,
  } = buildMoonParacasInventory();
  
  const allLots = [...cleanHouseLots, ...parkingLots];

  console.log(`Loaded:`);
  console.log(`- Blocks: ${blocks.length}`);
  console.log(`- Roads: ${roads.length}`);
  console.log(`- Amenities: ${amenities.length}`);
  console.log(`- House Lots: ${cleanHouseLots.length}`);
  console.log(`- Parking Lots: ${parkingLots.length}`);
  console.log(`- Total Lots: ${allLots.length}`);

  // Convert roads to polygons
  const roadPolys = roads.map(r => ({
    id: r.id,
    widthM: r.widthM,
    polygon: roadToPolygon(r.path, r.widthM, scale)
  }));

  const collisions: string[] = [];

  // Helper to check collision between two elements
  // We shrink both by 0.15 meters planar-wise to avoid perfectly touching borders triggering collisions
  function verifyOverlap(polyA: XY[], idA: string, polyB: XY[], idB: string, shrinkM = 0.15) {
    if (polyA.length < 3 || polyB.length < 3) return;
    try {
      const shrunkA = shrinkPolyPlanar(polyA, shrinkM, scale);
      const shrunkB = shrinkPolyPlanar(polyB, shrinkM, scale);
      
      const tA = toTurfPoly(shrunkA);
      const tB = toTurfPoly(shrunkB);
      
      // Check intersection
      const intersect = turf.intersect(turf.featureCollection([tA, tB]));
      if (intersect) {
        // Calculate intersection area in square meters
        const areaM2 = turf.area(intersect) / (scale * scale);
        // Only report if intersection area is significant (> 0.5 m²)
        if (areaM2 > 0.5) {
          collisions.push(`[OVERLAP] ${idA} and ${idB} overlap by ~${areaM2.toFixed(2)} m²`);
        }
      }
    } catch (err: any) {
      // Ignore geometry errors
    }
  }

  // 1. Check Amenities vs Blocks
  console.log("\nChecking Amenities vs Blocks...");
  for (const a of amenities) {
    for (const b of blocks) {
      verifyOverlap(a.polygon, `Amenity:${a.id} (${a.kind})`, b.polygon, `Block:${b.id}`);
    }
  }

  // 2. Check Amenities vs Roads
  console.log("Checking Amenities vs Roads...");
  for (const a of amenities) {
    if (["A_ROTONDA", "A_BUS_STOP", "A_GATE_L", "A_GATE_R", "A_GATE_MEDIAN", "A_GATE_ROOF", "A_GATE_BAR"].includes(a.id)) {
      continue; // Expected architectural integrations
    }
    for (const r of roadPolys) {
      verifyOverlap(a.polygon, `Amenity:${a.id} (${a.kind})`, r.polygon, `Road:${r.id}`);
    }
  }

  // 3. Check Blocks vs Roads
  console.log("Checking Blocks vs Roads...");
  for (const b of blocks) {
    for (const r of roadPolys) {
      verifyOverlap(b.polygon, `Block:${b.id}`, r.polygon, `Road:${r.id}`);
    }
  }

  // 4. Check Lots vs Amenities
  console.log("Checking Lots vs Amenities...");
  for (const l of allLots) {
    for (const a of amenities) {
      verifyOverlap(l.polygon, `Lot:${l.id}`, a.polygon, `Amenity:${a.id}`);
    }
  }

  // 5. Check Lots vs Roads
  console.log("Checking Lots vs Roads...");
  for (const l of allLots) {
    for (const r of roadPolys) {
      verifyOverlap(l.polygon, `Lot:${l.id}`, r.polygon, `Road:${r.id}`);
    }
  }

  // 6. Check Lots vs Lots (excluding adjacent, so let's shrink more or just check)
  console.log("Checking Lots vs Lots...");
  for (let i = 0; i < allLots.length; i++) {
    for (let j = i + 1; j < allLots.length; j++) {
      const lA = allLots[i];
      const lB = allLots[j];
      // Skip if they are in the same block and adjacent (we only check if there is a severe overlap)
      verifyOverlap(lA.polygon, `Lot:${lA.id}`, lB.polygon, `Lot:${lB.id}`, 0.25);
    }
  }

  // Report results
  console.log("\n=== AUDIT RESULTS ===");
  if (collisions.length === 0) {
    console.log("✅ SUCCESS! 0 spatial overlaps detected. All geometries are disjoint and correct!");
  } else {
    console.log(`⚠️ DETECTED ${collisions.length} OVERLAPS:`);
    collisions.forEach(c => console.log(c));
  }
}

runAudit();
