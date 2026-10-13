import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Droplet,
  Layers,
  PackagePlus,
  ShieldCheck,
  Sun,
  Sparkles,
  Box,
} from "lucide-react";
import { Lot } from "../types/map";
import { DomeMap } from "../components/map/DomeMap";
import { DomeDetails } from "../components/DomeDetails";
import { DomeThreeActs } from "../components/dome/DomeThreeActs";
import { DomeConfigurator } from "../components/dome/DomeConfigurator";
import { CONTACT, whatsappHref } from "../config/project";
import { waOfferMessage } from "../config/whatsappCopy";
import {
  PARACAS_DOME_ADD_ONS,
  PARACAS_DOME_DELIVERY_MILESTONES,
  PARACAS_DOME_LEGAL_DISCLOSURES,
  PARACAS_DOME_OFFERS,
  PARACAS_DOME_PROJECT,
  PARACAS_DOME_UPGRADE_PACKAGES,
  formatPen,
  getAddOnPublicPrice,
  getPackagePublicPrice
} from "../data/paracasDome";

interface ParacasDomeProps {
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
    offerId?: string;
    offerName?: string;
    totalPrice?: number;
    addOnsTotal?: number;
    addOnIds?: string[];
    downPaymentPercent?: number;
  }) => Promise<void>;
}

