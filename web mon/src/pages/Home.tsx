import React from "react";
import { PurchaseProcessSection } from "../components/home/ConversionSections";
import {
  AvailabilitySection,
  FaqSection,
  LocationAndTrustSection,
  MobileActionBar,
} from "../components/home/DecisionSections";
import { ExperienceSection, VisionSection } from "../components/home/ExperienceSections";
import { FinancingSection } from "../components/home/FinancingSection";
import { LotTypesSection, MasterplanSection } from "../components/home/MasterplanSection";
import { DomeSystemSection, EnvironmentalSystemsSection } from "../components/home/ProductTechnologySections";
import { ProjectHero } from "../components/home/ProjectHero";
import { IntentPathSection } from "../components/home/IntentPathSection";
import { TypologyComparator } from "../components/home/TypologyComparator";
import { Lot } from "../types/map";

type HomeProps = {
  lots: Lot[];
  domeLots: Lot[];
};

export const Home: React.FC<HomeProps> = ({ lots, domeLots }) => (
  <div className="relative bg-[#f2f0e9] pb-24 text-[#18353b] md:pb-0">
    <ProjectHero />
    <IntentPathSection />
    <VisionSection />
    <MasterplanSection />
    <LotTypesSection />
    <TypologyComparator />
    <DomeSystemSection />
    <ExperienceSection />
    <EnvironmentalSystemsSection />
    <AvailabilitySection lots={lots} domeLots={domeLots} />
    <FinancingSection />
    <LocationAndTrustSection />
    <PurchaseProcessSection />
    <FaqSection />
    <MobileActionBar />
  </div>
);
