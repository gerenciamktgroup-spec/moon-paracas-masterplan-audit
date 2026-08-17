import React, { useState } from "react";
import { ArrowUpRight, Car, MapPinned, Waves } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";
import { PROJECT } from "../../config/project";
import { COMMERCIAL_PRICE_PERIOD_LABEL } from "../../config/pricing";
import { trackEvent } from "../../lib/analytics";

type LotType = {
  id: string;
  name: string;
  count: number;
  color: string;
  description: string;
  image: string;
  note: string;
  rateLabel: string;
  ticketLabel: string;
};

export const lotTypes: LotType[] = [
  {
    id: "tiny",
    name: "Patio Lunar",
    count: 228,
    color: "#EEE4CD",
    description: "120 m² rectangulares y proporcionados para arquitectura compacta, patio privado y mantenimiento eficiente.",
    image: "/media/container_2.jpeg",
    note: "120 m² · Producto principal",
    rateLabel: "S/ 250 por m²",
    ticketLabel: "Desde S/ 30,000",
  },
  {
    id: "premium",
    name: "Oasis / Lote amplio",
    count: 54,
    color: "#DC816E",
    description: "240 m² en las filas exteriores más amplias, con mayor jardín privado y relación directa con el paisaje.",
    image: "/media/plunge_pool_breakfast.png",
    note: "240 m² · Mayor amplitud",
    rateLabel: "S/ 320 por m²",
    ticketLabel: "Desde S/ 76,800",
  },
];

const officialMetrics = [
  ["112.391,80 m²", "Área del lindero UTM"],
  [String(PROJECT.residentialLots), "Lotes residenciales"],
  ["4 m", "Paseos peatonales"],
  [`${PROJECT.residentialLots}/${PROJECT.residentialLots}`, "Cabida domo Ø8"],
];

