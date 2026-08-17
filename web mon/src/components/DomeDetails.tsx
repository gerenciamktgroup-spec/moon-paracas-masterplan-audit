import React, { useEffect, useMemo, useState } from "react";
import { Calculator, Check, MessageCircle, PackagePlus, ShieldCheck } from "lucide-react";
import { Lot } from "../types/map";
import {
  PARACAS_DOME_ADD_ONS,
  PARACAS_DOME_FINANCING_RULES,
  PARACAS_DOME_LEGAL_DISCLOSURES,
  PARACAS_DOME_OFFERS,
  PARACAS_DOME_PROJECT,
  PARACAS_DOME_UPGRADE_PACKAGES,
  OfferId,
  formatPen,
  getAddOnPublicPrice,
  getOfferById,
  getPackagePublicPrice
} from "../data/paracasDome";
import { simulateParacasDomeFinancing } from "../lib/paracasDomeSimulator";

interface DomeDetailsProps {
  lot: Lot | null;
  onReserve: (lotId: string, clientData?: {
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

const comfortIncludedAddOns = new Set(["ADD-THERMAL-40", "ADD-DOOR-WOOD"]);

export const DomeDetails: React.FC<DomeDetailsProps> = ({ lot, onReserve }) => {
  const [selectedOfferId, setSelectedOfferId] = useState<OfferId>("founder-50");
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [downpaymentPct, setDownpaymentPct] = useState(PARACAS_DOME_FINANCING_RULES.minDownPaymentPercent);
  const [installments, setInstallments] = useState(PARACAS_DOME_FINANCING_RULES.maxInstallments);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientDni, setClientDni] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const selectedOffer = getOfferById(selectedOfferId);
  const isCash = downpaymentPct === 100;

  const filteredAddOnIds = useMemo(() => {
    if (selectedOfferId !== "comfort-50") return selectedAddOnIds;
    return selectedAddOnIds.filter((addOnId) => !comfortIncludedAddOns.has(addOnId));
  }, [selectedAddOnIds, selectedOfferId]);

  const simulation = simulateParacasDomeFinancing({
    offerId: selectedOfferId,
    addOnIds: filteredAddOnIds,
    downPaymentPercent: downpaymentPct,
    months: installments
  });

  const selectedAddOns = PARACAS_DOME_ADD_ONS.filter((addOn) => filteredAddOnIds.includes(addOn.id));

  useEffect(() => {
    if (lot) {
      setSelectedOfferId("founder-50");
      setSelectedAddOnIds([]);
      setDownpaymentPct(PARACAS_DOME_FINANCING_RULES.minDownPaymentPercent);
      setInstallments(PARACAS_DOME_FINANCING_RULES.maxInstallments);
    }
  }, [lot]);

  useEffect(() => {
    if (selectedOfferId === "comfort-50") {
      setSelectedAddOnIds((current) => current.filter((addOnId) => !comfortIncludedAddOns.has(addOnId)));
    }
  }, [selectedOfferId]);

  if (!lot) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-[#1A1D1A]/80 border border-[#C5A059]/10 min-h-[420px]">
        <div className="w-12 h-12 border border-dashed border-[#C5A059]/40 flex items-center justify-center mb-4">
          <Calculator className="w-5 h-5 text-[#C5A059]" />
        </div>
        <p className="font-display text-sm font-bold uppercase tracking-wider text-[#A2A9A2]">Selecciona un terreno</p>
        <p className="text-stone-400 text-xs mt-2 max-w-xs font-sans">
          Haz clic en cualquier lote de {PARACAS_DOME_PROJECT.lotAreaM2.toLocaleString("es-PE")} m² para cotizar Founder 50, Comfort 50 y upgrades.
        </p>
      </div>
    );
  }

  const isSoldOrReserved = lot.status === "sold" || lot.status === "reserved" || lot.status === "blocked";

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOnIds((current) =>
      current.includes(addOnId) ? current.filter((id) => id !== addOnId) : [...current, addOnId]
    );
  };

