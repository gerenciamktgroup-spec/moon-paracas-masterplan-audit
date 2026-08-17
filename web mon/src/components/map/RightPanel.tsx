import React from "react";
import { Lot } from "../../types/map";
import { BUSINESS_RULES } from "../../data/business";

export function RightPanel({ lot, onDeselect }: { lot: Lot | null, onDeselect?: () => void }) {
  if (!lot) {
    return (
      <aside className="w-full md:w-[360px] bg-[#1D1714]/65 backdrop-blur-xl border-t md:border-t-0 md:border-l border-[rgba(225,217,193,0.15)] p-6 sm:p-10 flex flex-col shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.15)] h-auto md:h-full overflow-y-auto text-[#E1D9C1]">
        <div className="font-display font-medium text-[var(--color-desert-bronze)] tracking-[0.25em] mb-10 text-xl uppercase">MOON PARACAS</div>
        <h3 className="font-sans text-xs font-semibold text-[#E1D9C1]/85 tracking-widest uppercase mb-4">Fase 0 - Founder</h3>
        <p className="font-sans text-[#E1D9C1]/75 text-sm leading-relaxed mb-6 font-light">Selecciona una parcela en el masterplan para visualizar su información técnica, tipología y disponibilidad comercial.</p>
        
        <div className="mt-auto pt-8 border-t border-[rgba(225,217,193,0.15)]">
          <p className="font-sans text-[#E1D9C1]/50 text-[10px] leading-relaxed uppercase tracking-wider">{BUSINESS_RULES.legalDisclaimer}</p>
        </div>
      </aside>
    );
  }

  const lotNum = lot.id.includes('-') ? lot.id.split('-')[1].replace('L', '') : lot.id;

  return (
    <aside className="w-full md:w-[360px] bg-[#1D1714]/75 backdrop-blur-xl border-t md:border-t-0 md:border-l border-[rgba(225,217,193,0.15)] p-6 sm:p-10 flex flex-col shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.15)] h-auto md:h-full overflow-y-auto text-[#E1D9C1] animate-fade-in">
      <div 
        className="font-sans text-[10px] font-bold text-[#E2725B] tracking-widest cursor-pointer hover:text-[#E1D9C1] transition-colors mb-8 uppercase flex items-center gap-2"
        onClick={onDeselect}
      >
        <span>&larr;</span> VOLVER AL PLANO
      </div>
      
      <h3 className="font-sans text-[10px] font-bold text-[#E1D9C1]/85 tracking-widest uppercase mb-2">MANZANA {lot.blockId}</h3>
      <h4 className="font-display text-4xl font-light text-white mb-6">Lote {lotNum}</h4>
      
      <div className="mb-10">
        <span className={`font-sans inline-block px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
          lot.status === 'available' ? 'bg-[#E1D9C1] text-[#1D1714]' :
          lot.status === 'offer' ? 'bg-[#E2725B] text-white' :
          lot.status === 'sold' ? 'bg-[#1D1714] text-[#E1D9C1]/50 border border-[rgba(225,217,193,0.15)]' :
          'bg-[#382B23] text-white'
        }`}>
          {lot.status === 'available' ? 'DISPONIBLE' : 
           lot.status === 'offer' ? 'EN OFERTA' : 
           lot.status === 'sold' ? 'VENDIDO' : 'RESERVADO'}
        </span>
      </div>

      <div className="space-y-5 mb-10 font-sans">
        <div className="flex justify-between items-end border-b border-[rgba(225,217,193,0.15)] pb-3">
          <label className="text-xs text-[#E1D9C1]/70 font-light uppercase tracking-wider">Tipología</label>
          <strong className="text-sm text-white font-medium uppercase tracking-wide">{lot.typology}</strong>
        </div>

        <div className="flex justify-between items-end border-b border-[rgba(225,217,193,0.15)] pb-3">
          <label className="text-xs text-[#E1D9C1]/70 font-light uppercase tracking-wider">Área Exacta (Aprox.)</label>
          <strong className="text-sm text-white font-medium">{lot.areaM2.toFixed(2)} m²</strong>
        </div>

        {lot.dimensions && (
          <div className="flex justify-between items-end border-b border-[rgba(225,217,193,0.15)] pb-3">
            <label className="text-xs text-[#E1D9C1]/70 font-light uppercase tracking-wider">Dimensiones</label>
            <strong className="text-sm text-white font-medium">{lot.dimensions}</strong>
          </div>
        )}

        <div className="flex justify-between items-end border-b border-[rgba(225,217,193,0.15)] pb-3">
          <label className="text-xs text-[#E1D9C1]/70 font-light uppercase tracking-wider">Inversión</label>
          <strong className="text-sm text-[#E2725B] font-semibold">{lot.priceLabel}</strong>
        </div>
      </div>

      <p className="font-sans text-[#E1D9C1]/70 text-[11px] leading-relaxed mb-10 bg-[#1D1714]/40 p-5 rounded-none border border-[rgba(225,217,193,0.15)] font-light">
        Área de uso exclusivo calculada matemáticamente. Proyecto privado de baja densidad en desarrollo progresivo. No constituye habilitación urbana tradicional.
      </p>

      <div className="flex flex-col gap-4 mt-auto font-sans">
        <button className="w-full bg-[#E2725B] text-white font-medium text-[11px] tracking-widest uppercase py-4 hover:bg-[#e3826d] transition-all shadow-[0_0_15px_rgba(226,114,91,0.2)] cursor-pointer">
          Contactar Asesor
        </button>
        <button className="w-full bg-transparent border border-[#E1D9C1]/30 text-[#E1D9C1] font-medium text-[11px] tracking-widest uppercase py-4 hover:bg-white/10 transition-colors cursor-pointer">
          Simular Inversión
        </button>
      </div>
    </aside>
  );
}
