import React from "react";
import { Wind, Sun, Droplets, Moon, Trees, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export const ClimateEngineeringSection: React.FC = () => {
  return (
    <section className="bg-white py-20 md:py-28 text-[#1C1612] border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        
        {/* Encabezado */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-[#E8E1D5] pb-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-[#FAF8F5] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">
              <Wind className="h-3.5 w-3.5 text-[#C5A059]" />
              Ingeniería del Clima · Desierto Interior
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#1C1612]">
              Diseñado para el viento y el sol de Ica.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#786F66] max-w-2xl">
              En Paracas, el confort no se improvisa con aire acondicionado: se resuelve desde el emplazamiento, la aerodinámica del domo y la barrera vegetal del paisaje.
            </p>
          </div>
        </div>

        {/* 3 Pilares de Ingeniería Bioclimática */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pilar 1: Vientos Paracas */}
          <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF8F5] p-7 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="inline-flex p-3 rounded-2xl bg-white border border-[#E8E1D5] text-[#A84F36] mb-4">
                <Wind className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#1C1612]">Mitigación del Viento Paracas</h3>
              <p className="text-xs text-[#786F66] mt-2 leading-relaxed">
                Por las tardes, el viento térmico del sur se desvía de forma natural por la curvatura geodésica del domo (sin esquinas que generen resistencia) y se amortigua un 60% gracias al cerco vivo perimetral de mioporos y olivos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E1D5] text-[10px] font-bold uppercase text-[#4E6646] flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Sin ruidos ni vibraciones estructurales
            </div>
          </div>

          {/* Pilar 2: Gestión Hídrica & Cisterna */}
          <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF8F5] p-7 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="inline-flex p-3 rounded-2xl bg-white border border-[#E8E1D5] text-[#0E8B99] mb-4">
                <Droplets className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#1C1612]">Suministro Hídrico Central</h3>
              <p className="text-xs text-[#786F66] mt-2 leading-relaxed">
                Red interna subterránea presurizada conectada a cisterna de almacenamiento general. Cada lote cuenta con punto de conexión garantizado para consumo doméstico y riego tecnificado por goteo de agaves y árboles nativos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E1D5] text-[10px] font-bold uppercase text-[#4E6646] flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Uso eficiente del agua por goteo
            </div>
          </div>

          {/* Pilar 3: Cielo Nocturno & Baja Luminosidad */}
          <div className="rounded-3xl border border-[#E8E1D5] bg-[#FAF8F5] p-7 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="inline-flex p-3 rounded-2xl bg-white border border-[#E8E1D5] text-[#C5A059] mb-4">
                <Moon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#1C1612]">Preservación del Cielo Oscuro</h3>
              <p className="text-xs text-[#786F66] mt-2 leading-relaxed">
                Iluminación exterior rasante al suelo en temperatura cálida (2700K). Cero reflectores hacia arriba, manteniendo el cielo de Ica libre de contaminación lumínica para observación astronómica y descanso absoluto.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E1D5] text-[10px] font-bold uppercase text-[#4E6646] flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Certificación de cielo estrellado
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