export const MasterplanSection: React.FC = () => {
  const [activeType, setActiveType] = useState(lotTypes[0]);

  return (
    <section id="masterplan" className="scroll-mt-24 bg-[#153a43] py-20 text-white md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="El corazón del proyecto"
            title="Un masterplan que deja respirar al desierto."
            description="Cuatro aldeas reproducen la lectura clara y pausada del plano de referencia. El Oasis ocupa 5,000 m², los autos permanecen en la órbita perimetral y el interior se recorre por paseos peatonales continuos de 4 m."
            inverse
          />
          <dl className="grid grid-cols-2 border-y border-white/20 sm:grid-cols-4 lg:min-w-[620px]">
            {officialMetrics.map(([value, label]) => (
              <div key={label} className="border-r border-white/20 px-4 py-5 last:border-r-0 sm:px-6">
                <dt className="font-display text-xl font-semibold text-[#ffd7bd] sm:text-2xl">{value}</dt>
                <dd className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/60">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.65fr)]">
          <Link
            to="/simulador"
            onClick={() => trackEvent("view_lot", { source: "home_masterplan", action: "open_map" })}
            className="group relative block overflow-hidden rounded-md bg-[#0e282e] focus:outline-none focus:ring-2 focus:ring-[#f0b08c]"
            aria-label="Abrir masterplan interactivo y seleccionar un lote"
          >
            <div className="absolute left-4 top-4 z-10 rounded-sm border border-[#1d2a43]/15 bg-[#f7f0e1]/92 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#1d2a43] shadow-sm backdrop-blur-sm sm:left-5 sm:top-5">
              Plano comercial · V4 cuatro aldeas · Julio 2026
            </div>
            <img
              src="/images/masterplan-v4-commercial.png"
              alt="Plano comercial V4 de Moon Paracas con 282 lotes distribuidos en cuatro aldeas, Oasis central de 5,000 m² y circulación vehicular perimetral"
              className="aspect-[3/2] h-full w-full bg-[#f7f0e1] object-contain p-2 transition-transform duration-700 group-hover:scale-[1.01] sm:p-4"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#0a1719]/88 px-5 py-4 backdrop-blur-sm">
              <span className="text-xs font-bold uppercase tracking-[0.15em]">Explorar los {PROJECT.residentialLots} lotes</span>
              <ArrowUpRight className="h-5 w-5 text-[#f0b08c] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </Link>

          <div className="rounded-md border border-white/15 bg-[#102d34] p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">Filtrar por tipología</p>
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Tipologías de lote">
              {lotTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  role="tab"
                  aria-selected={activeType.id === type.id}
                  onClick={() => {
                    setActiveType(type);
                    trackEvent("select_typology", { typology: type.id, source: "home_masterplan" });
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-md border transition-all focus:outline-none focus:ring-2 focus:ring-white ${
                    activeType.id === type.id
                      ? "scale-105 border-white bg-white/10"
                      : "border-white/15 hover:border-white/50"
                  }`}
                  title={type.name}
                >
                  <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: type.color }} />
                  <span className="sr-only">{type.name}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeType.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="mt-7"
                role="tabpanel"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#f0b08c]">{activeType.note}</p>
                    <h3 className="mt-2 font-display text-3xl font-semibold leading-none text-white">{activeType.name}</h3>
                  </div>
                  <span className="font-display text-5xl font-semibold text-white/25">{activeType.count}</span>
                </div>
                <p className="mt-5 text-sm leading-7 text-white/70">{activeType.description}</p>
                <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">Precio · {COMMERCIAL_PRICE_PERIOD_LABEL}</p>
                    <p className="mt-1 text-xs font-semibold text-white/70">{activeType.rateLabel}</p>
                  </div>
                  <strong className="font-display text-2xl font-semibold text-[#f0b08c]">{activeType.ticketLabel}</strong>
                </div>
                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5 text-xs text-white/70">
                  <MapPinned className="h-4 w-4 text-[#f0b08c]" />
                  {activeType.count} unidades identificadas
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/65">
              <span className="flex items-center gap-2"><Waves className="h-4 w-4 text-[#8cbfc6]" /> Eje Oasis</span>
              <span className="flex items-center gap-2"><Car className="h-4 w-4 text-[#d9b878]" /> 12 estaciones periféricas</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.15em] text-white/55">
          Sistema V4: {PROJECT.residentialLots} lotes con cabida Ø4/Ø8 · {PROJECT.residentialLots} cocheras privadas · 18 cocheras comunes · Oasis 5,000 m² · pausas verdes entre grupos
        </p>
      </div>
    </section>
  );
};

export function LotTypesSection() {
  return (
  <section id="tipologias" data-testid="lot-types-section" className="scroll-mt-24 bg-[#f2f0e9] py-20 md:py-28">
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
      <SectionHeading
        eyebrow="Dos escalas de lote"
        title="Elige cuánto espacio quieres para habitar el paisaje."
        description="Los lotes de 120 y 240 m² conservan proporciones edificables, frente comprobado y acceso peatonal desde su cochera perimetral."
      />

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {lotTypes.map((type, index) => (
          <Link
            key={type.id}
            to="/simulador"
            onClick={() => trackEvent("select_typology", { typology: type.id, source: "home_typology_card" })}
            className="group relative min-h-[460px] overflow-hidden rounded-lg shadow-[0_20px_55px_rgba(24,53,59,0.1)] outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#a9472d]"
            aria-label={`Ver lotes ${type.name}: ${type.ticketLabel}`}
          >
            <img
              src={type.image}
              alt={`Inspiración visual para ${type.name}`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,20,20,0.97)_0%,rgba(10,20,20,0.12)_72%)]" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
              <span className="rounded-full border border-white/18 bg-[#0d1c1d]/55 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">0{index + 1} · {type.note}</span>
              <span className="font-display text-3xl font-semibold text-white/65">{type.count}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full border border-white/60" style={{ backgroundColor: type.color }} />
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">Tipología de lote</span>
              </div>
              <h3 className="font-display text-4xl font-semibold leading-none text-white">{type.name}</h3>
              <p className="mt-3 text-xs leading-6 text-white/75">{type.description}</p>
              <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/18 pt-5">
                <p className="text-sm font-semibold text-[#ffd7bd]">{type.ticketLabel}<span className="mt-1 block text-[9px] uppercase tracking-[0.12em] text-white/48">{type.rateLabel}</span></p>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#18353b] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
  );
}
