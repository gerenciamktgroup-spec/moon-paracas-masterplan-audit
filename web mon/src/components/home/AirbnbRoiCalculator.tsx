import React, { useState } from "react";
import { Calculator, TrendingUp, DollarSign, MessageCircle, HelpCircle, Sparkles, CheckCircle2, Building2, Palmtree, ArrowUpRight } from "lucide-react";
import { whatsappHref } from "../../config/project";

export const AirbnbRoiCalculator: React.FC = () => {
  const [nightlyRate, setNightlyRate] = useState<number>(420);
  const [nightsPerMonth, setNightsPerMonth] = useState<number>(8); // Default 8 noches = 4 fines de semana

  // Cálculos financieros
  const grossMonthlyIncome = nightlyRate * nightsPerMonth;
  const operationalCost = Math.round(grossMonthlyIncome * 0.25); // 25% gestión, limpieza, amenities
  const netMonthlyIncome = grossMonthlyIncome - operationalCost;
  const estimatedLotInstallment = 1458; // Cuota referencial financiamiento Founder 50
  const monthlyCashflow = netMonthlyIncome - estimatedLotInstallment;
  const annualNetReturn = netMonthlyIncome * 12;

  const waRoiMsg = `Hola! Estuve calculando el modelo de renta Airbnb en Moon Paracas (Tarifa S/ ${nightlyRate} por ${nightsPerMonth} noches/mes = Ingreso Neto S/ ${netMonthlyIncome}/mes). Quisiera más información sobre la gestión de alquileres.`;

  return (
    <section className="bg-[#F4EFE6] py-20 md:py-28 text-[#1C1612] border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        
        {/* Encabezado */}
        <div className="max-w-3xl border-b border-[#E8E1D5] pb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">
            <TrendingUp className="h-3.5 w-3.5 text-[#C5A059]" />
            Modelo de Inversión · Demanda Glamping Paracas
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#1C1612]">
            Tu escape personal de fin de semana,<br />
            <span className="font-normal italic text-[#A84F36]">un activo rentable el resto del mes.</span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#786F66] leading-relaxed">
            Paracas es uno de los destinos con mayor demanda de escapadas cortas desde Lima (sol 365 días al año). Calcula cuánto puede generar tu domo alquilándolo únicamente los fines de semana que decidas no utilizarlo.
          </p>
        </div>

        {/* Calculadora Interactiva */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Controles de Entrada (Sliders) */}
          <div className="lg:col-span-5 rounded-3xl border border-[#E8E1D5] bg-white p-7 sm:p-9 shadow-sm flex flex-col justify-between">
            <div className="space-y-8">
              <h3 className="font-display text-xl font-bold text-[#1C1612] flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[#C85B3E]" /> Parámetros de Ocupación
              </h3>

              {/* Slider 1: Tarifa por Noche */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#786F66]">
                    Tarifa Promedio por Noche
                  </label>
                  <span className="font-display text-2xl font-bold text-[#1C1612]">
                    S/ {nightlyRate}
                  </span>
                </div>
                <input
                  type="range"
                  min="320"
                  max="650"
                  step="10"
                  value={nightlyRate}
                  onChange={(e) => setNightlyRate(Number(e.target.value))}
                  className="w-full h-2 bg-[#E8E1D5] rounded-lg appearance-none cursor-pointer accent-[#C85B3E]"
                />
                <div className="flex justify-between text-[10px] text-[#786F66] mt-1 font-semibold">
                  <span>S/ 320 (Baja temporada)</span>
                  <span>S/ 650 (Festivos / Sol alto)</span>
                </div>
              </div>

              {/* Slider 2: Noches al Mes */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#786F66]">
                    Noches Alquiladas al Mes
                  </label>
                  <span className="font-display text-2xl font-bold text-[#A84F36]">
                    {nightsPerMonth} noches
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="16"
                  step="1"
                  value={nightsPerMonth}
                  onChange={(e) => setNightsPerMonth(Number(e.target.value))}
                  className="w-full h-2 bg-[#E8E1D5] rounded-lg appearance-none cursor-pointer accent-[#C85B3E]"
                />
                <div className="flex justify-between text-[10px] text-[#786F66] mt-1 font-semibold">
                  <span>4 noches (2 fines de semana)</span>
                  <span>16 noches (Uso intensivo)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5] text-xs text-[#786F66] leading-relaxed">
                💡 <em>Nota:</em> Consideramos un 25% de costos operativos estimados (limpieza por estadía, lavandería de blancos, recepción y mantenimiento general).
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E8E1D5]">
              <a
                href={whatsappHref(waRoiMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1C1612] py-4 text-xs font-bold text-white shadow transition hover:bg-[#C85B3E]"
              >
                <MessageCircle className="h-4 w-4 fill-current text-[#25D366]" />
                <span>Consultar Gestión de Alquiler</span>
              </a>
            </div>
          </div>

          {/* Panel de Resultados Financieros */}
          <div className="lg:col-span-7 rounded-3xl border-2 border-[#C5A059]/40 bg-white p-7 sm:p-10 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#C5A059] text-white text-[9px] font-bold uppercase px-4 py-1.5 rounded-bl-xl tracking-widest">
              Proyección Estimada
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">Flujo de Caja Mensual</span>
              <h4 className="mt-1 font-display text-3xl font-bold text-[#1C1612]">Retorno Operativo del Domo</h4>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5]">
                  <span className="text-[10px] font-bold uppercase text-[#786F66]">Ingreso Bruto Mensual</span>
                  <p className="font-display text-2xl font-bold text-[#1C1612] mt-1">S/ {grossMonthlyIncome.toLocaleString("es-PE")}</p>
                  <p className="text-[10px] text-[#786F66] mt-0.5">{nightsPerMonth} noches × S/ {nightlyRate}</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D5]">
                  <span className="text-[10px] font-bold uppercase text-[#786F66]">Costo Operativo (25%)</span>
                  <p className="font-display text-2xl font-bold text-[#786F66] mt-1">- S/ {operationalCost.toLocaleString("es-PE")}</p>
                  <p className="text-[10px] text-[#786F66] mt-0.5">Limpieza, conserjería y gestión</p>
                </div>
              </div>

              {/* Resultado Destacado */}
              <div className="mt-6 p-6 rounded-2xl bg-[#FAF8F5] border-2 border-[#4E6646]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E6646]">Ingreso Neto Libre para Ti</span>
                  <p className="font-display text-3xl font-bold text-[#4E6646]">S/ {netMonthlyIncome.toLocaleString("es-PE")} <span className="text-xs font-sans text-[#786F66]">/ mes</span></p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold uppercase text-[#786F66]">Proyección Anual Neta</span>
                  <p className="font-display text-2xl font-bold text-[#1C1612]">S/ {annualNetReturn.toLocaleString("es-PE")} <span className="text-xs font-sans text-[#786F66]">/ año</span></p>
                </div>
              </div>

              {/* Cobertura de Cuota */}
              <div className="mt-6 pt-6 border-t border-[#E8E1D5] flex items-center justify-between text-xs">
                <span className="text-[#786F66]">Cuota mensual estimada lote + domo:</span>
                <span className="font-bold text-[#1C1612]">~S/ {estimatedLotInstallment.toLocaleString("es-PE")} / mes</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs font-bold text-[#A84F36]">
                <span>Superávit mensual en bolsillo:</span>
                <span>{monthlyCashflow >= 0 ? `+ S/ ${monthlyCashflow.toLocaleString("es-PE")} / mes (El lote se paga solo)` : `- S/ ${Math.abs(monthlyCashflow).toLocaleString("es-PE")} / mes`}</span>
              </div>
            </div>

            <p className="mt-8 text-[10px] text-[#786F66] leading-relaxed border-t border-[#E8E1D5] pt-4">
              * Estimaciones comerciales basadas en tarifas promedio de glamping en Paracas/Ica. No constituyen garantía de rentabilidad fija; los ingresos reales dependen de la temporada, la gestión y el calendario que el propietario decida abrir.
            </p>
          </div>

        </div>

        {/* ── CUADRO COMPARATIVO: GLAMPING PARACAS VS. DEPARTAMENTO EN LIMA ── */}
        <div className="mt-12 rounded-3xl border border-[#C5A059]/40 bg-white p-7 sm:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-[#E8E1D5] pb-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#4E6646]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4E6646]">
                <Sparkles className="h-3 w-3" /> Comparativa de Inversión Inmobiliaria
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1C1612] mt-2">
                ¿Por qué un Domo en Paracas rinde hasta 3x más que un departamento en Lima?
              </h3>
            </div>
            <span className="text-xs text-[#786F66]">Datos referenciales de mercado Lima vs. Paracas 2026</span>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opción 1: Moon Paracas (Glamping Suite) */}
            <div className="rounded-2xl border-2 border-[#4E6646]/40 bg-[#FAF8F5] p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#4E6646] text-white text-[9px] font-bold uppercase px-3.5 py-1 rounded-bl-xl tracking-wider">
                Mayor Rentabilidad
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2 rounded-xl bg-[#4E6646]/10 text-[#4E6646]">
                    <Palmtree className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-[#1C1612]">Moon Paracas · Glamping Suite</h4>
                    <span className="text-[10px] text-[#4E6646] font-bold uppercase">Lote 120 m² + Domo Ø8m equipado</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-xs border-t border-[#E8E1D5] pt-4">
                  <div className="flex justify-between">
                    <span className="text-[#786F66]">Inversión Total de Entrada:</span>
                    <strong className="text-[#161311]">~$28,000 - $35,000 USD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#786F66]">Renta Neta Mensual Proyectada:</span>
                    <strong className="text-[#4E6646]">~S/ 2,520 / mes ($672 USD)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#786F66]">Rentabilidad Anual Neta (ROI):</span>
                    <strong className="text-[#4E6646] font-display text-base">14.5% - 18.2% anual en USD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#786F66]">Plazo de Recuperación (Payback):</span>
                    <strong className="text-[#161311]">~4.5 a 5.5 años</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#786F66]">Uso Personal Recreativo:</span>
                    <strong className="text-[#4E6646]">¡Ilimitado! Cuando tú decidas viajar</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Opción 2: Departamento Tradicional en Lima */}
            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2 rounded-xl bg-[#786F66]/10 text-[#786F66]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-[#1C1612]">Departamento 1D en Lima</h4>
                    <span className="text-[10px] text-[#786F66] font-bold uppercase">Surco / Miraflores (45 m²)</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-xs border-t border-[#E8E1D5] pt-4">
                  <div className="flex justify-between">
                    <span className="text-[#786F66]">Inversión Total de Entrada:</span>
                    <strong className="text-[#161311]">~$110,000 - $145,000 USD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#786F66]">Renta Neta Mensual Tradicional:</span>
                    <strong className="text-[#786F66]">~S/ 2,200 / mes ($585 USD)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#786F66]">Rentabilidad Anual Neta (ROI):</span>
                    <strong className="text-[#786F66] font-display text-base">4.8% - 5.5% anual en PEN</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#786F66]">Plazo de Recuperación (Payback):</span>
                    <strong className="text-[#161311]">~18 a 22 años</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#786F66]">Uso Personal Recreativo:</span>
                    <strong className="text-[#786F66]">0 (Ocupado por inquilino fijo)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

