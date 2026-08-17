import React, { useState } from "react";
import { Lot, LotStatus } from "../../../types/map";
import { pathFromPolygon, centroid } from "../../../lib/geometry";
import { LotColorMode, MapDetailLevel } from "../mapVisuals";

// Status colour palette — matches Condominios Renacer reference
export const STATUS_STYLES: Record<LotStatus, { fill: string; stroke: string; label: string }> = {
  available: { fill: "rgba(62, 112, 77, 0.70)", stroke: "#60A373", label: "Disponible" },
  offer:     { fill: "rgba(200, 91, 62, 0.78)",  stroke: "#E67D62", label: "En Oferta" },
  reserved:  { fill: "rgba(196, 143, 84, 0.78)", stroke: "#E2AA6E", label: "Reservado" },
  blocked:   { fill: "rgba(43, 54, 52, 0.85)",   stroke: "#455451", label: "Bloqueado" },
  sold:      { fill: "rgba(180, 50, 50, 0.72)",  stroke: "#E57373", label: "Vendido" },
};

export function LotsLayer({
  lots,
  selectedLotId,
  onSelect,
  filterStatus = "all",
}: {
  lots: Lot[];
  selectedLotId?: string;
  onSelect: (lot: Lot) => void;
  colorMode: LotColorMode;
  detailLevel: MapDetailLevel;
  baseMap: "roadmap" | "satellite";
  filterStatus?: string;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      {lots.map((lot) => {
        // Apply status filter
        if (filterStatus !== "all" && lot.status !== filterStatus) return null;

        const style = STATUS_STYLES[lot.status] ?? STATUS_STYLES.available;
        const isSelected = selectedLotId === lot.id;
        const isHovered = hoveredId === lot.id;
        const isParking = lot.typology === "parking" || lot.typology === "parking-external";

        // ── Use the REAL model polygon coordinates (730×820 SVG space) ──
        const polygon = lot.polygon;
        if (!polygon || polygon.length < 3) return null;

        const polygonPath = pathFromPolygon(polygon);
        const centerPt = centroid(polygon);

        const fillColor = isSelected
          ? "rgba(255, 215, 0, 0.80)"
          : isHovered
            ? "rgba(255, 255, 255, 0.55)"
            : style.fill;
        const strokeColor = isSelected ? "#FFD700" : isHovered ? "#FFFFFF" : style.stroke;
        const strokeWidth = isSelected ? 2.0 : isHovered ? 1.5 : 0.8;

        const lotLabel = isParking
          ? `P${lot.number}`
          : `${lot.blockId?.replace("C", "E") ?? ""}${lot.number}`;

        return (
          <g key={lot.id} className="cursor-pointer">
            <path
              d={polygonPath}
              data-lot-id={lot.id}
              role="button"
              tabIndex={0}
              aria-label={`${isParking ? "Cochera" : "Lote"} ${lot.number}, ${style.label}, ${lot.areaM2.toFixed(1)} m²`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              style={{
                transition: "fill 130ms ease, stroke 130ms ease, filter 130ms ease",
                filter: isSelected
                  ? "drop-shadow(0 0 10px rgba(255,215,0,0.9))"
                  : isHovered
                    ? "drop-shadow(0 0 6px rgba(255,255,255,0.65))"
                    : "none",
              }}
              onClick={() => onSelect(lot)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(lot); }
              }}
              onMouseEnter={() => setHoveredId(lot.id)}
              onMouseLeave={() => setHoveredId(null)}
            />

            {/* Lot number badge — only show when not too zoomed out */}
            {!isParking && (
              <text
                x={centerPt.x}
                y={centerPt.y + 2.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="5"
                fontWeight="700"
                fontFamily="Outfit, Montserrat, sans-serif"
                fill={isSelected ? "#000" : "#FFF"}
                pointerEvents="none"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
              >
                {lot.number}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}
