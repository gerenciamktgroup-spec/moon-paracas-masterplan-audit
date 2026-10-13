import React, { useState } from "react";
import { ProjectHero } from "../components/home/ProjectHero";
import { MasterplanSection } from "../components/home/MasterplanSection";
import { DomeBlueprintSection } from "../components/home/DomeBlueprintSection";
import { SanctuaryGallerySection } from "../components/home/SanctuaryGallerySection";
import { AirbnbRoiCalculator } from "../components/home/AirbnbRoiCalculator";
import { FinancingSection } from "../components/home/FinancingSection";
import { LegalAssociationSection } from "../components/home/LegalAssociationSection";
import { PurchaseProcessSection } from "../components/home/ConversionSections";
import { FaqSection, MobileActionBar } from "../components/home/DecisionSections";
import { DossierModal } from "../components/home/DossierModal";
import { ShowroomVisitModal } from "../components/home/ShowroomVisitModal";
import { Lot } from "../types/map";
import { Download, Calendar, Sparkles } from "lucide-react";

type HomeProps = {
  lots: Lot[];
  domeLots: Lot[];
  onOpenDossier?: () => void;
  onOpenShowroom?: () => void;
};

export const Home: React.FC<HomeProps> = ({ lots }) => {
  const [dossierOpen, setDossierOpen] = useState(false);
  const [showroomOpen, setShowroomOpen] = useState(false);

  return (
    <div className="relative bg-[#FAF7F2] pb-24 text-[#161311] md:pb-0 font-sans selection:bg-[#C85B3E] selection:text-white">
      
      {/* 1. Hero Emocional & Precios de Lanzamiento ($120/m² - 120m² y 240m²) */}
      <ProjectHero 
        onOpenDossier={() => setDossierOpen(true)}
        onOpenShowroom={() => setShowroomOpen(true)}
      />

      {/* 2. Masterplan Interactivo de Aldeas & Tipologías de Lote */}
      <MasterplanSection lots={lots} />

      {/* 3. Arquitectura del Domo Ø8m & Bioclimática (Plano, Viento Paracas, Materiales) */}
      <DomeBlueprintSection />

      {/* 4. Archivo Visual & Colección de Fotos del Santuario */}
      <SanctuaryGallerySection />

      {/* 5. Simulador de Rentabilidad Airbnb en Paracas + Comparativa con Lima */}
      <AirbnbRoiCalculator />

      {/* 5. Calculadora de Financiamiento Directo (Hasta 36 cuotas) */}
      <FinancingSection />

      {/* 6. Seguridad Jurídica (Asociación, Adjudicación Notarial, Coordenadas UTM) */}
      <LegalAssociationSection />

      {/* ── BANNER VIP: SHOWROOM EN LIMA & VISITAS GUIADAS ── */}
      <section className="bg-[#161311] py-20 text-white border-b border-[#2B231D]">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-white/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">
              <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
              Atención Personalizada en Lima & Paracas
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white">
              ¿Deseas conocer Moon Paracas en persona?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#FAF7F2]/80 leading-relaxed">
              Organizamos visitas guiadas privadas los fines de semana al predio en Paracas (Km 240) o reuniones ejecutivas en nuestro Showroom en San Isidro / Miraflores.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-center lg:justify-end w-full lg:w-auto">
            <button
              onClick={() => setShowroomOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#C85B3E] px-7 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-[#A84F36] transition cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-[#FAF7F2]" />
              <span>Agendar Visita o Cita Showroom</span>
            </button>
            <button
              onClick={() => setDossierOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition cursor-pointer"
            >
              <Download className="h-4 w-4 text-[#C5A059]" />
              <span>Descargar Dossier 2026</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7. Proceso de Compra Bancarizado (4 Pasos) */}
      <PurchaseProcessSection />

      {/* 8. Preguntas Frecuentes Clave */}
      <FaqSection />

      {/* Barra de Conversión Móvil */}
      <MobileActionBar />

      {/* Modales Interactivos de Conversión */}
      <DossierModal 
        isOpen={dossierOpen} 
        onClose={() => setDossierOpen(false)} 
      />
      <ShowroomVisitModal 
        isOpen={showroomOpen} 
        onClose={() => setShowroomOpen(false)} 
      />
    </div>
  );
};


