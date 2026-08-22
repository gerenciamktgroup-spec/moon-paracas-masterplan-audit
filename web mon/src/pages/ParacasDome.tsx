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
  Sun
} from "lucide-react";
import { Lot } from "../types/map";
import { DomeMap } from "../components/map/DomeMap";
import { DomeDetails } from "../components/DomeDetails";
import { DomeThreeActs } from "../components/dome/DomeThreeActs";
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

const routeSectionMap: Record<string, string> = {
  "/paracas-dome/ofertas": "ofertas",
  "/paracas-dome/adicionales": "adicionales",
  "/paracas-dome/simulador": "simulador",
  "/paracas-dome/lotes": "masterplan",
  "/paracas-dome/reservar": "simulador"
};

export const ParacasDome: React.FC<ParacasDomeProps> = ({
  lots,
  selectedLot,
  setSelectedLot,
  handleReserveLot
}) => {
  const location = useLocation();
  const totalLots = PARACAS_DOME_PROJECT.lotCount;
  const availableLots = lots.filter((lot) => lot.status === "available").length;
  const reservedLots = lots.filter((lot) => lot.status === "reserved").length;
  const soldLots = lots.filter((lot) => lot.status === "sold").length;

  useEffect(() => {
    const targetId = routeSectionMap[location.pathname];
    if (targetId) {
      const timer = window.setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [location.pathname]);

  useEffect(() => {
    if (selectedLot && window.innerWidth < 1280) {
      const element = document.getElementById("simulador");
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [selectedLot]);

  return (
    <div className="bg-[#FAF8F5] text-[#1C1612] font-sans selection:bg-[#C5A059] selection:text-black">
      <DomeThreeActs />

      <nav className="sticky top-[72px] z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-y border-[#E8E1D5] px-4 py-3 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex gap-2 justify-start md:justify-center">
          {[
            ["/paracas-dome/ofertas", "Ofertas"],
            ["/paracas-dome/adicionales", "Adicionales"],
            ["/paracas-dome/simulador", "Simulador"],
            ["/paracas-dome/lotes", "Lotes"],
            ["/paracas-dome/reservar", "Reserva"]
          ].map(([href, label]) => (
            <Link
              key={href}
              to={href}
              className="shrink-0 border border-[#E8E1D5] bg-white px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#3D352E] hover:text-[#1C1612] hover:border-[#C5A059]/70"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <section id="ofertas" className="py-20 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto space-y-10">
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
            <article key={offer.id} className="bg-white border border-[#C5A059]/15 p-6">
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
                <div className="bg-[#F4EFE6] border border-[#E8E1D5] p-3">
                  <span className="block text-[8px] uppercase tracking-[0.18em] text-[#786F66] font-black">Area</span>
                  <span className="block text-[#1C1612] font-bold mt-1">{offer.areaM2.toLocaleString("es-PE")} m²</span>
                </div>
                <div className="bg-[#F4EFE6] border border-[#E8E1D5] p-3">
                  <span className="block text-[8px] uppercase tracking-[0.18em] text-[#786F66] font-black">Domo</span>
                  <span className="block text-[#1C1612] font-bold mt-1">{offer.domeAreaM2} m² incluido</span>
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C85B3E] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#A84F36]"
                >
                  WhatsApp {offer.shortName}
                </a>
                <Link
                  to="/paracas-dome/simulador"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#C5A059]/50 bg-[#C5A059] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-[#b08b47]"
                >
                  {offer.id === "founder-50" ? "Reservar Founder 50" : "Cotizar Comfort 50"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="overflow-x-auto border border-[#C5A059]/15 bg-[#F4EFE6]">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-white text-[#C5A059] uppercase tracking-[0.18em] text-[9px]">
              <tr>
                <th className="p-3">Característica</th>
                <th className="p-3">Founder 50</th>
                <th className="p-3">Comfort 50</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#3D352E]">
              {[
                ["Precio", formatPen(70000), formatPen(89000)],
                ["Área asignada", "2,000 m²", "2,000 m²"],
                ["Domo", "50 m² base", "50 m² comfort"],
                ["Acceso Moon Club", "Sí", "Sí"],
                ["Aislamiento térmico", "Upgrade", "Incluido"],
                ["Puerta rígida", "Upgrade", "Incluido"],
                ["Uso recomendado", "Entrada fundadora", "Uso frecuente"],
                ["Mejor para", "Patrimonio / primera etapa", "Familia / confort"]
              ].map(([feature, founder, comfort]) => (
                <tr key={feature}>
                  <td className="p-3 font-bold text-[#1C1612]">{feature}</td>
                  <td className="p-3">{founder}</td>
                  <td className="p-3">{comfort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="adicionales" className="py-20 px-4 sm:px-6 md:px-8 border-y border-[#C5A059]/10 bg-[#F4EFE6]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col lg:flex-row justify-between gap-6 lg:items-end">
            <div className="space-y-3 max-w-2xl">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#C5A059]">Menu de upgrades</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#1C1612] tracking-wide">
                Adicionales públicos
              </h2>
              <p className="text-[#786F66] text-xs font-light">
                La vista publica muestra precio cliente y beneficio. Costos internos y margen quedan solo en el panel admin.
              </p>
            </div>
            <Link to="/paracas-dome/simulador" className="inline-flex items-center gap-2 border border-[#C5A059]/50 px-5 py-3 text-[#C5A059] text-[10px] font-black uppercase tracking-widest hover:border-[#C5A059]">
              Armar cotizacion
              <Calculator className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PARACAS_DOME_UPGRADE_PACKAGES.map((upgradePackage) => (
              <article key={upgradePackage.id} className="bg-white border border-[#C5A059]/15 p-5">
                <PackagePlus className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-display text-lg font-black uppercase text-[#1C1612] mt-3">{upgradePackage.name}</h3>
                <p className="text-[11px] text-[#786F66] mt-2 min-h-[44px]">{upgradePackage.description}</p>
                <p className="text-[#C5A059] font-black mt-4">{formatPen(getPackagePublicPrice(upgradePackage.id))}</p>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {PARACAS_DOME_ADD_ONS.filter((addOn) => addOn.isPublic).map((addOn) => (
              <article key={addOn.id} className="bg-[#F4EFE6] border border-[#E8E1D5] p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xs font-bold text-[#1C1612] leading-snug">{addOn.name}</h3>
                  <span className="text-[10px] font-black text-[#C5A059] shrink-0">{formatPen(getAddOnPublicPrice(addOn))}</span>
                </div>
                <p className="text-[10px] text-[#786F66] leading-relaxed mt-2">{addOn.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="masterplan" className="py-20 px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto space-y-10">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-[#C5A059]/10 pb-6">
          <div className="text-left space-y-2">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#C5A059]">Plano de venta</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#1C1612] tracking-wide">
              Masterplan Paracas Dome
            </h2>
            <p className="text-[#786F66] text-xs sm:text-sm font-light max-w-xl">
              Elige un lote D-1 a D-50 y arma una cotizacion con oferta, upgrades, reserva, inicial y financiamiento.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-center">
            {[
              ["Disponibles", availableLots, "text-[#1C1612]"],
              ["Separados", reservedLots, "text-[#C48F54]"],
              ["Vendidos", soldLots, "text-[#786F66]"],
              ["Total", totalLots, "text-[#C5A059]"]
            ].map(([label, value, color]) => (
              <div key={label as string} className="bg-white px-4 py-2 border border-[#E8E1D5] shadow flex flex-col gap-0.5 min-w-[90px]">
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

      <section className="py-20 px-4 sm:px-6 md:px-8 border-y border-[#C5A059]/10 bg-[#F4EFE6]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-video sm:aspect-square bg-[#E8E1D5] overflow-hidden border border-[#C5A059]/20 shadow-2xl order-last md:order-first">
            <img
              src="/images/paracas_dome_pool.png"
              alt="Amenidades Moon Club de referencia"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-transparent" />
          </div>

          <div className="space-y-6">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#C5A059]">Alianza estrategica</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#1C1612] tracking-wide">
              Paracas Dome usa Moon Club como ventaja comercial
            </h2>
            <p className="text-[#786F66] text-xs sm:text-sm font-light leading-relaxed">
              Para mantener CAPEX liviano, Paracas Dome no replica amenidades pesadas. El comprador accede a beneficios Moon Club bajo reglas de asociación, disponibilidad, mantenimiento y acuerdos internos. Eso permite enfocar el presupuesto de Paracas Dome en caminos simples, hitos, seguridad, señalética y unidades operables.
            </p>
            <div className="inline-flex items-center gap-3 bg-white px-4 py-3 border border-[#C5A059]/20">
              <ShieldCheck className="text-[#C5A059] w-5 h-5" />
              <div className="text-left">
                <p className="text-[#1C1612] text-[11px] font-bold uppercase tracking-wider">Beneficios Moon Club</p>
                <p className="text-[#786F66] text-[9px] mt-0.5">Uso regulado por convenio y reglamento interno.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
          <article className="bg-white border border-[#C5A059]/10 p-6 md:col-span-2">
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

          <article className="bg-white border border-[#C5A059]/10 p-6">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#1C1612] mb-4">Ficha tecnica base</h3>
            {[
              [Layers, "Domo 50 m²", "Estructura geodesica base incluida."],
              [Droplet, "Servicios por upgrade", "Agua, bano seco y solar segun paquete."],
              [Sun, "Baja infraestructura", "No duplica obras pesadas de Moon Condominio."]
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

        <div className="bg-[#F4EFE6] border border-[#C5A059]/15 p-5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A059] mb-3">Disclosure legal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PARACAS_DOME_LEGAL_DISCLOSURES.map((copy) => (
              <p key={copy} className="text-[10px] text-[#786F66] leading-relaxed border border-[#E8E1D5] bg-[#F4EFE6] p-3">
                {copy}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
