import React from "react";
import { EngineeringSpecs } from "../components/EngineeringSpecs";
import { ContractsAndRules } from "../components/ContractsAndRules";
import { DueDiligenceChecklist } from "../components/DueDiligenceChecklist";
import { AccessRoute } from "../components/AccessRoute";
import { Scale, ShieldAlert, ClipboardCheck, Compass } from "lucide-react";
import { InteriorHero } from "../components/InteriorHero";

export const Technical: React.FC = () => {
  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-[#FAF8F5] text-[#1C1612]">
      <InteriorHero
        eyebrow="Transparencia del proyecto"
        title={<>La información también<br /><em className="font-normal text-[#A84F36]">es parte del diseño.</em></>}
        description="Una decisión inmobiliaria requiere evidencia física, económica y jurídica. Aquí organizamos los criterios que debes contrastar con estudios, partidas y contratos vigentes antes de separar."
        index="Memoria técnica"
        aside={<p className="mt-4 font-display text-2xl leading-tight text-[#3D352E]">Cuatro capas para revisar el proyecto con método.</p>}
      />

      <div className="mx-auto max-w-[1200px] space-y-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        
        {/* Section 1: Engineering & Specs */}
        <section className="space-y-6">
          <div className="mx-auto flex max-w-4xl items-end gap-4 border-b border-[#E8E1D5] pb-5">
            <span className="font-display text-5xl font-medium text-[#bb5638]">01</span>
            <div><p className="mb-1 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#A84F36]"><ShieldAlert className="h-4 w-4" /> Evidencia física</p><h2 className="font-display text-2xl font-medium text-[#1C1612] sm:text-3xl">Parámetros de ingeniería y coexistencia</h2></div>
          </div>
          <EngineeringSpecs />
        </section>

        {/* Section 2: Contracts and bylaws */}
        <section className="space-y-6">
          <div className="mx-auto flex max-w-5xl items-end gap-4 border-b border-[#E8E1D5] pb-5">
            <span className="font-display text-5xl font-medium text-[#bb5638]">02</span>
            <div><p className="mb-1 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#A84F36]"><Scale className="h-4 w-4" /> Evidencia jurídica</p><h2 className="font-display text-2xl font-medium text-[#1C1612] sm:text-3xl">Documentos y contratos del condominio</h2></div>
          </div>
          <ContractsAndRules />
        </section>

        {/* Section 3: buyer due diligence */}
        <section className="space-y-6">
          <div className="mx-auto flex max-w-5xl items-end gap-4 border-b border-[#E8E1D5] pb-5">
            <span className="font-display text-5xl font-medium text-[#bb5638]">03</span>
            <div><p className="mb-1 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#A84F36]"><ClipboardCheck className="h-4 w-4" /> Proceso de compra</p><h2 className="font-display text-2xl font-medium text-[#1C1612] sm:text-3xl">Lista de verificación del comprador</h2></div>
          </div>
          <DueDiligenceChecklist />
        </section>

        {/* Section 4: Access Route from Panamericana Sur */}
        <section className="space-y-6">
          <div className="mx-auto flex max-w-5xl items-end gap-4 border-b border-[#E8E1D5] pb-5">
            <span className="font-display text-5xl font-medium text-[#bb5638]">04</span>
            <div><p className="mb-1 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#A84F36]"><Compass className="h-4 w-4" /> Llegada al proyecto</p><h2 className="font-display text-2xl font-medium text-[#1C1612] sm:text-3xl">Ruta de acceso desde la Panamericana Sur</h2></div>
          </div>
          <AccessRoute />
        </section>

      </div>
    </div>
  );
};
