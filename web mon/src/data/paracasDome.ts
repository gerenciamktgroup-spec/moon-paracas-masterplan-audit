export type ProjectId = "moon-paracas" | "paracas-dome";
export type LotStatus = "available" | "reserved" | "sold" | "blocked";
export type OfferId = "founder-50" | "comfort-50";

export type CommercialOffer = {
  id: OfferId;
  projectId: "paracas-dome";
  name: string;
  shortName: string;
  stageLabel: string;
  publicPrice: number;
  areaM2: number;
  domeAreaM2: number;
  recommendedFor: string;
  summary: string;
  includes: string[];
  excludes: string[];
  internalCosts: {
    possessorPayment: number;
    domeBase: number;
    freightInstallAdjustment: number;
    thermalInsulation?: number;
    hardDoor?: number;
    minorAdjustments?: number;
    legalDocumentation: number;
    marketingSales: number;
    lightWorks: number;
    contingency: number;
  };
};

export type AddOn = {
  id: string;
  projectId: "paracas-dome";
  name: string;
  category: "comfort" | "structure" | "energy" | "water" | "furniture" | "landscape" | "rental-ready";
  supplierType: "provider" | "moon-own" | "third-party";
  internalCostMin?: number;
  internalCostMax?: number;
  internalCostFixed?: number;
  publicPriceMin?: number;
  publicPriceMax?: number;
  publicPriceFixed: number;
  description: string;
  isPublic: boolean;
  isRecommendedForParacas: boolean;
};

export type UpgradePackage = {
  id: string;
  name: string;
  description: string;
  addOnIds: string[];
};

export const PARACAS_DOME_PROJECT = {
  id: "paracas-dome" as const,
  name: "Paracas Dome",
  brandName: "MOON PARACAS",
  totalAreaM2: 150000,
  lotCount: 50,
  lotAreaM2: 2000,
  openAreaM2: 50000,
  defaultCurrency: "PEN" as const,
  possessorPaymentPerAssignedM2: 5,
  description:
    "Comunidad de baja densidad con lotes amplios, domo geodésico instalado y acceso a beneficios Moon Club."
};

export const PARACAS_DOME_FINANCING_RULES = {
  reservation: 1000,
  minDownPaymentPercent: 50,
  maxInstallments: 18,
  flatInterestPercent: 0
};

export const PARACAS_DOME_OFFERS: CommercialOffer[] = [
  {
    id: "founder-50",
    projectId: "paracas-dome",
    name: "Paracas Dome Founder 50",
    shortName: "Founder 50",
    stageLabel: "Fundadores",
    publicPrice: 70000,
    areaM2: 2000,
    domeAreaM2: 50,
    recommendedFor: "Fundadores, compradores patrimoniales y primera etapa.",
    summary: "Entrada fundadora con domo base instalado y acceso a beneficios Moon Club.",
    includes: [
      "Área interna asignada de 2,000 m2",
      "Domo geodésico base de 50 m2",
      "Cobertura PVC UV, ignífuga y antibacterial",
      "Puerta PVC estándar",
      "Ventanas triangulares básicas",
      "Malla mosquitera",
      "Preparación básica del punto de instalación",
      "Anclaje básico reforzado",
      "Señalética de lote",
      "Acceso a beneficios Moon Club",
      "Derecho a elegir upgrades"
    ],
    excludes: [
      "Aislamiento térmico",
      "Puerta rígida premium",
      "Ventanal panorámico",
      "Baño interior",
      "Kitchenette",
      "Mobiliario hotelero",
      "Sistema solar completo",
      "Cisterna",
      "Deck grande",
      "Rental pool hotelero"
    ],
    internalCosts: {
      possessorPayment: 10000,
      domeBase: 27100,
      freightInstallAdjustment: 3500,
      legalDocumentation: 3000,
      marketingSales: 3000,
      lightWorks: 6000,
      contingency: 2000
    }
  },
  {
    id: "comfort-50",
    projectId: "paracas-dome",
    name: "Paracas Dome Comfort 50",
    shortName: "Comfort 50",
    stageLabel: "Confort",
    publicPrice: 89000,
    areaM2: 2000,
    domeAreaM2: 50,
    recommendedFor: "Uso familiar frecuente y mejor confort en clima de Paracas.",
    summary: "Domo base con mejoras de aislamiento, puerta rígida y confort de uso frecuente.",
    includes: [
      "Área interna asignada de 2,000 m2",
      "Domo geodésico base de 50 m2",
      "Cobertura PVC UV, ignífuga y antibacterial",
      "Aislamiento térmico costa / desierto",
      "Puerta rígida de madera o aluminio básica",
      "Mejor cierre frente a viento y arena",
      "Preparación básica del punto de instalación",
      "Anclaje básico reforzado",
      "Señalética de lote",
      "Acceso a beneficios Moon Club"
    ],
    excludes: [
      "Ventanal panorámico",
      "Baño interior",
      "Kitchenette",
      "Mobiliario hotelero",
      "Sistema solar completo",
      "Cisterna",
      "Deck grande",
      "Rental pool hotelero"
    ],
    internalCosts: {
      possessorPayment: 10000,
      domeBase: 27100,
      freightInstallAdjustment: 3500,
      thermalInsulation: 9700,
      hardDoor: 4200,
      minorAdjustments: 1500,
      legalDocumentation: 3000,
      marketingSales: 3000,
      lightWorks: 6000,
      contingency: 2000
    }
  }
];

