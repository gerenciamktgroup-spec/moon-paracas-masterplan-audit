import React, { useEffect, useRef } from "react";
import { Lot } from "../types/map";
import { PROJECT } from "../config/project";
import MoonParacasMap from "../components/map/MoonParacasMap";
import { LotDetailsModal } from "../components/LotDetailsModal";
import { LotShortlist } from "../components/LotShortlist";
import { useLotShortlist } from "../hooks/useLotShortlist";
import { trackEvent } from "../lib/analytics";
import {
  COMMERCIAL_PRICE_PERIOD_LABEL,
  LOT_PRICE_PER_M2_USD,
  PRIVATE_PARKING_PRICE_PEN,
  STANDARD_LOT_PRICE_PEN,
  STANDARD_LOT_PRICE_USD,
  formatPenAmount,
  formatUsdAmount,
} from "../config/pricing";

interface SimulatorProps {
  lots: Lot[];
  selectedLot: Lot | null;
  setSelectedLot: (lot: Lot | null) => void;
  handleReserveLot: (lotId: string, clientData?: { 
    name: string; 
    dni: string; 
    email: string; 
    phone: string;
    monthlyAmount: number;
    installmentsCount: number;
    isCash: boolean;
  }) => Promise<void>;
}

export const Simulator: React.FC<SimulatorProps> = ({ lots, selectedLot, setSelectedLot, handleReserveLot }) => {
  const shortlist = useLotShortlist();
  const previousSelectionId = useRef<string | null>(null);
  // Helper metrics for overall dashboard counters
  const residentialLots = lots.filter((lot) => lot.typology !== "parking" && lot.typology !== "parking-external");
  
  const officialResidentialCount = PROJECT.residentialLots;
  const unavailableCount = Math.min(residentialLots.filter((lot) => lot.status !== "available").length, officialResidentialCount);
  const availableCount = officialResidentialCount - unavailableCount;

  // Auto-scroll to simulator details on mobile/tablet viewports (< 1280px)
  useEffect(() => {
    if (!selectedLot) return;
    if (previousSelectionId.current === null) {
      previousSelectionId.current = selectedLot.id;
      return;
    }
    if (previousSelectionId.current === selectedLot.id) return;
    previousSelectionId.current = selectedLot.id;

    if (selectedLot && selectedLot.typology !== "parking" && selectedLot.typology !== "parking-external") {
      trackEvent("view_lot", { lotId: selectedLot.id, typology: selectedLot.typology, status: selectedLot.status });
    }
    if (selectedLot && window.innerWidth < 1280) {
      const element = document.getElementById("financiamiento");
      if (element) {
        // Delay scroll slightly to allow the map pan-to animation to settle first
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedLot]);

  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-[#FAF8F5] text-[#1C1612]">
      <div className="mx-auto max-w-[1440px] px-4 pt-4 pb-2 sm:px-6 lg:px-8">
        {/* ── HEADER COMPACTO CON ESTADÍSTICAS RÁPIDAS ── */}
        <div className="mb-4 flex flex-col justify-between gap-4 rounded-xl border border-[#E8E1D5] bg-white/90 p-4 shadow-[0_12px_30px_rgba(28,22,18,0.05)] backdrop-blur-md lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display italic text-lg text-[#A84F36]">El predio</span>
              <span className="text-[10px] text-[#C5A059]">·</span>
              <span className="text-[10px] text-[#786F66]">Paracas, Ica · {PROJECT.areaLabel}</span>
            </div>
            <h1 className="mt-1 font-display text-xl font-medium text-[#1C1612] sm:text-2xl">
              Elige. <em className="font-normal text-[#A84F36]">El predio responde.</em>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="rounded-lg border border-[#E8E1D5] bg-[#F4EFE6] px-3 py-1.5 text-center">
              <span className="block font-display text-base font-bold text-[#1C1612]">{PROJECT.residentialLots}</span>
              <span className="text-[8px] uppercase tracking-wider text-[#786F66]">Lotes 120m²</span>
            </div>
            <div className="rounded-lg border border-[#4E6646]/30 bg-[#4E6646]/10 px-3 py-1.5 text-center">
              <span className="block font-display text-base font-bold text-[#4E6646]">{availableCount}</span>
              <span className="text-[8px] uppercase tracking-wider text-[#4E6646]">Disponibles</span>
            </div>
            <div className="rounded-lg border border-[#C85B3E]/25 bg-[#C85B3E]/8 px-3 py-1.5 text-center">
              <span className="block font-display text-base font-bold text-[#A84F36]">{formatUsdAmount(LOT_PRICE_PER_M2_USD)}</span>
              <span className="text-[8px] uppercase tracking-wider text-[#786F66]">por m² ({formatUsdAmount(STANDARD_LOT_PRICE_USD)})</span>
            </div>
            <div className="rounded-lg border border-[#E8E1D5] bg-[#F4EFE6] px-3 py-1.5 text-center">
              <span className="block font-display text-base font-bold text-[#1C1612]">{PROJECT.parkingLots}</span>
              <span className="text-[8px] uppercase tracking-wider text-[#786F66]">Cocheras</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] space-y-10 px-4 py-8 sm:px-8 lg:px-12">
        {/* ── SECCIÓN PRINCIPAL: MASTERPLAN INTERACTIVO DE LOTES Y GOOGLE MAPS ── */}
        <section className="mx-auto w-full max-w-[1360px]" aria-labelledby="map-title">
          <div className="w-full overflow-hidden rounded-xl border border-[#E8E1D5] bg-white p-1.5 shadow-[0_24px_60px_rgba(28,22,18,0.08)] sm:p-3">
            <MoonParacasMap lots={lots} selectedLot={selectedLot} onSelectLot={setSelectedLot} />
          </div>
        </section>

        {/* ── MÉTRICAS Y PRECIOS ── */}
        <div className="grid overflow-hidden rounded-md border border-[#E8E1D5] bg-white sm:grid-cols-[1fr_1fr_1.2fr]">
          <div className="border-b border-[#E8E1D5] p-5 sm:border-b-0 sm:border-r">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#786F66]">Lotes de 120 m² desde</p>
            <p className="mt-2 font-display text-2xl font-semibold text-[#A84F36]">Desde {formatUsdAmount(STANDARD_LOT_PRICE_USD)}</p>
            <p className="mt-0.5 text-[10px] text-[#786F66]">{formatUsdAmount(LOT_PRICE_PER_M2_USD)} / m² ({formatPenAmount(STANDARD_LOT_PRICE_PEN)})</p>
          </div>
          <div className="border-b border-[#E8E1D5] p-5 sm:border-b-0 sm:border-r">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#786F66]">Cochera privada</p>
            <p className="mt-2 font-display text-2xl font-semibold text-[#1C1612]">S/ {PRIVATE_PARKING_PRICE_PEN.toLocaleString("es-PE")}</p>
          </div>
          <div className="flex items-center justify-between gap-5 p-5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#786F66]">Lista comercial · {COMMERCIAL_PRICE_PERIOD_LABEL}</p>
              <p className="mt-2 text-xs leading-5 text-[#3D352E]">Valores referenciales a agosto de 2026. Confirmamos disponibilidad antes de separar.</p>
            </div>
            <a href="/documents/Moon_Paracas_Brochure_Comercial_V2.2_2026.pdf" target="_blank" rel="noreferrer" className="shrink-0 rounded-md border border-[#C5A059]/50 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.12em] text-[#A84F36] transition hover:bg-[#C5A059] hover:text-[#1C1612]">Descargar brochure</a>
          </div>
        </div>

        <LotShortlist
          lots={lots}
          favoriteIds={shortlist.favoriteIds}
          maxItems={shortlist.maxItems}
          onSelect={setSelectedLot}
          onRemove={shortlist.toggleFavorite}
          onShare={shortlist.share}
        />

        <section id="financiamiento" className="mx-auto w-full max-w-[1200px] scroll-mt-24" aria-labelledby="finance-title">
          <div className="mb-6 border-b border-[#E8E1D5] pb-5">
            <p className="font-display italic text-lg text-[#A84F36]">Tu inversión</p>
            <h2 id="finance-title" className="mt-2 font-display text-3xl font-medium text-[#1C1612] sm:text-4xl">El total, antes de separar</h2>
          </div>
          <LotDetailsModal
            lot={selectedLot}
            onReserve={handleReserveLot}
            isFavorite={selectedLot ? shortlist.favoriteIds.includes(selectedLot.id) : false}
            onToggleFavorite={shortlist.toggleFavorite}
          />
        </section>
      </div>
    </div>
  );
};
