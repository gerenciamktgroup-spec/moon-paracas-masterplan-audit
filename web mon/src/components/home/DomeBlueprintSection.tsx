import React, { useState } from "react";
import { Ruler, ShieldCheck, Wind, Sun, Droplets, CheckCircle2, Layers, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const DomeBlueprintSection: React.FC = () => {
  const [activeSpec, setActiveSpec] = useState<"planta" | "corte" | "materiales">("planta");

  return (
    <section className="bg-white py-20 md:py-28 border-y border-[#E8E1D5] text-[#1C1612]">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        
        {/* Encabezado Arquitectónico */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-[#E8E1D5] pb-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-[#FAF8F5] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">
              <Ruler className="h-3.5 w-3.5 text-[#C5A059]" />
              Ficha Técnica de Construcción · Domo Ø8m (50 m²)
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#1C1612]">
              Arquitectura comprobada, no renders abstractos.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#786F66] max-w-2xl">
              Cada domo geodésico se implanta sobre una plataforma elevada que aísla de la grava y el polvo, con cotas reales de habitabilidad y materiales adaptados al clima de Ica.
            </p>
          </div>

          {/* Selector de Vistas Técnicas */}
          <div className="flex rounded-full border border-[#E8E1D5] bg-[#FAF8F5] p-1.5 shadow-sm">
            <button
              onClick={() => setActiveSpec("planta")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                activeSpec === "planta" ? "bg-[#1C1612] text-white shadow" : "text-[#786F66] hover:text-[#1C1612]"
              }`}
            >
              Plano de Planta (Cotas)
            </button>
            <button
              onClick={() => setActiveSpec("materiales")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                activeSpec === "materiales" ? "bg-[#1C1612] text-white shadow" : "text-[#786F66] hover:text-[#1C1612]"
              }`}
            >
              Materialidad & Resistencia
            </button>
          </div>
        </div>

        {/* Contenido Técnico */}
        {activeSpec === "planta" ? (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Blueprint SVG Acotado */}
            <div className="lg:col-span-7 rounded-3xl border border-[#E8E1D5] bg-[#FAF8F5] p-6 sm:p-8 relative overflow-hidden shadow-inner">
              <div className="flex justify-between items-center mb-4 text-[10px] font-bold uppercase tracking-wider text-[#786F66]">
                <span>Escala 1:50 · Área Útil: 50.26 m²</span>
                <span className="text-[#A84F36]">Diámetro Exterior: 8.00 m</span>
              </div>

              {/* Dibujo Vectorial del Domo con Cotas */}
              <svg viewBox="0 0 500 500" className="w-full h-auto select-none">
                <defs>
                  <pattern id="cad-grid" width="25" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(28,22,18,0.04)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                
                {/* Cuadrícula técnica */}
                <rect width="500" height="500" fill="url(#cad-grid)" />

                {/* Deck exterior perimetral (semicírculo o terraza frontal) */}
                <path d="M 50 350 A 200 200 0 0 0 450 350 L 450 430 L 50 430 Z" fill="#F4EFE6" stroke="#D9CDB8" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="250" y="400" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#786F66" fontFamily="sans-serif">DECK EXTERIOR DE MADERA (25 m²)</text>

                {/* Perímetro circular del Domo Ø8m */}
                <circle cx="250" cy="240" r="170" fill="#FFFFFF" stroke="#1C1612" strokeWidth="3" />
                <circle cx="250" cy="240" r="162" fill="none" stroke="#C5A059" strokeWidth="1" strokeDasharray="6 4" />

                {/* Zona Cama King (2.00 × 2.00 m) */}
                <rect x="180" y="120" width="140" height="130" rx="6" fill="#F4EFE6" stroke="#1C1612" strokeWidth="1.5" />
                <text x="250" y="185" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1C1612" fontFamily="sans-serif">CAMA KING</text>
                <text x="250" y="200" textAnchor="middle" fontSize="8" fill="#786F66" fontFamily="sans-serif">2.00 × 2.00 m</text>

                {/* Baño Privado Integrado (2.40 × 1.80 m) */}
                <path d="M 120 280 L 230 280 L 230 380 A 170 170 0 0 1 120 280 Z" fill="#E8E1D5" stroke="#1C1612" strokeWidth="1.5" />
                <text x="175" y="325" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1C1612" fontFamily="sans-serif">BAÑO & DUCHA</text>
                <text x="175" y="340" textAnchor="middle" fontSize="8" fill="#786F66" fontFamily="sans-serif">2.40 × 1.80 m</text>

                {/* Kitchenette / Coffee Bar */}
                <rect x="270" y="280" width="110" height="45" rx="4" fill="#E8E1D5" stroke="#1C1612" strokeWidth="1.5" />
                <text x="325" y="307" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1C1612" fontFamily="sans-serif">KITCHENETTE</text>

                {/* Ventanal Panorámico (Arco frontal de vista este/oeste) */}
                <path d="M 130 120 A 170 170 0 0 1 370 120" fill="none" stroke="#A84F36" strokeWidth="4" />
                <text x="250" y="85" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#A84F36" fontFamily="sans-serif">▲ VENTANAL PANORÁMICO (VISTA AL AMANECER)</text>

                {/* Cotas y líneas de dimensión */}
                <line x1="80" y1="240" x2="420" y2="240" stroke="#786F66" strokeWidth="0.8" strokeDasharray="3 3" />
                <text x="430" y="243" fontSize="9" fontWeight="bold" fill="#786F66" fontFamily="sans-serif">Ø 8.00 m</text>
              </svg>
            </div>

            {/* Desglose de Áreas y Espacios */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5]">
                <h4 className="font-display text-lg font-bold text-[#1C1612]">1. Suite Principal (22.5 m²)</h4>
                <p className="text-xs text-[#786F66] mt-1 leading-relaxed">
                  Espacio central para cama King, mesas de noche de madera maciza, piso flotante térmico y ventanal panorámico con cortinas blackout.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5]">
                <h4 className="font-display text-lg font-bold text-[#1C1612]">2. Baño Privado Completo (7.5 m²)</h4>
                <p className="text-xs text-[#786F66] mt-1 leading-relaxed">
                  Ducha española con mampara de vidrio templado, inodoro ecológico de bajo consumo y lavamanos sobre mesada de piedra o madera local.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5]">
                <h4 className="font-display text-lg font-bold text-[#1C1612]">3. Kitchenette & Estar (8.5 m²)</h4>
                <p className="text-xs text-[#786F66] mt-1 leading-relaxed">
                  Frigobar, mesa de preparación en cuarzo/madera, cafetera, lavadero y zona de desayuno integrada.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-[#C5A059]/40 bg-[#F4EFE6]">
                <h4 className="font-display text-lg font-bold text-[#A84F36]">4. Deck Exterior & Plunge Pool (25 m²)</h4>
                <p className="text-xs text-[#786F66] mt-1 leading-relaxed">
                  Pérgola de sombra en madera y caña brava + tina de hidromasaje en piedra (exclusiva del Pack Comfort 50).
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF8F5] p-7 flex flex-col justify-between">
              <div>
                <Layers className="h-7 w-7 text-[#A84F36] mb-4" />
                <h3 className="font-display text-xl font-bold text-[#1C1612]">Cubierta Tricapa Anti-UV</h3>
                <p className="text-xs text-[#786F66] mt-2 leading-relaxed">
                  Membrana arquitectónica de alta densidad con tratamiento antihongos, retardante de fuego y filtro UV50+. Mantiene el interior fresco durante las horas de sol y retiene la temperatura en la noche fría.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#4E6646]">
                <CheckCircle2 className="h-4 w-4" /> Vida útil estimada: 12-15 años
              </span>
            </div>

            <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF8F5] p-7 flex flex-col justify-between">
              <div>
                <Wind className="h-7 w-7 text-[#C5A059] mb-4" />
                <h3 className="font-display text-xl font-bold text-[#1C1612]">Estructura Geodésica</h3>
                <p className="text-xs text-[#786F66] mt-2 leading-relaxed">
                  Madera estructural seleccionada y curada contra sales e insectos. La geometría triangular distribuye las cargas de manera homogénea, soportando ráfagas de viento de más de 75 km/h sin vibraciones.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#4E6646]">
                <CheckCircle2 className="h-4 w-4" /> Resistencia antisísmica natural
              </span>
            </div>

            <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF8F5] p-7 flex flex-col justify-between">
              <div>
                <Droplets className="h-7 w-7 text-[#0E8B99] mb-4" />
                <h3 className="font-display text-xl font-bold text-[#1C1612]">Saneamiento Bio-Ecológico</h3>
                <p className="text-xs text-[#786F66] mt-2 leading-relaxed">
                  Sistema de biodigestor individual estanco de polietileno de alta resistencia. Procesa las aguas residuales mediante digestión anaeróbica sin olores ni contacto con el suelo natural.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#4E6646]">
                <CheckCircle2 className="h-4 w-4" /> Cero impacto en el subsuelo
              </span>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
