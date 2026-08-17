import React, { useState } from "react";
import { Lot } from "../../types/map";
import { buildDomeScene } from "../../lib/domeModel";
import { pathFromPolygon, centroid } from "../../lib/geometry";
import { PARACAS_DOME_PROJECT } from "../../data/paracasDome";

interface DomeMapProps {
  lots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot) => void;
}

export const DomeMap: React.FC<DomeMapProps> = ({ lots, selectedLot, onSelectLot }) => {
  const [hoveredLotId, setHoveredLotId] = useState<string | null>(null);
  
  // Build static roads, amenities and boundaries
  const scene = buildDomeScene();

  // Combine static lot layout with dynamic statuses from database
  const syncedLots = scene.lots.map(staticLot => {
    const dbLot = lots.find(l => l.id === staticLot.id);
    return dbLot ? { ...staticLot, status: dbLot.status } : staticLot;
  });

  // Color config based on status (formal & premium earth tones)
  const statusColors: Record<Lot["status"], { fill: string; stroke: string; label: string }> = {
    available: { fill: "#3E4E3A", stroke: "#556B4E", label: "Disponible" }, // moss green
    offer:     { fill: "#C5A059", stroke: "#E6C17A", label: "En Preventa" }, // warm gold
    sold:      { fill: "#1A1D1A", stroke: "#2F352F", label: "Vendido" },     // graphite dark
    reserved:  { fill: "#C48F54", stroke: "#E0A96D", label: "Separado" },   // premium copper/terracota
    blocked:   { fill: "#1A1D1A", stroke: "#2C312C", label: "Bloqueado" }
  };

  return (
    <div className="w-full flex flex-col bg-[#1A1D1A]/95 border border-[#C5A059]/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-[#C5A059]/10 bg-[#1E221E] gap-2">
        <div className="text-left">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#C5A059]">Plano Peatonal</span>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">Distribución Paracas Dome</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-black/35 px-3 py-1.5 border border-white/5 text-[10px] text-[#A2A9A2] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#556B4E] animate-pulse"></span>
          <span>15 ha · 50 lotes · {PARACAS_DOME_PROJECT.lotAreaM2.toLocaleString("es-PE")} m²</span>
        </div>
      </div>

      {/* Map SVG container */}
      <div className="relative w-full overflow-x-auto p-4 sm:p-6 bg-[#131513] select-none scrollbar-thin">
        <svg viewBox="0 0 800 400" className="w-full min-w-[700px] h-auto rounded-lg">
          <defs>
            {/* Soft grid pattern for CAD blueprint look */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(197, 160, 89, 0.03)" strokeWidth="0.8" />
            </pattern>
            {/* Pool water gradient */}
            <radialGradient id="poza-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2E4F4F" />
              <stop offset="60%" stopColor="#0E3E3E" />
              <stop offset="100%" stopColor="#051F1F" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width="800" height="400" fill="url(#grid)" />

          {/* Outer Terrain Border */}
          <rect x="10" y="10" width="780" height="380" fill="none" stroke="rgba(197, 160, 89, 0.1)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Roads Layer */}
          {scene.roads.map(road => (
            <g key={road.id} className="opacity-90">
              <path
                d={`M ${road.path[0].x} ${road.path[0].y} L ${road.path[1].x} ${road.path[1].y}`}
                fill="none"
                stroke="#1B1E1B"
                strokeWidth={road.widthM * 2.5}
                strokeLinecap="round"
              />
              {/* Dashed center line */}
              <path
                d={`M ${road.path[0].x} ${road.path[0].y} L ${road.path[1].x} ${road.path[1].y}`}
                fill="none"
                stroke="rgba(197, 160, 89, 0.15)"
                strokeWidth="1"
                strokeDasharray="6 8"
              />
            </g>
          ))}

          {/* Amenities & Common Areas Layer */}
          {scene.amenities.map(amenity => {
            const cent = centroid(amenity.polygon);
            let fill = "#1E221E";
            let stroke = "#2E362E";
            let label = "";

            if (amenity.kind === "pool") {
              fill = "url(#poza-grad)";
              stroke = "#C5A059";
              label = "🏕️ Áreas Comunes (3,000 m²)";
            } else if (amenity.kind === "gatehouse") {
              fill = "#242A24";
              stroke = "#384138";
              label = "🛎️ Garita";
            } else if (amenity.kind === "parking") {
              fill = "#1E211E";
              stroke = "#2A302A";
              label = "🚗 Cochera";
            } else if (amenity.kind === "xerophytic-garden") {
              fill = "#1C241A";
              stroke = "#2A3827";
              label = "🌵 Eco-Reserva";
            }

            return (
              <g key={amenity.id} className="transition-all duration-300">
                <polygon
                  points={amenity.polygon.map(p => `${p.x},${p.y}`).join(" ")}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="1.5"
                  className="opacity-80"
                />
                <text
                  x={cent.x}
                  y={cent.y + 4}
                  textAnchor="middle"
                  fill="#C5A059"
                  fontSize="7"
                  fontWeight="bold"
                  fontFamily="Outfit, sans-serif"
                  letterSpacing="0.05em"
                  style={{ pointerEvents: "none" }}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Lots Layer */}
          {syncedLots.map(lot => {
            const isSelected = selectedLot?.id === lot.id;
            const isHovered = hoveredLotId === lot.id;
            const colorCfg = statusColors[lot.status] || statusColors.available;
            const cent = centroid(lot.polygon);

            // Special highlighted color if premium block
            let fill = colorCfg.fill;
            let stroke = colorCfg.stroke;
            if (lot.status === "available" && lot.typology === "premium") {
              fill = "#24321F"; // Deep dark forest green for premium
              stroke = "#4E6646";
            }

            // Interactive state properties
            const opacity = isSelected ? 0.95 : isHovered ? 0.85 : 0.7;
            const strokeColor = isSelected ? "#C5A059" : stroke;
            const strokeWidth = isSelected ? 2.5 : isHovered ? 1.5 : 1;

            return (
              <g key={lot.id} className="cursor-pointer" onClick={() => onSelectLot(lot)}>
                <polygon
                  points={lot.polygon.map(p => `${p.x},${p.y}`).join(" ")}
                  fill={fill}
                  fillOpacity={opacity}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  onMouseEnter={() => setHoveredLotId(lot.id)}
                  onMouseLeave={() => setHoveredLotId(null)}
                  style={{
                    transition: "all 0.15s ease",
                    filter: isSelected ? "drop-shadow(0 0 8px rgba(197, 160, 89, 0.45))" : "none"
                  }}
                />
                
                {/* Lot Number */}
                <text
                  x={cent.x}
                  y={cent.y + 3}
                  textAnchor="middle"
                  fill={isSelected ? "#FFF" : lot.status === "sold" ? "rgba(255,255,255,0.45)" : "#E4EAE4"}
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="Outfit, sans-serif"
                  style={{ pointerEvents: "none" }}
                >
                  {lot.id.replace("D-", "")}
                </text>

                {/* Subtitle labels */}
                {isHovered && (
                  <text
                    x={cent.x}
                    y={cent.y + 15}
                    textAnchor="middle"
                    fill="#C5A059"
                    fontSize="6"
                    fontWeight="extrabold"
                    fontFamily="Inter, sans-serif"
                    letterSpacing="0.05em"
                    style={{ pointerEvents: "none" }}
                  >
                    {PARACAS_DOME_PROJECT.lotAreaM2.toLocaleString("es-PE")}m²
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 px-6 py-4 bg-[#1E221E] border-t border-[#C5A059]/10 text-xs text-[#A2A9A2] font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#24321F] border border-[#4E6646]"></div>
          <span>Disponible Premium (Fila 1 & 5)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#3E4E3A] border border-[#556B4E]"></div>
          <span>Disponible Estándar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#C48F54] border border-[#E0A96D]"></div>
          <span>Separado / Reserva</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#1A1D1A] border border-[#2F352F]"></div>
          <span>Vendido / No Disponible</span>
        </div>
      </div>
    </div>
  );
};
