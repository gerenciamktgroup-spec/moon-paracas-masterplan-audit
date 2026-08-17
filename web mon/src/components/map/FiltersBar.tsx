import React, { useState } from "react";
import { SalesFilters } from "../../types/map";
import { CarFront, ChevronDown, ChevronUp, RotateCcw, Search, SlidersHorizontal } from "lucide-react";

export function FiltersBar({
  filters,
  onChange
}: {
  filters: SalesFilters;
  onChange: (next: SalesFilters) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasFilters = filters.search !== "" || filters.blockId !== "all" || filters.status !== "all" || filters.typology !== "all";
  const resetFilters = () => onChange({ search: "", blockId: "all", status: "all", typology: "all" });

  return (
    <div className="relative z-10 flex flex-col gap-3 border-b border-white/10 bg-[#162526] px-4 py-3 font-sans text-white sm:px-5 md:flex-row md:items-center">
      <div className="flex items-center justify-between gap-3 w-full md:w-auto md:flex-1">
        {/* Search input - takes all space in mobile */}
        <label className="relative flex-1 md:max-w-[260px]">
          <span className="sr-only">Buscar lote o cochera</span>
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
          <input
            className="min-h-10 w-full rounded-md border border-white/12 bg-[#0e1b1c] py-2 pl-9 pr-4 text-sm font-light text-white outline-none placeholder:text-white/35 focus:border-[#df8a6f] focus:ring-1 focus:ring-[#df8a6f]"
            value={filters.search}
            placeholder="Buscar lote o cochera"
            onChange={e => onChange({ ...filters, search: e.target.value })}
          />
        </label>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/12 bg-white/5 px-4 text-[10px] font-bold uppercase text-white md:hidden"
          aria-expanded={isOpen}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filtros</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Selects container: hidden on mobile unless open, always flex on md and up */}
      <div className={`${isOpen ? "flex" : "hidden"} w-full flex-col items-stretch gap-3 border-t border-white/10 pt-3 md:flex md:w-auto md:flex-1 md:flex-row md:items-center md:border-none md:pt-0`}>
        <button
          type="button"
          aria-pressed={filters.typology === "parking"}
          onClick={() => onChange({
            ...filters,
            blockId: "all",
            typology: filters.typology === "parking" ? "all" : "parking",
          })}
          className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-[10px] font-bold uppercase transition-colors ${
            filters.typology === "parking"
              ? "border-[#df8a6f] bg-[#c85b3e] text-white"
              : "border-white/12 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <CarFront className="h-3.5 w-3.5" aria-hidden="true" /> Cocheras
        </button>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <select
            aria-label="Filtrar por aldea"
            className="min-h-10 w-full cursor-pointer rounded-md border border-white/12 bg-[#0e1b1c] px-3 text-xs font-semibold text-white outline-none focus:border-[#df8a6f] md:w-auto"
            value={filters.blockId}
            onChange={e => onChange({ ...filters, blockId: e.target.value as any })}
          >
            <option value="all" className="bg-[#1D1714] text-white">Todas las aldeas</option>
            {Array.from({ length: 4 }, (_, index) => `C${index + 1}`).map((id) => <option key={id} value={id} className="bg-[#1D1714] text-white">Aldea {id}</option>)}
          </select>
          <select
            aria-label="Filtrar por estado comercial"
            className="min-h-10 w-full cursor-pointer rounded-md border border-white/12 bg-[#0e1b1c] px-3 text-xs font-semibold text-white outline-none focus:border-[#df8a6f] md:w-auto"
            value={filters.status}
            onChange={e => onChange({ ...filters, status: e.target.value as any })}
          >
            <option value="all" className="bg-[#1D1714] text-white">Todos los estados</option>
            <option value="available" className="bg-[#1D1714] text-white">Disponible</option>
            <option value="offer" className="bg-[#1D1714] text-white">En Oferta</option>
            <option value="sold" className="bg-[#1D1714] text-white">Vendido</option>
            <option value="blocked" className="bg-[#1D1714] text-white">Reservado</option>
            <option value="reserved" className="bg-[#1D1714] text-white">Separado</option>
          </select>
          <select
            aria-label="Filtrar por tipología"
            className="min-h-10 w-full cursor-pointer rounded-md border border-white/12 bg-[#0e1b1c] px-3 text-xs font-semibold text-white outline-none focus:border-[#df8a6f] md:w-auto"
            value={filters.typology}
            onChange={e => onChange({ ...filters, typology: e.target.value as any })}
          >
            <option value="all" className="bg-[#1D1714] text-white">Todos los tipos</option>
            <option value="premium" className="bg-[#1D1714] text-white">Oasis / Lote amplio · 240 m²</option>
            <option value="tiny-house" className="bg-[#1D1714] text-white">Patio Lunar · 120 m²</option>
            <option value="parking" className="bg-[#1D1714] text-white">Cochera privada</option>
          </select>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/12 px-3 text-[10px] font-bold uppercase text-white/60 hover:bg-white/5 hover:text-white md:ml-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