export const ParacasDome: React.FC<ParacasDomeProps> = ({
  lots,
  selectedLot,
  setSelectedLot,
  handleReserveLot
}) => {
  const totalLots = PARACAS_DOME_PROJECT.lotCount;
  const availableLots = lots.filter((lot) => lot.status === "available").length;
  const reservedLots = lots.filter((lot) => lot.status === "reserved").length;
  const soldLots = lots.filter((lot) => lot.status === "sold").length;

  return (
    <div className="bg-[#FAF8F5] text-[#1C1612] font-sans selection:bg-[#C5A059] selection:text-black">
      
      {/* 1. SECCIÓN 3D INTERACTIVA HEADLINER */}
      <section className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6 md:px-8 max-w-[1360px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">
            <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
            Visor Arquitectónico 3D en Tiempo Real
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#161311]">
            Tu Domo Geodésico en 360°.
          </h1>
          <p className="text-[#786F66] text-sm sm:text-base leading-relaxed">
            Explora la distribución exacta de 50.26 m²: cama King, baño privado en microcemento, kitchenette integrada, deck de teca y plunge pool.
          </p>
        </div>

        <DomeConfigurator />
      </section>

      {/* 2. LOS TRES ACTOS */}
      <DomeThreeActs />

      {/* 3. OFERTAS Y PACKS */}
      <section id="ofertas" className="py-20 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto space-y-10 border-t border-[#E8E1D5]">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#C5A059]">Detalle de packs</span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1612] tracking-tight">
            Founder 50 y Comfort 50
          </h2>
          <p className="text-[#786F66] text-xs font-light">
            Dos paquetes cerrados. Mismos metros. Distinto umbral de confort.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {PARACAS_DOME_OFFERS.map((offer) => (
            <article key={offer.id} className="bg-white border border-[#C5A059]/15 p-6 rounded-2xl shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-[#C5A059]/10 pb-4">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[#C5A059]">{offer.stageLabel}</span>
                  <h3 className="font-display text-2xl font-black uppercase text-[#1C1612] mt-1">{offer.shortName}</h3>
                  <p className="text-xs text-[#786F66] mt-2">{offer.recommendedFor}</p>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] uppercase tracking-[0.18em] text-[#786F66] font-black">Precio</span>
                  <span className="block font-display text-2xl font-black text-[#C5A059]">{formatPen(offer.publicPrice)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 py-4 text-xs">
                <div className="bg-[#F4EFE6] border border-[#E8E1D5] p-3 rounded-xl">
                  <span className="block text-[8px] uppercase tracking-[0.18em] text-[#786F66] font-black">Area Lote</span>
                  <span className="block text-[#1C1612] font-bold mt-1">120 m²</span>
                </div>
                <div className="bg-[#F4EFE6] border border-[#E8E1D5] p-3 rounded-xl">
                  <span className="block text-[8px] uppercase tracking-[0.18em] text-[#786F66] font-black">Domo Útil</span>
                  <span className="block text-[#1C1612] font-bold mt-1">50.26 m² incluido</span>
                </div>
              </div>
              <div className="space-y-2">
                {offer.includes.slice(0, 7).map((item) => (
                  <div key={item} className="flex items-start gap-2 text-[11px] text-[#3D352E]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <a
                  href={whatsappHref(waOfferMessage(offer.id))}
                  target={CONTACT.whatsapp ? "_blank" : undefined}
                  rel={CONTACT.whatsapp ? "noreferrer" : undefined}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C85B3E] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#A84F36]"
                >
                  WhatsApp {offer.shortName}
                </a>
                <Link
                  to="/simulador"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#C5A059]/50 bg-[#C5A059] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-[#b08b47]"
                >
                  {offer.id === "founder-50" ? "Reservar Founder 50" : "Cotizar Comfort 50"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. MASTERPLAN INTERACTIVO DE LOTES */}
      <section id="masterplan" className="py-20 px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto space-y-10 border-t border-[#E8E1D5]">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-[#C5A059]/10 pb-6">
          <div className="text-left space-y-2">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#C5A059]">Plano de venta</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#1C1612] tracking-wide">
              Masterplan Paracas Dome
            </h2>
            <p className="text-[#786F66] text-xs sm:text-sm font-light max-w-xl">
              Elige tu lote en el plano interactivo y cotiza con financiamiento directo sin bancos.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-center">
            {[
              ["Disponibles", availableLots, "text-[#1C1612]"],
              ["Separados", reservedLots, "text-[#C48F54]"],
              ["Vendidos", soldLots, "text-[#786F66]"],
              ["Total", totalLots, "text-[#C5A059]"]
            ].map(([label, value, color]) => (
              <div key={label as string} className="bg-white px-4 py-2 border border-[#E8E1D5] rounded-xl shadow-sm flex flex-col gap-0.5 min-w-[90px]">
                <span className="text-[8px] font-bold text-[#786F66] uppercase tracking-widest">{label as string}</span>
                <span className={`font-display font-black text-lg ${color as string}`}>{value as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div id="simulador" className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start scroll-mt-36">
          <div className="xl:col-span-8 w-full">
            <DomeMap lots={lots} selectedLot={selectedLot} onSelectLot={setSelectedLot} />
          </div>
          <div className="xl:col-span-4 w-full xl:sticky xl:top-28">
            <DomeDetails lot={selectedLot} onReserve={handleReserveLot} />
          </div>
        </div>
      </section>

      {/* 5. TRANSPARENCIA & REGLAS */}
      <section className="py-20 px-4 sm:px-6 md:px-8 border-t border-[#C5A059]/10 bg-[#F4EFE6]/40 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#C5A059]">Entrega y reglas</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#1C1612] tracking-wide">
            Transparencia antes de reservar
          </h2>
          <p className="text-[#786F66] text-xs font-light">
            El domo se activa por hitos de pago y el proyecto se ejecuta de forma progresiva.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-white border border-[#C5A059]/10 p-6 rounded-2xl md:col-span-2 shadow-sm">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#1C1612] mb-4">Hitos de entrega</h3>
            <div className="space-y-3">
              {PARACAS_DOME_DELIVERY_MILESTONES.map((milestone) => (
                <div key={milestone.label} className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-2 border-b border-[#E8E1D5] pb-3 text-xs">
                  <span className="font-black text-[#C5A059]">{milestone.label}</span>
                  <span className="text-[#786F66]">{milestone.action}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-[#C5A059]/10 p-6 rounded-2xl shadow-sm">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#1C1612] mb-4">Ficha tecnica base</h3>
            {[
              [Layers, "Domo 50.26 m²", "Estructura geodesica 3V Ø8m en madera tratada."],
              [Droplet, "Saneamiento ecologico", "Biodigestor estanco y conexion a cisterna."],
              [Sun, "Eficiencia termica", "Membrana tricapa con filtro solar UV50+."]
            ].map(([Icon, title, text]) => (
              <div key={title as string} className="flex gap-3 mb-4">
                <Icon className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#1C1612]">{title as string}</p>
                  <p className="text-[10px] text-[#786F66]">{text as string}</p>
                </div>
              </div>
            ))}
          </article>
        </div>
      </section>
    </div>
  );
};
