import React, { useState } from "react";
import { Lot, LotStatus } from "../../../types/map";
import { pathFromPolygon, centroid } from "../../../lib/geometry";
import { LotColorMode, MapDetailLevel } from "../mapVisuals";

// Status configuration matching Condominios Renacer Herradura
export const STATUS_CONFIG: Record<LotStatus, {
  fill: string;
  stroke: string;
  flagColor: string;
  label: string;
  badgeBg: string;
  badgeText: string;
}> = {
  available: {
    fill: "rgba(76, 175, 80, 0.40)",
    stroke: "#4caf50",
    flagColor: "#2e7d32",
    label: "Disponible",
    badgeBg: "#e8f5e9",
    badgeText: "#2e7d32",
  },
  reserved: {
    fill: "rgba(255, 152, 0, 0.45)",
    stroke: "#ff9800",
    flagColor: "#e65100",
    label: "Reservado",
    badgeBg: "#fff3e0",
    badgeText: "#e65100",
  },
  offer: {
    fill: "rgba(255, 87, 34, 0.50)",
    stroke: "#ff5722",
    flagColor: "#d84315",
    label: "En Oferta",
    badgeBg: "#fbe9e7",
    badgeText: "#d84315",
  },
  sold: {
    fill: "rgba(229, 57, 53, 0.50)",
    stroke: "#e53935",
    flagColor: "#b71c1c",
    label: "Vendido",
    badgeBg: "#ffebee",
    badgeText: "#c62828",
  },
  blocked: {
    fill: "rgba(84, 110, 122, 0.55)",
    stroke: "#546e7a",
    flagColor: "#37474f",
    label: "Bloqueado",
    badgeBg: "#eceff1",
    badgeText: "#37474f",
  },
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
  colorMode?: LotColorMode;
  detailLevel?: MapDetailLevel;
  baseMap?: "roadmap" | "satellite";
  filterStatus?: string;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <g id="interactive-lots-layer">
      {lots.map((lot) => {
        // Apply status filter
        if (filterStatus !== "all" && lot.status !== filterStatus) return null;

        const config = STATUS_CONFIG[lot.status] ?? STATUS_CONFIG.available;
        const isSelected = selectedLotId === lot.id;
        const isHovered = hoveredId === lot.id;
        const isParking = lot.typology === "parking" || lot.typology === "parking-external";

        const polygon = lot.polygon;
        if (!polygon || polygon.length < 3) return null;

        const polygonPath = pathFromPolygon(polygon);
        const centerPt = centroid(polygon);

        // Renacer highlight behavior: Selected lots turn clean translucent white with sharp stroke
        const fillColor = isSelected
          ? "rgba(255, 255, 255, 0.75)"
          : isHovered
            ? "rgba(255, 255, 255, 0.55)"
            : config.fill;
        const strokeColor = isSelected
          ? "#2e7d32"
          : isHovered
            ? "#ffffff"
            : config.stroke;
        const strokeWidth = isSelected ? 2.0 : isHovered ? 1.6 : 0.9;

        // Two-digit format like Renacer (e.g., "01", "08", "45")
        const lotNumberFormatted =
          typeof lot.number === "number" && lot.number < 10
            ? `0${lot.number}`
            : `${lot.number}`;

        return (
          <g
            key={lot.id}
            className="cursor-pointer transition-opacity duration-150"
            onClick={() => onSelect(lot)}
            onMouseEnter={() => setHoveredId(lot.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Lot boundary polygon */}
            <path
              d={polygonPath}
              data-lot-id={lot.id}
              role="button"
              tabIndex={0}
              aria-label={`${isParking ? "Cochera" : "Lote"} ${lot.number}, ${config.label}, ${lot.areaM2.toFixed(1)} m²`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              style={{
                transition: "fill 140ms ease, stroke 140ms ease",
                filter: isSelected
                  ? "drop-shadow(0 2px 8px rgba(0,0,0,0.35))"
                  : isHovered
                    ? "drop-shadow(0 1px 4px rgba(0,0,0,0.25))"
                    : "none",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(lot);
                }
              }}
            />

            {/* Geodesic Dome outline footprint inside residential lots */}
            {!isParking && (
              <circle
                cx={centerPt.x}
                cy={centerPt.y}
                r={4.8}
                fill="none"
                stroke={isSelected ? "rgba(46,125,50,0.6)" : "rgba(255,255,255,0.4)"}
                strokeWidth="0.6"
                strokeDasharray="1.5 1"
                pointerEvents="none"
              />
            )}

            {/* Renacer Pin & Number Marker */}
            {!isParking ? (
              <g pointerEvents="none" transform={`translate(${centerPt.x}, ${centerPt.y})`}>
                {/* Lot Number directly above flag */}
                <text
                  x={0}
                  y={-2.2}
                  textAnchor="middle"
                  fontSize="3.8"
                  fontWeight="800"
                  fontFamily="'Montserrat', 'Outfit', sans-serif"
                  fill={isSelected ? "#1b3a1e" : "#1a2421"}
                  style={{
                    paintOrder: "stroke fill",
                    stroke: "#ffffff",
                    strokeWidth: "0.8px",
                    strokeLinejoin: "round",
                  }}
                >
                  {lotNumberFormatted}
                </text>

                {/* Renacer Flag Pin Icon (🚩) */}
                <g transform="translate(-1.8, -0.6) scale(0.28)">
                  {/* Flag Pole */}
                  <line x1="2" y1="2" x2="2" y2="15" stroke="#263238" strokeWidth="1.6" strokeLinecap="round" />
                  {/* Flag Banner */}
                  <path
                    d="M 2 2 L 12 5.5 L 2 9 Z"
                    fill={config.flagColor}
                    stroke="#ffffff"
                    strokeWidth="0.8"
                  />
                  {/* Pole base dot */}
                  <circle cx="2" cy="15" r="1.2" fill="#263238" />
                </g>
              </g>
            ) : (
              <g pointerEvents="none" transform={`translate(${centerPt.x}, ${centerPt.y})`}>
                <text
                  x={0}
                  y={0.8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="2.4"
                  fontWeight="800"
                  fontFamily="'Montserrat', sans-serif"
                  fill="#ffffff"
                  style={{
                    paintOrder: "stroke fill",
                    stroke: "#0c1413",
                    strokeWidth: "0.6px",
                  }}
                >
                  P{lot.number}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
