import React, { useState } from "react";
import { PurchaseProcessSection } from "../components/home/ConversionSections";
import {
  FaqSection,
  LocationAndTrustSection,
  MobileActionBar,
} from "../components/home/DecisionSections";
import { FinancingSection } from "../components/home/FinancingSection";
import { LotTypesSection, MasterplanSection } from "../components/home/MasterplanSection";
import { ProjectHero } from "../components/home/ProjectHero";
import { IntentPathSection } from "../components/home/IntentPathSection";
import { DomeBlueprintSection } from "../components/home/DomeBlueprintSection";
import { AirbnbRoiCalculator } from "../components/home/AirbnbRoiCalculator";
import { ClimateEngineeringSection } from "../components/home/ClimateEngineeringSection";
import { LegalAssociationSection } from "../components/home/LegalAssociationSection";
import { DossierModal } from "../components/home/DossierModal";
import { ShowroomVisitModal } from "../components/home/ShowroomVisitModal";
import { Lot } from "../types/map";
import { Download, Calendar, Sparkles, MessageCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { whatsappHref } from "../config/project";

type HomeProps = {
  lots: Lot[];
  domeLots: Lot[];
  onOpenDossier?: () => void;
  onOpenShowroom?: () => void;
};

export const Home: React.FC<HomeProps> = () => {
  const [dossierOpen, setDossierOpen] = useState(false);
  const [showroomOpen, setShowroomOpen] = useState(false);

  return (
    <div className="relative bg-[#FAF7F2] pb-24 text-[#161311] md:pb-0 font-sans">
      
      {/* 1. Hero Emocional & Precios de Lanzamiento ($120/m² - 120m² y 240m²) */}
      <ProjectHero 
        onOpenDossier={() => setDossierOpen(true)}
        onOpenShowroom={() => setShowroomOpen(true)}
      />

      {/* 2. Ruta y Filtro de Intención */}
      <IntentPathSection />

      {/* 3. Ficha Técnica & Blueprint Acotado del Domo Ø8m (50 m²) */}
      <DomeBlueprintSection />

      {/* 4. Masterplan Interactivo de Aldeas & Oasis de 5,000 m² */}
      <MasterplanSection />
      <LotTypesSection />

      {/* 5. Simulador de Negocio Glamping / Airbnb en Paracas + Comparativa con Lima */}
      <AirbnbRoiCalculator />

      {/* 6. Arquitectura del Clima & Mitigación de Vientos Paracas */}
      <ClimateEngineeringSection />

      {/* 7. Planes de Financiamiento Directo (USD / PEN) */}
      <FinancingSection />

      {/* 8. Estructura de Asociación Sin Fines de Lucro & Reglamento Ecológico */}
      <LegalAssociationSection />

      {/* 9. Respaldo Jurídico, Coordenadas UTM y Ubicación Km 240 */}
      <LocationAndTrustSection />

      {/* ── BANNER DE CONVERSIÓN VIP: SHOWROOM EN LIMA & VISITA GUIADA ── */}
      <section className="bg-gradient-to-r from-[#161311] to-[#2B231D] py-16 text-white">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-white/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">
              <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
              Atención Exclusiva para Residentes de Lima
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white">
              ¿Deseas conocer Moon Paracas en persona?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#FAF7F2]/80 leading-relaxed">
              Organizamos visitas privadas los fines de semana al predio en Paracas (Km 240) o reuniones personalizadas en nuestro Showroom ejecutivo en San Isidro / Miraflores.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
            <button
              onClick={() => setShowroomOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-2xl bg-[#C85B3E] px-7 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-[#A84F36] transition cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-[#FAF7F2]" />
              <span>Agendar Visita o Cita Showroom</span>
            </button>
            <button
              onClick={() => setDossierOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition cursor-pointer"
            >
              <Download className="h-4 w-4 text-[#C5A059]" />
              <span>Descargar Dossier 2026</span>
            </button>
          </div>
        </div>
      </section>

      {/* 10. Proceso de Compra en 4 Pasos (Separación con S/ 1,000) */}
      <PurchaseProcessSection />

      {/* 11. Preguntas Duras & Transparencia */}
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

