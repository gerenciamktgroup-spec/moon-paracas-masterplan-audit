import React, { useEffect, useRef } from "react";
import { Lot } from "../types/map";
import { PROJECT } from "../config/project";
import MoonParacasMap from "../components/map/MoonParacasMap";
import { LotDetailsModal } from "../components/LotDetailsModal";
import { LotShortlist } from "../components/LotShortlist";
import { InteriorHero } from "../components/InteriorHero";
import { useLotShortlist } from "../hooks/useLotShortlist";
import { trackEvent } from "../lib/analytics";
import { COMMERCIAL_PRICE_PERIOD_LABEL, PRIVATE_PARKING_PRICE_PEN } from "../config/pricing";

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
    <div className="relative min-h-[90vh] overflow-hidden bg-[#111715] text-[#E1D9C1]">
      <InteriorHero
        eyebrow="Masterplan interactivo"
        title={<>Encuentra tu lugar<br /><em className="font-normal text-[#d5aa83]">dentro del paisaje.</em></>}
        description="Recorre cuatro aldeas peatonales alrededor del Oasis de 5,000 m². Elige por cercanía, paisaje o privacidad; cada lote tiene cochera perimetral y cabida comprobada para implantar un domo de Ø4 m u Ø8 m."
        index="Inventario residencial"
        aside={
          <div className="mt-4 grid grid-cols-2 gap-x-7 gap-y-5">
            <div><strong className="font-display text-3xl font-medium text-white">{officialResidentialCount}</strong><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-white/42">Lotes</span></div>
            <div><strong className="font-display text-3xl font-medium text-[#f0b08c]">{availableCount}</strong><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-white/42">Disponibles</span></div>
            <div><strong className="font-display text-3xl font-medium text-white/65">{unavailableCount}</strong><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-white/42">No disponibles</span></div>
            <div><strong className="font-display text-3xl font-medium text-[#d5aa83]">6</strong><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-white/42">Aldeas</span></div>
          </div>
        }
      />

      <div className="mx-auto max-w-[1400px] space-y-16 px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-5 border-y border-white/10 py-5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/42 sm:grid-cols-3">
          <p><span className="mr-3 text-[#bb5638]">01</span>Elige tu ubicación</p>
          <p><span className="mr-3 text-[#bb5638]">02</span>Guarda tus favoritos</p>
          <p><span className="mr-3 text-[#bb5638]">03</span>Calcula tu cuota</p>
        </div>

        <div className="grid overflow-hidden rounded-md border border-white/10 bg-[#162220] sm:grid-cols-[1fr_1fr_1.2fr]">
          <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">Lotes desde</p>
            <p className="mt-2 font-display text-2xl font-semibold text-[#f0b08c]">Desde S/ 37,500</p>
          </div>
          <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">Cochera privada</p>
            <p className="mt-2 font-display text-2xl font-semibold text-white">S/ {PRIVATE_PARKING_PRICE_PEN.toLocaleString("es-PE")}</p>
          </div>
          <div className="flex items-center justify-between gap-5 p-5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">Lista comercial · {COMMERCIAL_PRICE_PERIOD_LABEL}</p>
              <p className="mt-2 text-xs leading-5 text-white/60">Valores referenciales a julio de 2026. Confirmamos disponibilidad antes de separar.</p>
            </div>
            <a href="/documents/Moon_Paracas_Brochure_Comercial_V2.2_2026.pdf" target="_blank" rel="noreferrer" className="shrink-0 rounded-md border border-[#f0b08c]/40 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.12em] text-[#f0b08c] transition hover:bg-[#f0b08c] hover:text-[#18353b]">Descargar brochure</a>
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

        <section className="mx-auto w-full max-w-[1200px]" aria-labelledby="map-title">
          <div className="mb-6 flex flex-col justify-between gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d5aa83]">Paso 01 · Ubicación</p>
              <h2 id="map-title" className="mt-2 font-display text-3xl font-medium text-white sm:text-4xl">Elige dónde quieres estar</h2>
            </div>
            <p className="max-w-sm text-xs leading-6 text-white/48">Toca un lote para conocer su área, precio total, cochera asignada y el espacio disponible para tu domo.</p>
          </div>
          <div className="w-full overflow-hidden rounded-md border border-white/12 bg-[#16201e] p-1.5 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-3">
            <MoonParacasMap lots={lots} selectedLot={selectedLot} onSelectLot={setSelectedLot} />
          </div>
        </section>

        <section id="financiamiento" className="mx-auto w-full max-w-[1200px] scroll-mt-24" aria-labelledby="finance-title">
          <div className="mb-6 border-b border-white/10 pb-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d5aa83]">Paso 02 · Tu inversión</p>
            <h2 id="finance-title" className="mt-2 font-display text-3xl font-medium text-white sm:text-4xl">Comprueba el total antes de separar</h2>
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
