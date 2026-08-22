import React from "react";
import { ArrowUpRight, Sparkles, MessageCircle, ShieldCheck, MapPin, CheckCircle2, Layers, Download, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { whatsappHref } from "../../config/project";
import { STANDARD_LOT_PRICE_USD, STANDARD_LOT_PRICE_PEN, DOUBLE_LOT_PRICE_USD, DOUBLE_LOT_PRICE_PEN, MACRO_LOT_PRICE_USD, LOT_PRICE_PER_M2_USD, MACRO_LOT_PRICE_PER_M2_USD } from "../../config/pricing";

interface ProjectHeroProps {
  onOpenDossier?: () => void;
  onOpenShowroom?: () => void;
}

export const ProjectHero: React.FC<ProjectHeroProps> = ({ onOpenDossier, onOpenShowroom }) => {
  const waHeroMsg = "Hola! Quiero información sobre los lotes de 120 m² a $120/m² en Moon Paracas (Precio de Lanzamiento desde $14,400 USD).";

  return (
    <section className="relative min-h-[95vh] flex flex-col justify-between overflow-hidden bg-[#FAF7F2] pt-28 sm:pt-36 pb-16">
      
      {/* Luces de Atardecer y Atmósfera Cálida */}
      <div className="absolute inset-0 ambient-desert-glow pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] ambient-sunset-flare pointer-events-none" />
      <div className="pointer-events-none absolute -left-20 bottom-10 h-[450px] w-[450px] rounded-full bg-[#C5A059]/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12 w-full flex-1 flex flex-col justify-center">
        
        {/* Top Eyebrow Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-white/90 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#A84F36] shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
            Precios de Lanzamiento · ${LOT_PRICE_PER_M2_USD} USD / m²
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#4E6646]/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#4E6646]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#4E6646]" />
            Asociación & Adjudicación Notarial
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#161311]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#38312B]">
            <MapPin className="h-3.5 w-3.5 text-[#C85B3E]" />
            A 3 horas de Lima · Sol 365 días
          </div>
        </div>

        {/* Titular Editorial de Gran Escala */}
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-[5.4rem] font-bold leading-[1.03] text-[#161311] tracking-tight">
            El lujo del <span className="font-serif-italic font-normal text-[#C85B3E]">silencio</span>.<br />
            Tu santuario en Paracas.
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-[#38312B]/85">
            Lotes desde <strong>120 m² para casa domo</strong> a solo <strong>${LOT_PRICE_PER_M2_USD} USD/m²</strong> (desde ${STANDARD_LOT_PRICE_USD.toLocaleString()} USD), con opción de unir 2 lotes (240 m²) y acceso al primer <strong>Oasis de 5,000 m²</strong> en la pampa de Ica.
          </p>
        </div>

        {/* Bento Grid de Ofertas de Lanzamiento */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch max-w-5xl">
          
          {/* Card 1: Lote 120 m² (Casa Domo) */}
          <div className="md:col-span-4 rounded-[2rem] border border-[#C5A059]/35 bg-white p-7 shadow-[0_20px_50px_rgba(22,19,17,0.06)] flex flex-col justify-between hover:border-[#C5A059] transition-all duration-300">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">Lote Casa Domo</span>
                <span className="rounded-full bg-[#4E6646]/10 px-2.5 py-0.5 text-[9px] font-bold text-[#4E6646]">${LOT_PRICE_PER_M2_USD}/m²</span>
              </div>
              <h3 className="mt-2.5 font-display text-2xl font-bold text-[#161311]">120 m² Residencial</h3>
              <p className="mt-1 text-xs text-[#786F66]">Diseñado para Domo Ø8m o cabaña ecológica dentro del condominio.</p>
            </div>
            
            <div className="mt-8 pt-5 border-t border-[#E8E1D5] flex items-baseline justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#786F66] font-bold">Lanzamiento</span>
                <p className="text-3xl font-bold font-display text-[#161311]">${STANDARD_LOT_PRICE_USD.toLocaleString()} <span className="text-xs font-sans text-[#786F66]">USD</span></p>
                <span className="text-[11px] text-[#A84F36] font-semibold">~S/ {STANDARD_LOT_PRICE_PEN.toLocaleString()} PEN</span>
              </div>
              <span className="text-xs font-semibold text-[#4E6646]">36 cuotas</span>
            </div>
          </div>

          {/* Card 2: Lote Doble 240 m² (2 Lotes Juntos) */}
          <div className="md:col-span-4 rounded-[2rem] border border-[#C85B3E]/25 bg-gradient-to-b from-[#FAF7F2] to-[#F4EFE6] p-7 shadow-[0_20px_50px_rgba(22,19,17,0.04)] flex flex-col justify-between hover:border-[#C85B3E]/50 transition-all duration-300">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">Lote Doble (2 juntos)</span>
                <span className="rounded-full bg-[#C85B3E]/10 px-2.5 py-0.5 text-[9px] font-bold text-[#C85B3E]">Mayor Espacio</span>
              </div>
              <h3 className="mt-2.5 font-display text-2xl font-bold text-[#161311]">240 m² Ampliado</h3>
              <p className="mt-1 text-xs text-[#786F66]">Ideal para domo principal + plunge pool privada y jardín amplio.</p>
            </div>
            
            <div className="mt-8 pt-5 border-t border-[#E8E1D5] flex items-baseline justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#786F66] font-bold">Lanzamiento</span>
                <p className="text-3xl font-bold font-display text-[#C85B3E]">${DOUBLE_LOT_PRICE_USD.toLocaleString()} <span className="text-xs font-sans text-[#786F66]">USD</span></p>
                <span className="text-[11px] text-[#38312B] font-semibold">~S/ {DOUBLE_LOT_PRICE_PEN.toLocaleString()} PEN</span>
              </div>
              <span className="text-xs font-semibold text-[#161311]">2 unidades</span>
            </div>
          </div>

          {/* Card 3: Terrenos > 2,000 m² (Sector Campestre Externo) */}
          <div className="md:col-span-4 rounded-[2rem] border border-[#E8E1D5] bg-white p-7 shadow-[0_20px_50px_rgba(22,19,17,0.04)] flex flex-col justify-between hover:border-[#161311] transition-all duration-300">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F66]">Sector Campestre Externo</span>
                <span className="rounded-full bg-[#161311]/10 px-2.5 py-0.5 text-[9px] font-bold text-[#161311]">${MACRO_LOT_PRICE_PER_M2_USD}/m²</span>
              </div>
              <h3 className="mt-2.5 font-display text-2xl font-bold text-[#161311]">&gt; 2,000 m² Rústico</h3>
              <p className="mt-1 text-xs text-[#786F66]">Grandes extensiones fuera del condominio para huertos o proyectos campestres.</p>
            </div>
            
            <div className="mt-8 pt-5 border-t border-[#E8E1D5] flex items-baseline justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#786F66] font-bold">Desde</span>
                <p className="text-3xl font-bold font-display text-[#161311]">${MACRO_LOT_PRICE_USD.toLocaleString()} <span className="text-xs font-sans text-[#786F66]">USD</span></p>
                <span className="text-[11px] text-[#786F66]">2,000 m² a $45/m²</span>
              </div>
              <span className="text-xs font-semibold text-[#786F66]">Extramuros</span>
            </div>
          </div>

        </div>

        {/* Acciones de Contacto Inmediato */}
        <div className="mt-8 flex flex-wrap gap-3.5 items-center">
          <Link
            to="/simulador"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#C85B3E] px-8 py-4 font-sans text-xs font-bold text-white shadow-lg shadow-[#C85B3E]/25 transition-all duration-300 hover:bg-[#A84F36] hover:shadow-xl active:scale-95"
          >
            <span>Ver Disponibilidad en Masterplan</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          {onOpenDossier && (
            <button
              onClick={onOpenDossier}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#C5A059]/60 bg-white px-7 py-4 font-sans text-xs font-bold text-[#161311] shadow-sm transition-all duration-300 hover:bg-[#FAF7F2] active:scale-95 cursor-pointer"
            >
              <Download className="h-4 w-4 text-[#A84F36]" />
              <span>Descargar Dossier 2026</span>
            </button>
          )}

          {onOpenShowroom && (
            <button
              onClick={onOpenShowroom}
              className="hidden lg:flex items-center justify-center gap-2 rounded-2xl border border-[#E8E1D5] bg-white/80 px-6 py-4 font-sans text-xs font-bold text-[#38312B] shadow-sm transition-all duration-300 hover:bg-white active:scale-95 cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-[#4E6646]" />
              <span>Agendar Visita Showroom</span>
            </button>
          )}

          <a
            href={whatsappHref(waHeroMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#E8E1D5] bg-white px-6 py-4 font-sans text-xs font-bold text-[#161311] shadow-sm transition-all duration-300 hover:bg-[#FAF7F2] active:scale-95"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366] fill-current" />
            <span>Cotizar por WhatsApp (Separa con S/ 1,000)</span>
          </a>
        </div>

      </div>

      {/* Franja de Métricas Reales */}
      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12 mt-16 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#E8E1D5] pt-8 text-left">
          <div>
            <span className="block font-display text-3xl font-bold text-[#161311]">$120 USD</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F66]">Precio Lanzamiento x m²</span>
          </div>
          <div>
            <span className="block font-display text-3xl font-bold text-[#C85B3E]">120 / 240 m²</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F66]">Lote Simple o Doble</span>
          </div>
          <div>
            <span className="block font-display text-3xl font-bold text-[#C5A059]">5,000 m²</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F66]">Oasis & Laguna Zen</span>
          </div>
          <div>
            <span className="block font-display text-3xl font-bold text-[#4E6646]">Reglamento</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F66]">Ecológico & Plusvalía</span>
          </div>
        </div>
      </div>
    </section>
  );
};