export const PARACAS_DOME_ADD_ONS: AddOn[] = [
  {
    id: "ADD-THERMAL-40",
    projectId: "paracas-dome",
    name: "Aislamiento térmico costa/desierto 40%",
    category: "comfort",
    supplierType: "provider",
    internalCostFixed: 9700,
    publicPriceFixed: 13900,
    description: "Mejora el confort interior frente a calor, frío nocturno y viento costero.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-THERMAL-85",
    projectId: "paracas-dome",
    name: "Aislamiento térmico reforzado 85%",
    category: "comfort",
    supplierType: "provider",
    internalCostFixed: 11250,
    publicPriceFixed: 15900,
    description: "Aislamiento reforzado para uso frecuente y mejor respuesta térmica.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-DOOR-WOOD",
    projectId: "paracas-dome",
    name: "Puerta rígida madera sólida",
    category: "structure",
    supplierType: "provider",
    internalCostFixed: 4200,
    publicPriceFixed: 6900,
    description: "Acceso más robusto y mejor sensación residencial frente a puerta PVC estándar.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-DOOR-ALU",
    projectId: "paracas-dome",
    name: "Puerta aluminio + vidrio templado",
    category: "structure",
    supplierType: "provider",
    internalCostFixed: 5460,
    publicPriceFixed: 8900,
    description: "Puerta de mayor durabilidad con lectura más premium y luminosa.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-PANORAMIC",
    projectId: "paracas-dome",
    name: "Ventanal panorámico",
    category: "structure",
    supplierType: "provider",
    internalCostFixed: 12500,
    publicPriceFixed: 18900,
    description: "Apertura escénica para sunset, vistas amplias y producto rental-ready.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-PARTITION",
    projectId: "paracas-dome",
    name: "Tabiquería interna baño/ambiente",
    category: "structure",
    supplierType: "provider",
    internalCostFixed: 5900,
    publicPriceFixed: 8900,
    description: "Separación interior para mejorar privacidad y preparación de ambientes.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-DECK-S",
    projectId: "paracas-dome",
    name: "Deck rústico exterior básico",
    category: "landscape",
    supplierType: "moon-own",
    internalCostMin: 4000,
    internalCostMax: 6500,
    publicPriceMin: 9900,
    publicPriceMax: 14900,
    publicPriceFixed: 12900,
    description: "Plataforma exterior para sombra, descanso, fogata social y fotografía comercial.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-SOLAR-BASIC",
    projectId: "paracas-dome",
    name: "Kit solar básico",
    category: "energy",
    supplierType: "third-party",
    internalCostMin: 1800,
    internalCostMax: 2500,
    publicPriceFixed: 4900,
    description: "Energía básica para iluminación y carga de dispositivos.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-SOLAR-COMFORT",
    projectId: "paracas-dome",
    name: "Kit solar comfort",
    category: "energy",
    supplierType: "third-party",
    internalCostMin: 4500,
    internalCostMax: 7500,
    publicPriceMin: 9900,
    publicPriceMax: 14900,
    publicPriceFixed: 12900,
    description: "Mayor autonomía para estadías frecuentes y equipamiento hotelero ligero.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-DRY-BATH",
    projectId: "paracas-dome",
    name: "Baño seco exterior",
    category: "water",
    supplierType: "moon-own",
    internalCostMin: 2500,
    internalCostMax: 4500,
    publicPriceMin: 6900,
    publicPriceMax: 9900,
    publicPriceFixed: 8900,
    description: "Solución sanitaria de bajo consumo, alineada al uso off-grid del proyecto.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-WATER-1000",
    projectId: "paracas-dome",
    name: "Cisterna 1,000 L instalada",
    category: "water",
    supplierType: "third-party",
    internalCostMin: 1500,
    internalCostMax: 3000,
    publicPriceMin: 4900,
    publicPriceMax: 6900,
    publicPriceFixed: 5900,
    description: "Reserva de agua para uso individual con logística controlada.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-FURN-BASIC",
    projectId: "paracas-dome",
    name: "Mobiliario básico",
    category: "furniture",
    supplierType: "moon-own",
    internalCostMin: 3000,
    internalCostMax: 5000,
    publicPriceFixed: 7900,
    description: "Equipamiento inicial para uso familiar simple.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-FURN-HOTEL",
    projectId: "paracas-dome",
    name: "Mobiliario hotelero",
    category: "rental-ready",
    supplierType: "moon-own",
    internalCostMin: 8000,
    internalCostMax: 15000,
    publicPriceMin: 18900,
    publicPriceMax: 29900,
    publicPriceFixed: 24900,
    description: "Fit-out para fotografías, estadías cortas y futura operación administrada.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-FIREPIT",
    projectId: "paracas-dome",
    name: "Fogata circular exterior",
    category: "landscape",
    supplierType: "moon-own",
    internalCostMin: 800,
    internalCostMax: 1500,
    publicPriceMin: 2900,
    publicPriceMax: 4900,
    publicPriceFixed: 3900,
    description: "Elemento social de bajo impacto para uso nocturno regulado.",
    isPublic: true,
    isRecommendedForParacas: true
  },
  {
    id: "ADD-LANDSCAPE",
    projectId: "paracas-dome",
    name: "Paisajismo seco / pircas bajas",
    category: "landscape",
    supplierType: "moon-own",
    internalCostMin: 1000,
    internalCostMax: 1500,
    publicPriceMin: 3900,
    publicPriceMax: 5900,
    publicPriceFixed: 4900,
    description: "Cactus, agaves, piedra y separaciones bajas sin cerrar la visual del desierto.",
    isPublic: true,
    isRecommendedForParacas: true
  }
];

