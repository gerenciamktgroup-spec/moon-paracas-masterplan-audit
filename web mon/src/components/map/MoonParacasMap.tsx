import React, { useMemo, useState } from "react";
import { Lot, MasterplanScene, SalesFilters } from "../../types/map";
import { buildCourtyardMasterplan } from "../../lib/courtyardMasterplanModel";
import { filterLots } from "../../lib/salesModel";
import { FiltersBar } from "./FiltersBar";
import { MapCanvas } from "./MapCanvas";
import { BadgeCheck, CarFront, House, Map, Ruler } from "lucide-react";
import { PROJECT } from "../../config/project";
import { COMMERCIAL_PRICE_PERIOD_LABEL } from "../../config/pricing";
import { DomeConceptPanel } from "./DomeConceptPanel";

export default function MoonParacasMap({
  lots,
  selectedLot,
  onSelectLot
}: {
  lots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot) => void;
}) {
  const [viewMode, setViewMode] = useState<"interactive" | "render3d">("interactive");
  const [filters, setFilters] = useState<SalesFilters>({
    search: "",
    blockId: "all",
    status: "all",
    typology: "all"
  });

  const scene = useMemo<MasterplanScene>(() => {
    const layout = buildCourtyardMasterplan();

    return {
      terrain: layout.terrainScene.terrain,
      innerBuffer: layout.terrainScene.innerBuffer,
      roads: layout.roads,
      amenities: layout.amenities,
      blocks: layout.blocks,
      lots
    };
  }, [lots]);

  const visibleLots = useMemo(
    () => filterLots(scene.lots, filters),
    [scene.lots, filters]
  );
  const inventorySummary = useMemo(() => {
    const parkingCount = scene.lots.filter((lot) => lot.typology === "parking").length;
    const commonParkingCount = scene.lots.filter((lot) => lot.typology === "parking-external").length;
    const residentialLots = scene.lots.filter((lot) => !lot.typology.startsWith("parking"));
    const dome8Count = residentialLots.filter((lot) => lot.fitsDome8m).length;
    return { parkingCount, commonParkingCount, residentialCount: residentialLots.length, dome8Count };
  }, [scene.lots]);

  return (
    <section className="moon-paracas-map relative flex h-auto w-full flex-col overflow-hidden rounded-md border border-white/12 bg-[#101a1b] shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:h-[790px]">
      <div className="z-20 flex flex-col gap-4 border-b border-white/10 bg-[#101a1b] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase text-[#df8a6f]">Moon Constellations V4 · Plano de cuatro aldeas</p>
            <p className="mt-1 font-display text-xl font-semibold text-white">Cuatro aldeas alrededor de un Oasis de 5,000 m² · {PROJECT.areaLabel}</p>
            {scene.lots.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Inventario técnico cargado">
                <span className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-semibold text-white/65">
                  <BadgeCheck className="h-3 w-3 text-[#82ba8d]" aria-hidden="true" /> {inventorySummary.residentialCount} lotes
                </span>
                <span className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-semibold text-white/65">
                  <CarFront className="h-3 w-3 text-[#df8a6f]" aria-hidden="true" /> {inventorySummary.parkingCount} privadas + {inventorySummary.commonParkingCount} comunes
                </span>
                <span className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-semibold text-white/65">
                  <Ruler className="h-3 w-3 text-white/55" aria-hidden="true" /> 2.50 × 5.00 m
                </span>
                <span className="inline-flex items-center gap-1.5 rounded border border-[#82ba8d]/20 bg-[#82ba8d]/8 px-2 py-1 text-[9px] font-semibold text-[#b9d9bf]">
                  <BadgeCheck className="h-3 w-3" aria-hidden="true" /> Domo Ø8 compatible · {inventorySummary.dome8Count} lotes
                </span>
                <span className="inline-flex items-center gap-1.5 rounded border border-[#df8a6f]/20 bg-[#df8a6f]/8 px-2 py-1 text-[9px] font-semibold text-[#f0b08c]">
                  Lista vigente · {COMMERCIAL_PRICE_PERIOD_LABEL}
                </span>
              </div>
            )}
          </div>
          <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-bold uppercase text-white/55 lg:hidden">
            <BadgeCheck className="h-3.5 w-3.5 text-[#82ba8d]" /> Plano vigente
          </span>
        </div>

        <div className="grid grid-cols-2 rounded-md bg-white/5 p-1" aria-label="Alternar entre el plano y la inspiración arquitectónica">
          <button
            type="button"
            aria-pressed={viewMode === "interactive"}
            onClick={() => setViewMode("interactive")}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] px-4 text-[10px] font-bold uppercase transition-colors ${
              viewMode === "interactive" ? "bg-[#c85b3e] text-white shadow-sm" : "text-white/55 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Map className="h-4 w-4" aria-hidden="true" /> Plano interactivo
          </button>
          <button
            type="button"
            data-testid="dome-concept-tab"
            aria-pressed={viewMode === "render3d"}
            onClick={() => setViewMode("render3d")}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] px-4 text-[10px] font-bold uppercase transition-colors ${
              viewMode === "render3d" ? "bg-[#c85b3e] text-white shadow-sm" : "text-white/55 hover:bg-white/5 hover:text-white"
            }`}
          >
            <House className="h-4 w-4" aria-hidden="true" /> Habitar el lote
          </button>
        </div>
      </div>

      {viewMode === "interactive" ? (
        <>
          <FiltersBar filters={filters} onChange={setFilters} />
          <div className="moon-paracas-map__layout relative flex min-h-[520px] flex-1 flex-col md:min-h-0 md:flex-row">
            <div className="moon-paracas-map__canvas relative h-[520px] min-h-[520px] w-full shrink-0 flex-1 md:h-full md:min-h-0 md:w-auto md:min-w-0 md:shrink">
              <MapCanvas
                scene={scene}
                visibleLots={visibleLots}
                selectedLot={selectedLot}
                onSelectLot={onSelectLot}
              />
            </div>
          </div>
        </>
      ) : (
        <DomeConceptPanel selectedLot={selectedLot} onBackToMap={() => setViewMode("interactive")} />
      )}
    </section>
  );
}
