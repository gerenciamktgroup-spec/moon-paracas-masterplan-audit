import React, { useState } from "react";
import { ChevronUp, Layers3 } from "lucide-react";
import { LotColorMode, STATUS_LEGEND, TYPOLOGY_LEGEND, VILLAGE_LEGEND } from "./mapVisuals";

export function Legend({ colorMode }: { colorMode: LotColorMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const items = colorMode === "village" ? VILLAGE_LEGEND : colorMode === "typology" ? TYPOLOGY_LEGEND : STATUS_LEGEND;
  const legendLabel = colorMode === "village" ? "Aldeas" : colorMode === "typology" ? "Tipologías" : "Estados";

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 z-20 overflow-hidden rounded-md border border-[#18353b]/15 bg-[#f7f5ef]/95 font-sans text-[#18353b] shadow-[0_12px_35px_rgba(16,26,27,0.2)] backdrop-blur-md transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-11 w-full items-center justify-between gap-4 px-4 text-[10px] font-bold uppercase transition-colors hover:bg-[#e8e7df]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-[#b55034]" />
          <span>Leyenda · {legendLabel}</span>
        </div>
        <ChevronUp className={`h-4 w-4 transition-transform ${isOpen ? "" : "rotate-180"}`} />
      </button>

      {isOpen && (
        <div className="grid min-w-[245px] gap-3 border-t border-[#18353b]/12 bg-white/80 p-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="block h-3 w-3 rounded-[3px] border" style={{ backgroundColor: item.fill, borderColor: item.stroke }} />
              <span className="text-[10px] font-semibold text-[#3f514f]">{item.label}</span>
            </div>
          ))}
          {colorMode !== "status" && (
            <p className="border-t border-[#18353b]/10 pt-3 text-[9px] leading-4 text-[#6a7470]">
              Reservados y vendidos se muestran en tonos neutros.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