export const PARACAS_DOME_UPGRADE_PACKAGES: UpgradePackage[] = [
  {
    id: "comfort-upgrade",
    name: "Pack Comfort Upgrade",
    description: "Para clientes Founder que quieran mejorar su domo.",
    addOnIds: ["ADD-THERMAL-40", "ADD-DOOR-WOOD"]
  },
  {
    id: "sunset",
    name: "Pack Sunset",
    description: "Mejor vista, confort térmico y estancia exterior.",
    addOnIds: ["ADD-THERMAL-40", "ADD-PANORAMIC", "ADD-DECK-S"]
  },
  {
    id: "rental-ready",
    name: "Pack Rental Ready",
    description: "Configuración pensada para futura operación administrada, sin prometer renta garantizada.",
    addOnIds: [
      "ADD-THERMAL-40",
      "ADD-DOOR-WOOD",
      "ADD-PANORAMIC",
      "ADD-DRY-BATH",
      "ADD-SOLAR-COMFORT",
      "ADD-FURN-HOTEL",
      "ADD-DECK-S"
    ]
  }
];

export const PARACAS_DOME_LEGAL_DISCLOSURES = [
  "Las imágenes, renders, planos y descripciones son referenciales y representan la visión del proyecto. Las áreas, trazados, acabados, equipamientos y cronogramas pueden variar por criterios técnicos, permisos, costos, proveedores, decisiones internas y desarrollo progresivo.",
  "La incorporación al proyecto se estructura mediante una asociación o entidad administradora con asignación interna de área de uso exclusivo. No debe interpretarse como entrega inmediata de partida registral individual independizada, salvo que un documento específico lo indique expresamente.",
  "Los servicios, obras, accesos y beneficios se ejecutan de manera progresiva, conforme a caja disponible, validación técnica, permisos y acuerdos internos.",
  "La disponibilidad de lotes, precios y condiciones puede variar por etapa comercial."
];

export const PARACAS_DOME_DELIVERY_MILESTONES = [
  { label: "Reserva S/ 1,000", action: "Bloqueo temporal del lote" },
  { label: "Inicial 50%", action: "Firma, asignación interna y expediente" },
  { label: "70% pagado", action: "Compra o fabricación del domo" },
  { label: "85% pagado", action: "Instalación del domo" },
  { label: "100% pagado", action: "Entrega operativa completa" }
];

export const formatPen = (value: number): string =>
  `S/ ${value.toLocaleString("es-PE", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })}`;

export function getOfferById(offerId: OfferId): CommercialOffer {
  return PARACAS_DOME_OFFERS.find((offer) => offer.id === offerId) ?? PARACAS_DOME_OFFERS[0];
}

export function getAddOnPublicPrice(addOn: AddOn): number {
  return addOn.publicPriceFixed;
}

export function getAddOnInternalCost(addOn: AddOn): number {
  if (typeof addOn.internalCostFixed === "number") return addOn.internalCostFixed;
  if (typeof addOn.internalCostMin === "number" && typeof addOn.internalCostMax === "number") {
    return Math.round((addOn.internalCostMin + addOn.internalCostMax) / 2);
  }
  return 0;
}

export function getPackagePublicPrice(packageId: string): number {
  const upgradePackage = PARACAS_DOME_UPGRADE_PACKAGES.find((item) => item.id === packageId);
  if (!upgradePackage) return 0;
  return upgradePackage.addOnIds.reduce((total, addOnId) => {
    const addOn = PARACAS_DOME_ADD_ONS.find((item) => item.id === addOnId);
    return total + (addOn ? getAddOnPublicPrice(addOn) : 0);
  }, 0);
}

export function calculateOfferInternalCost(offer: CommercialOffer): number {
  return Object.values(offer.internalCosts).reduce((total, value) => total + (value ?? 0), 0);
}

export function calculateOfferMargin(offer: CommercialOffer): number {
  return offer.publicPrice - calculateOfferInternalCost(offer);
}
