import React, { useMemo, useState } from "react";
import { ArrowRight, Check, Landmark, MessageCircle, ShieldCheck, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";
import { CONTACT, whatsappHref } from "../../config/project";
import {
  STANDARD_LOT_AREA_M2,
  STANDARD_LOT_PRICE_USD,
  STANDARD_LOT_PRICE_PEN,
  DOUBLE_LOT_AREA_M2,
  DOUBLE_LOT_PRICE_USD,
  DOUBLE_LOT_PRICE_PEN,
  MACRO_LOT_AREA_M2,
  MACRO_LOT_PRICE_USD,
  MACRO_LOT_PRICE_PEN,
  LOT_PRICE_PER_M2_USD,
  MACRO_LOT_PRICE_PER_M2_USD,
} from "../../config/pricing";

type OfferId = "lote120" | "lote240" | "macro2000";

const offers = {
  lote120: {
    id: "lote120" as const,
    name: `Lote ${STANDARD_LOT_AREA_M2} m²`,
    priceUsd: STANDARD_LOT_PRICE_USD,
    pricePen: STANDARD_LOT_PRICE_PEN,
    accent: "#C85B3E",
    rateLabel: `$${LOT_PRICE_PER_M2_USD} USD / m²`,
    summary: "Lote individual dentro del condominio para Casa Domo o cabaña.",
    includes: [
      "120 m² útiles para Domo Ø8m",
      `Precio Lanzamiento: $${STANDARD_LOT_PRICE_USD.toLocaleString()} USD (~S/ ${STANDARD_LOT_PRICE_PEN.toLocaleString()} PEN)`,
      "Acceso directo a Oasis 5,000 m² y Moon Club",
      "Punto de conexión a cisterna centralizada",
    ],
    life: "Tu refugio privado.",
  },
  lote240: {
    id: "lote240" as const,
    name: `Lote Doble ${DOUBLE_LOT_AREA_M2} m²`,
    priceUsd: DOUBLE_LOT_PRICE_USD,
    pricePen: DOUBLE_LOT_PRICE_PEN,
    accent: "#C5A059",
    rateLabel: `$${LOT_PRICE_PER_M2_USD} USD / m²`,
    summary: "Dos lotes contiguos (240 m²) para mayor amplitud, jardín y plunge pool.",
    includes: [
      "240 m² continuos dentro del condominio",
      `Precio Lanzamiento: $${DOUBLE_LOT_PRICE_USD.toLocaleString()} USD (~S/ ${DOUBLE_LOT_PRICE_PEN.toLocaleString()} PEN)`,
      "Espacio para domo principal + deck y terraza extendida",
      "Membresía familiar completa a Moon Club",
    ],
    life: "Amplitud y confort.",
  },
  macro2000: {
    id: "macro2000" as const,
    name: `Terreno ${MACRO_LOT_AREA_M2.toLocaleString()} m²`,
    priceUsd: MACRO_LOT_PRICE_USD,
    pricePen: MACRO_LOT_PRICE_PEN,
    accent: "#4E6646",
    rateLabel: `$${MACRO_LOT_PRICE_PER_M2_USD} USD / m²`,
    summary: "Macrolote rústico fuera del condominio para proyectos campestres o huertos.",
    includes: [
      "2,000 m² de terreno rústico extramuros",
      `Precio Especial: $${MACRO_LOT_PRICE_USD.toLocaleString()} USD (~S/ ${MACRO_LOT_PRICE_PEN.toLocaleString()} PEN)`,
      "Tarifa preferencial de $45 USD / m²",
      "Ideal para huertos o casas de campo aisladas",
    ],
    life: "Libertad campestre.",
  },
};

export const FinancingSection: React.FC = () => {
  const [selectedOfferId, setSelectedOfferId] = useState<OfferId>("lote120");
  const [downRatio, setDownRatio] = useState<number>(0.3); // 30% inicial
  const [months, setMonths] = useState<number>(36);       // 36 meses
  const [currency, setCurrency] = useState<"USD" | "PEN">("USD");

  const selectedOffer = offers[selectedOfferId];
  const totalPrice = currency === "USD" ? selectedOffer.priceUsd : selectedOffer.pricePen;

  const simulation = useMemo(() => {
    const downPayment = Math.round(totalPrice * downRatio);
    const financedAmount = totalPrice - downPayment;
    const monthlyPayment = Math.round(financedAmount / months);
    return {
      downPayment,
      financedAmount,
      monthlyPayment,
    };
  }, [totalPrice, downRatio, months]);

  const waFinMsg = `Hola! Estuve cotizando la opción ${selectedOffer.name} (${currency} ${totalPrice.toLocaleString()}) con ${downRatio * 100}% inicial y ${months} cuotas de ${currency} ${simulation.monthlyPayment.toLocaleString()}. Quisiera coordinar una cita con un asesor.`;

  return (
    <section id="financiamiento" className="scroll-mt-24 bg-[#FAF7F2] py-20 md:py-28 text-[#161311] border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end border-b border-[#E8E1D5] pb-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">
              <Calculator className="h-3.5 w-3.5 text-[#C5A059]" />
              Calculadora de Financiamiento Directo
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#161311]">
              Planes claros y cuotas a tu medida.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#786F66] max-w-2xl">
              Sin bancos ni trámites engorrosos. Financia directamente tu lote con separación de S/ 1,000 y cuotas fijas de hasta 36 meses.
            </p>
          </div>

          {/* Selector de Moneda */}
          <div className="flex items-center gap-2 rounded-full border border-[#E8E1D5] bg-white p-1.5 shadow-sm">
            <button
              onClick={() => setCurrency("USD")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                currency === "USD" ? "bg-[#161311] text-white shadow" : "text-[#786F66] hover:text-[#161311]"
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency("PEN")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                currency === "PEN" ? "bg-[#161311] text-white shadow" : "text-[#786F66] hover:text-[#161311]"
              }`}
            >
              Soles (S/)
            </button>
          </div>
        </div>

        {/* Opciones de Tipologías */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(offers).map((offer) => {
            const active = selectedOfferId === offer.id;
            const price = currency === "USD" ? offer.priceUsd : offer.pricePen;
            return (
              <div
                key={offer.id}
                onClick={() => setSelectedOfferId(offer.id)}
                className={`cursor-pointer rounded-3xl border-2 p-7 transition-all duration-300 flex flex-col justify-between ${
                  active
                    ? "border-[#C85B3E] bg-white shadow-xl scale-[1.02]"
                    : "border-[#E8E1D5] bg-[#FAF7F2] hover:border-[#C5A059]/60"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">{offer.rateLabel}</span>
                    <span className={`h-4 w-4 rounded-full border-4 ${active ? "border-[#C85B3E] bg-white" : "border-[#D9CDB8]"}`} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#161311]">{offer.name}</h3>
                  <p className="text-xs text-[#786F66] mt-1">{offer.summary}</p>
                  
                  <div className="mt-6 pt-4 border-t border-[#E8E1D5]">
                    <span className="text-[10px] uppercase tracking-wider text-[#786F66] font-bold">Precio Total</span>
                    <p className="text-3xl font-bold font-display text-[#161311]">
                      {currency === "USD" ? `$${price.toLocaleString()} USD` : `S/ ${price.toLocaleString()} PEN`}
                    </p>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-[#38312B]">
                    {offer.includes.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#4E6646] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel de Simulación de Cuotas */}
        <div className="mt-12 rounded-3xl border border-[#C5A059]/40 bg-white p-8 sm:p-12 shadow-lg">
          <h3 className="font-display text-2xl font-bold text-[#161311] mb-8">
            Simula tu Plan para {selectedOffer.name}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Sliders de Simulación */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase mb-2 text-[#786F66]">
                  <span>Cuota Inicial ({downRatio * 100}%)</span>
                  <span className="text-[#161311] text-base">{currency === "USD" ? `$${simulation.downPayment.toLocaleString()}` : `S/ ${simulation.downPayment.toLocaleString()}`}</span>
                </div>
                <div className="flex gap-2">
                  {[0.2, 0.3, 0.4, 0.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setDownRatio(r)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        downRatio === r ? "bg-[#161311] text-white border-[#161311]" : "bg-[#FAF7F2] border-[#E8E1D5] text-[#786F66] hover:bg-white"
                      }`}
                    >
                      {r * 100}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold uppercase mb-2 text-[#786F66]">
                  <span>Plazo de Financiamiento</span>
                  <span className="text-[#A84F36] text-base">{months} Meses</span>
                </div>
                <div className="flex gap-2">
                  {[12, 18, 24, 36].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMonths(m)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        months === m ? "bg-[#C85B3E] text-white border-[#C85B3E]" : "bg-[#FAF7F2] border-[#E8E1D5] text-[#786F66] hover:bg-white"
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resultado de Cuota Mensual */}
            <div className="lg:col-span-6 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">Cuota Mensual Estimada</span>
                <p className="font-display text-4xl sm:text-5xl font-bold text-[#C85B3E] mt-2">
                  {currency === "USD" ? `$${simulation.monthlyPayment.toLocaleString()}` : `S/ ${simulation.monthlyPayment.toLocaleString()}`}
                  <span className="text-xs font-sans text-[#786F66]"> / mes</span>
                </p>
                <p className="text-xs text-[#786F66] mt-2">
                  Saldo a financiar: {currency === "USD" ? `$${simulation.financedAmount.toLocaleString()} USD` : `S/ ${simulation.financedAmount.toLocaleString()} PEN`} en {months} cuotas fijas.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E8E1D5] flex flex-col sm:flex-row gap-3 items-center">
                <a
                  href={whatsappHref(waFinMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C85B3E] py-4 text-xs font-bold text-white shadow-md hover:bg-[#A84F36] transition"
                >
                  <MessageCircle className="h-4 w-4 fill-current" />
                  <span>Congelar Precio por WhatsApp (Separa con S/ 1,000)</span>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
