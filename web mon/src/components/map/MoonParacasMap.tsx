import React, { useMemo, useState } from "react";
import { Lot, MasterplanScene } from "../../types/map";
import { buildCourtyardMasterplan } from "../../lib/courtyardMasterplanModel";
import { MapCanvas } from "./MapCanvas";
import { House, Map } from "lucide-react";
import { DomeConceptPanel } from "./DomeConceptPanel";

export default function MoonParacasMap({
  lots,
  selectedLot,
  onSelectLot
}: {
  lots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot | null) => void;
}) {
  const [viewMode, setViewMode] = useState<"interactive" | "render3d">("interactive");

  const scene = useMemo<MasterplanScene>(() => {
    const layout = buildCourtyardMasterplan();

    const masterLots = layout.lots.map((lLot) => {
      const pLot = lots.find((p) => p.id === lLot.id);
      return pLot ? { ...lLot, status: pLot.status, availableOffers: pLot.availableOffers } : lLot;
    });

    return {
      terrain: layout.terrainScene.terrain,
      innerBuffer: layout.terrainScene.innerBuffer,
      roads: layout.roads,
      amenities: layout.amenities,
      blocks: layout.blocks,
      lots: masterLots.length > 0 ? masterLots : layout.lots,
    };
  }, [lots]);

  return (
    <section className="moon-paracas-map relative flex h-auto w-full flex-col overflow-hidden rounded-2xl bg-transparent">
      {/* ── TOP SWITCHER: PLANO INTERACTIVO / HABITAR EL LOTE ── */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-bold uppercase tracking-wider text-[#8c9a44]">
            Masterplan Interactivo
          </h2>
        </div>

        <div className="flex rounded-full bg-white/10 p-1 backdrop-blur-md" aria-label="Alternar entre plano y concepto de domo">
          <button
            type="button"
            aria-pressed={viewMode === "interactive"}
            onClick={() => setViewMode("interactive")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              viewMode === "interactive"
                ? "bg-[#8c9a44] text-white shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Map className="h-3.5 w-3.5" aria-hidden="true" /> Plano Oficial
          </button>
          <button
            type="button"
            data-testid="dome-concept-tab"
            aria-pressed={viewMode === "render3d"}
            onClick={() => setViewMode("render3d")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              viewMode === "render3d"
                ? "bg-[#8c9a44] text-white shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            <House className="h-3.5 w-3.5" aria-hidden="true" /> Habitar el Lote
          </button>
        </div>
      </div>

      {viewMode === "interactive" ? (
        <div className="relative w-full">
          <MapCanvas
            scene={scene}
            visibleLots={scene.lots}
            selectedLot={selectedLot}
            onSelectLot={onSelectLot}
          />
        </div>
      ) : (
        <DomeConceptPanel selectedLot={selectedLot} onBackToMap={() => setViewMode("interactive")} />
      )}
    </section>
  );
}
