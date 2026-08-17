import React, { useMemo, useState } from "react";
import { ArrowRight, Check, Landmark, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";

type OfferId = "founder" | "comfort";

const offers = {
  founder: {
    id: "founder" as const,
    name: "Founder 50",
    price: 70000,
    initial: 35000,
    monthly18: 1944.44,
    accent: "#bb5638",
    summary: "La entrada esencial a la etapa fundadora con domo geodésico base de 50 m².",
    includes: ["Domo base de 50 m²", "Acceso a beneficios Moon Club", "Elección de upgrades"],
  },
  comfort: {
    id: "comfort" as const,
    name: "Comfort 50",
    price: 89000,
    initial: 44500,
    monthly18: 2472.22,
    accent: "#6f8465",
    summary: "Más confort térmico y mejores cierres para un uso familiar frecuente en Paracas.",
    includes: ["Domo base de 50 m²", "Aislamiento térmico", "Puerta rígida mejorada"],
  },
};

const formatPen = (value: number, decimals = 0) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

export const FinancingSection: React.FC = () => {
  const [selectedOfferId, setSelectedOfferId] = useState<OfferId>("founder");
  const [months, setMonths] = useState(18);
  const selectedOffer = offers[selectedOfferId];

  const simulation = useMemo(() => {
    const downPayment = selectedOffer.price * 0.5;
    const financedAmount = selectedOffer.price - downPayment;
    return {
      downPayment,
      financedAmount,
      monthlyPayment: financedAmount / months,
    };
  }, [months, selectedOffer]);

  return (
    <section id="financiamiento" className="scroll-mt-24 bg-[#f2f0e9] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Financiamiento directo"
            title="Simple, transparente y bajo tu control."
            description="Explora el escenario comercial declarado: 50% de inicial y saldo hasta en 18 meses. La lista de precios y el contrato vigentes deben confirmar plazo, tasas, gastos y condiciones."
          />
          <p className="font-display text-2xl font-semibold text-[#b55034] md:text-3xl">
            Financiamiento directo. Condiciones por verificar.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Paquetes de financiamiento">
            {Object.values(offers).map((offer) => {
              const active = selectedOfferId === offer.id;
              return (
                <button
                  key={offer.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedOfferId(offer.id)}
                  className={`rounded-md border p-6 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#18353b] ${
                    active
                      ? "border-[#18353b] bg-white shadow-[0_18px_50px_rgba(24,53,59,0.12)]"
                      : "border-[#18353b]/15 bg-[#e8e8df] hover:border-[#18353b]/45"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white" style={{ backgroundColor: offer.accent }}>
                      {offer.id === "founder" ? "Fase fundadora" : "Mayor confort"}
                    </span>
                    <span className={`h-4 w-4 rounded-full border-4 ${active ? "border-[#18353b] bg-white" : "border-[#9b9f98]"}`} />
                  </div>
                  <h3 className="mt-7 font-display text-4xl font-semibold text-[#18353b]">{offer.name}</h3>
                  <p className="mt-2 text-3xl font-semibold text-[#b55034]">{formatPen(offer.price)}</p>
                  <p className="mt-5 min-h-[72px] text-sm leading-6 text-[#62685f]">{offer.summary}</p>
                  <ul className="mt-5 space-y-3 border-t border-[#18353b]/10 pt-5 text-xs font-semibold text-[#3f4c47]">
                    {offer.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6f8465]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <div className="rounded-md bg-[#18353b] p-6 text-white sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f0b08c]">Tu simulación</p>
                <h3 className="mt-1 font-display text-3xl font-semibold">{selectedOffer.name}</h3>
              </div>
              <Landmark className="h-7 w-7 text-white/35" aria-hidden="true" />
            </div>

            <div className="mt-7 space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/65">Inicial fija</span>
                <strong className="text-base">50%</strong>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/65">Monto inicial</span>
                <strong className="text-base">{formatPen(simulation.downPayment)}</strong>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/65">Saldo financiado</span>
                <strong className="text-base">{formatPen(simulation.financedAmount)}</strong>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="financing-months" className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                  Plazo
                </label>
                <output htmlFor="financing-months" className="font-display text-2xl font-semibold text-[#f3c5a8]">
                  {months} meses
                </output>
              </div>
              <input
                id="financing-months"
                type="range"
                min="6"
                max="18"
                step="1"
                value={months}
                onChange={(event) => setMonths(Number(event.target.value))}
                className="moon-range mt-4 w-full"
              />
              <div className="mt-2 flex justify-between text-[10px] font-semibold text-white/45">
                <span>6 meses</span>
                <span>18 meses</span>
              </div>
            </div>

            <div className="mt-8 rounded-md bg-[#0d282e] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Cuota mensual estimada</p>
              <p className="mt-2 font-display text-5xl font-semibold text-white">{formatPen(simulation.monthlyPayment, 2)}</p>
              <p className="mt-3 flex items-center gap-2 text-xs text-[#a9c6b0]">
                <ShieldCheck className="h-4 w-4" /> Escenario sin interés declarado; sujeto a contrato
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/paracas-dome"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#bb5638] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[#9e452d]"
              >
                Elegir lote <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#contacto"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md border border-white/25 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-white hover:text-[#18353b]"
              >
                Hablar con un asesor
              </a>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] leading-5 text-[#777d76]">
          Valores del modelo web: Founder 50, inicial {formatPen(offers.founder.initial)} y cuota a 18 meses {formatPen(offers.founder.monthly18, 2)}. Comfort 50, inicial {formatPen(offers.comfort.initial)} y cuota a 18 meses {formatPen(offers.comfort.monthly18, 2)}. Solicita la lista vigente antes de decidir.
        </p>
      </div>
    </section>
  );
};