  const applyPackage = (packageAddOnIds: string[]) => {
    setSelectedAddOnIds((current) => Array.from(new Set([...current, ...packageAddOnIds])));
  };

  const whatsAppMessage = encodeURIComponent(
    [
      "Hola, quiero reservar/cotizar Paracas Dome.",
      `Oferta: ${selectedOffer.name}`,
      `Lote: ${lot.id}`,
      `Area: ${PARACAS_DOME_PROJECT.lotAreaM2.toLocaleString("es-PE")} m2`,
      `Precio base: ${formatPen(selectedOffer.publicPrice)}`,
      `Adicionales: ${selectedAddOns.length ? selectedAddOns.map((addOn) => addOn.name).join(", ") : "Sin adicionales"}`,
      `Precio total: ${formatPen(simulation.totalPrice)}`,
      `Inicial ${downpaymentPct}%: ${formatPen(simulation.downPayment)}`,
      `Cuota estimada ${installments} meses: ${formatPen(simulation.monthlyPayment)}`
    ].join("\n")
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientDni || !clientEmail || !clientPhone) {
      alert("Por favor, completa todos los campos del formulario.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReserve(lot.id, {
        name: clientName,
        dni: clientDni,
        email: clientEmail,
        phone: clientPhone,
        monthlyAmount: simulation.monthlyPayment,
        installmentsCount: isCash ? 0 : installments,
        isCash,
        offerId: selectedOffer.id,
        offerName: selectedOffer.name,
        totalPrice: simulation.totalPrice,
        addOnsTotal: simulation.addOnsTotal,
        addOnIds: filteredAddOnIds,
        downPaymentPercent: downpaymentPct
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#1A1D1A] border border-[#C5A059]/20 shadow-2xl p-5 sm:p-6 text-left gap-5">
      <div className="border-b border-[#C5A059]/10 pb-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#C5A059]">Cotizador Paracas Dome</span>
            <h3 className="font-display text-2xl font-black text-white uppercase tracking-wider">Lote {lot.id.replace("D-", "")}</h3>
          </div>
          <span className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider border ${
            lot.status === "available"
              ? "bg-[#3E4E3A]/45 text-[#88AA77] border-[#556B4E]/30"
              : lot.status === "reserved"
              ? "bg-[#C48F54]/30 text-[#E0A96D] border-[#C5A059]/30"
              : "bg-[#1A1D1A] text-stone-500 border-stone-800"
          }`}>
            {lot.status === "available" ? "Disponible" : lot.status === "reserved" ? "Separado" : "Vendido"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] sm:text-xs">
          <div className="bg-black/30 p-2 border border-white/5">
            <p className="text-stone-500 font-bold uppercase tracking-wider text-[8px]">Area asignada</p>
            <p className="font-display font-bold text-white mt-0.5">{PARACAS_DOME_PROJECT.lotAreaM2.toLocaleString("es-PE")} m²</p>
          </div>
          <div className="bg-black/30 p-2 border border-white/5">
            <p className="text-stone-500 font-bold uppercase tracking-wider text-[8px]">Dimensiones</p>
            <p className="font-display font-bold text-white mt-0.5">{lot.dimensions ?? "40m x 50m"}</p>
          </div>
          <div className="bg-black/30 p-2 border border-white/5">
            <p className="text-stone-500 font-bold uppercase tracking-wider text-[8px]">Domo incluido</p>
            <p className="font-display font-bold text-[#C5A059] mt-0.5">50 m²</p>
          </div>
        </div>
      </div>

      <section className="space-y-3" aria-label="Seleccion de oferta">
        <h4 className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#C5A059]">Oferta comercial</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PARACAS_DOME_OFFERS.map((offer) => {
            const isSelected = offer.id === selectedOfferId;
            return (
              <button
                key={offer.id}
                type="button"
                onClick={() => setSelectedOfferId(offer.id)}
                className={`text-left border p-3 transition-all ${
                  isSelected
                    ? "bg-[#C5A059] text-black border-[#C5A059]"
                    : "bg-black/30 text-stone-300 border-white/10 hover:border-[#C5A059]/60"
                }`}
              >
                <span className="block text-[8px] font-black uppercase tracking-[0.2em] opacity-70">{offer.stageLabel}</span>
                <span className="block font-display font-black text-base uppercase">{offer.shortName}</span>
                <span className="block text-xs font-bold mt-1">{formatPen(offer.publicPrice)}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-stone-400 leading-relaxed">{selectedOffer.summary}</p>
      </section>

      <section className="space-y-3" aria-label="Paquetes de upgrades">
        <h4 className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#C5A059]">Paquetes rápidos</h4>
        <div className="grid grid-cols-1 gap-2">
          {PARACAS_DOME_UPGRADE_PACKAGES.map((upgradePackage) => (
            <button
              key={upgradePackage.id}
              type="button"
              onClick={() => applyPackage(upgradePackage.addOnIds)}
              className="flex items-center justify-between gap-3 bg-black/25 hover:bg-black/40 border border-white/10 hover:border-[#C5A059]/50 p-3 text-left transition-colors"
            >
              <span className="flex items-start gap-3">
                <PackagePlus className="w-4 h-4 text-[#C5A059] mt-0.5 shrink-0" />
                <span>
                  <span className="block text-xs font-bold text-white">{upgradePackage.name}</span>
                  <span className="block text-[10px] text-stone-500 mt-0.5">{upgradePackage.description}</span>
                </span>
              </span>
              <span className="text-[10px] font-black text-[#C5A059] shrink-0">{formatPen(getPackagePublicPrice(upgradePackage.id))}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3" aria-label="Adicionales">
        <h4 className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#C5A059]">Adicionales</h4>
        <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2">
          {PARACAS_DOME_ADD_ONS.filter((addOn) => addOn.isPublic).map((addOn) => {
            const isIncluded = selectedOfferId === "comfort-50" && comfortIncludedAddOns.has(addOn.id);
            const isSelected = filteredAddOnIds.includes(addOn.id);
            return (
              <label
                key={addOn.id}
                className={`flex items-start gap-3 border p-3 transition-colors ${
                  isIncluded
                    ? "bg-[#24321F]/50 border-[#4E6646]/40"
                    : isSelected
                    ? "bg-[#C5A059]/10 border-[#C5A059]/50"
                    : "bg-black/25 border-white/10 hover:border-[#C5A059]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isIncluded || isSelected}
                  disabled={isIncluded}
                  onChange={() => toggleAddOn(addOn.id)}
                  className="mt-1 accent-[#C5A059]"
                />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{addOn.name}</span>
                    <span className="text-[10px] font-black text-[#C5A059] shrink-0">
                      {isIncluded ? "Incluido" : formatPen(getAddOnPublicPrice(addOn))}
                    </span>
                  </span>
                  <span className="block text-[10px] text-stone-500 leading-relaxed mt-1">{addOn.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="space-y-4" aria-label="Simulador financiero">
        <div className="flex justify-between items-center bg-black/40 p-3 border border-white/5">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Precio total cotizado</span>
          <span className="font-display text-xl font-black text-white">{formatPen(simulation.totalPrice)}</span>
        </div>

        {isSoldOrReserved ? (
          <div className="bg-black/40 p-4 border border-stone-800 text-center text-stone-500 text-xs py-10 font-sans">
            Lote no disponible para reserva. Selecciona otro lote en el plano.
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-stone-400 font-bold uppercase tracking-wider">Inicial ({downpaymentPct}%)</span>
                <span className="text-white font-bold">{formatPen(simulation.downPayment)}</span>
              </div>
              <input
                type="range"
                min={PARACAS_DOME_FINANCING_RULES.minDownPaymentPercent}
                max="100"
                step="5"
                value={downpaymentPct}
                onChange={(e) => setDownpaymentPct(Number(e.target.value))}
                className="w-full accent-[#C5A059] bg-[#1F221F] h-1"
              />
              <div className="flex justify-between text-[9px] text-stone-500 font-semibold">
                <span>Min: 50%</span>
                <span>Contado: 100%</span>
              </div>
            </div>

            {downpaymentPct < 100 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-stone-400 font-bold uppercase tracking-wider">Plazo</span>
                  <span className="text-white font-bold">{installments} meses</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={PARACAS_DOME_FINANCING_RULES.maxInstallments}
                  step="1"
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="w-full accent-[#C5A059] bg-[#1F221F] h-1"
                />
                <div className="flex justify-between text-[9px] text-stone-500 font-semibold">
                  <span>1 mes</span>
                  <span>Max: {PARACAS_DOME_FINANCING_RULES.maxInstallments} meses</span>
                </div>
              </div>
            )}

            <div className="bg-[#1E221E] border border-[#C5A059]/10 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#A2A9A2]">
                <span>Reserva hoy:</span>
                <span className="text-white font-bold">{formatPen(simulation.reservation)}</span>
              </div>
              <div className="flex justify-between items-center text-[#A2A9A2]">
                <span>Saldo inicial a firma:</span>
                <span className="text-white font-semibold">{formatPen(simulation.signingPayment)}</span>
              </div>
              {!isCash && (
                <>
                  <div className="flex justify-between items-center text-[#A2A9A2]">
                    <span>Saldo financiado:</span>
                    <span>{formatPen(simulation.financedAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#A2A9A2]">
                    <span>Escenario de interés:</span>
                    <span className="text-[#88AA77] font-medium">Declarado 0%* · {formatPen(simulation.flatInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#C5A059]/10 text-[#C5A059] font-bold">
                    <span>{installments} cuotas mensuales:</span>
                    <span className="text-lg">{formatPen(simulation.monthlyPayment)}</span>
                  </div>
                </>
              )}
              {isCash && (
                <div className="flex justify-between items-center pt-2 border-t border-[#C5A059]/10 text-[#88AA77] font-bold">
                  <span>Pago de contado</span>
                  <span>Sujeto a lista vigente</span>
                </div>
              )}
            </div>

            <div className="bg-[#101310] border border-[#C5A059]/15 p-3 space-y-2">
              <div className="flex items-center gap-2 text-[#C5A059] text-[10px] font-black uppercase tracking-[0.2em]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Disclosure obligatorio</span>
              </div>
              <p className="text-[10px] text-stone-400 leading-relaxed">{PARACAS_DOME_LEGAL_DISCLOSURES[1]}</p>
            </div>

            <a
              href={`https://wa.me/?text=${whatsAppMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-[#4E6646]/70 bg-[#24321F] hover:bg-[#2f3f29] text-white font-bold uppercase tracking-widest text-[10px] py-3 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#C5A059]" />
              Enviar cotizacion por WhatsApp
            </a>

            <form onSubmit={handleFormSubmit} className="space-y-3 pt-3 border-t border-[#C5A059]/10">
              <h5 className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#C5A059]">Datos para reserva</h5>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-black/40 border border-white/10 px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#C5A059]"
                  required
                />
                <input
                  type="text"
                  placeholder="DNI / Pasaporte"
                  value={clientDni}
                  onChange={(e) => setClientDni(e.target.value)}
                  className="bg-black/40 border border-white/10 px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  placeholder="Correo electronico"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="bg-black/40 border border-white/10 px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#C5A059]"
                  required
                />
                <input
                  type="tel"
                  placeholder="Telefono / WhatsApp"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="bg-black/40 border border-white/10 px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-[#C5A059] hover:bg-[#b08b47] text-black font-display font-black text-xs uppercase py-3 tracking-widest transition-all shadow-[0_4px_15px_rgba(197,160,89,0.3)] disabled:opacity-50 active:translate-y-0.5 cursor-pointer"
              >
                {isSubmitting ? "Procesando reserva..." : "Separar lote con S/ 1,000"}
              </button>
              <p className="text-[8px] text-center text-stone-500 font-medium flex items-center justify-center gap-1">
                <Check className="w-3 h-3" />
                La reserva se descuenta de la cuota inicial y bloquea temporalmente el lote.
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  );
};
