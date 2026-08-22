import { useState } from "react";
import { ArrowRight, Check, GitCompareArrows, MapPin, X } from "lucide-react";
import { Link } from "react-router-dom";
import { trackEvent } from "../../lib/analytics";
import { lotTypes } from "./MasterplanSection";

type ComparisonDetail = {
  id: string;
  bestFor: string;
  relationship: string;
  designFocus: string;
  verify: string;
};

const comparisonDetails: ComparisonDetail[] = [
  { id: "tiny", bestFor: "Arquitectura compacta y menor mantenimiento", relationship: "Filas interiores de las cuatro aldeas", designFocus: "Eficiencia espacial, casa y patio en 120 m²", verify: "Frente, fondo, retiros y orientación exactos" },
  { id: "premium", bestFor: "Priorizar jardín y mayor flexibilidad", relationship: "Filas exteriores vinculadas al paisaje", designFocus: "Relación interior–exterior en 240 m²", verify: "Frente, fondo, retiros y orientación exactos" },
];

export function TypologyComparator() {
  const [selectedIds, setSelectedIds] = useState(["tiny", "premium"]);
  const selectedTypes = selectedIds.map((id) => ({
    ...lotTypes.find((type) => type.id === id)!,
    ...comparisonDetails.find((detail) => detail.id === id)!,
  }));

  const toggle = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.length > 1 ? current.filter((item) => item !== id) : current;
      if (current.length >= 3) return [...current.slice(1), id];
      return [...current, id];
    });
    trackEvent("compare_typologies", { typology: id });
  };

  return (
    <section data-testid="typology-comparator" className="bg-[#F4EFE6] py-20 text-[#1C1612] md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a84f36]"><GitCompareArrows className="h-4 w-4" /> Comparador de tipologías</p>
            <h2 className="moon-title mt-3 max-w-3xl font-semibold">Compara la decisión, no solo la imagen.</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[#64706a] lg:justify-self-end">Compara las dos escalas disponibles. Las diferencias resumen intención de diseño; área, precio, retiros y constructibilidad deben validarse para el lote específico.</p>
        </div>

        <div className="mt-9 flex flex-wrap gap-2" aria-label="Elegir tipologías para comparar">
          {lotTypes.map((type) => {
            const selected = selectedIds.includes(type.id);
            return (
              <button key={type.id} type="button" onClick={() => toggle(type.id)} aria-pressed={selected} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${selected ? "border-[#1C1612] bg-[#1C1612] text-white shadow-sm" : "border-[#1C1612]/20 bg-white/35 text-[#1C1612] hover:-translate-y-0.5 hover:border-[#1C1612]/50 hover:bg-white/65"}`}>
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: type.color }} />
                {type.name.replace("Lote ", "")}
                {selected ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
            );
          })}
        </div>

        <div className={`mt-7 grid gap-px overflow-hidden rounded-md bg-[#1C1612]/15 ${selectedTypes.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
          {selectedTypes.map((type) => (
            <article key={type.id} className="overflow-hidden bg-[#f5f3ec]">
              <div className="group relative h-52 overflow-hidden">
                <img src={type.image} alt={`Referencia visual de ${type.name}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,23,23,0.88),rgba(10,23,23,0.08)_70%)]" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
                  <p className="rounded-full border border-white/18 bg-black/25 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">{type.count} unidades</p>
                  <button type="button" onClick={() => toggle(type.id)} disabled={selectedTypes.length === 1} aria-label={`Quitar ${type.name} de la comparación`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white hover:bg-white hover:text-[#1C1612] disabled:cursor-not-allowed disabled:opacity-30"><X className="h-4 w-4" /></button>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="font-display text-3xl font-semibold">{type.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-[#ffd7bd]">{type.ticketLabel} · {type.rateLabel}</p>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#a84f36]">Lectura de decisión</p>
                </div>
              <dl className="mt-7 divide-y divide-[#1C1612]/10 border-y border-[#1C1612]/10 text-xs">
                <div className="py-4"><dt className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#1C1612]/45">Ideal para</dt><dd className="mt-2 font-semibold leading-5">{type.bestFor}</dd></div>
                <div className="py-4"><dt className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#1C1612]/45">Relación con el conjunto</dt><dd className="mt-2 flex items-start gap-2 leading-5"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a84f36]" /> {type.relationship}</dd></div>
                <div className="py-4"><dt className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#1C1612]/45">Foco de diseño</dt><dd className="mt-2 leading-5">{type.designFocus}</dd></div>
                <div className="py-4"><dt className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#1C1612]/45">Antes de decidir</dt><dd className="mt-2 font-semibold leading-5 text-[#a84f36]">{type.verify}</dd></div>
              </dl>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-7 flex flex-col justify-between gap-4 rounded-md border border-[#1C1612]/15 bg-white/35 p-5 sm:flex-row sm:items-center">
          <p className="text-xs leading-5 text-[#64706a]">El comparador no asigna disponibilidad ni sustituye la ficha del lote.</p>
          <Link to="/simulador" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#bb5638] px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 hover:bg-[#a64932]">Comparar lotes reales <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}
