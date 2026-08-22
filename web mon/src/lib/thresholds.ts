export type Threshold = {
  id: "tierra" | "cielo" | "materia" | "ritual" | "expediente";
  roman: string;
  name: string;
  line: string;
  text: string;
  href: string;
  cta: string;
  image: string;
  imageAvif?: string;
  alt: string;
};

export const THRESHOLDS: Threshold[] = [
  {
    id: "tierra",
    roman: "I",
    name: "Tierra",
    line: "Llegar a la pampa.",
    text: "Grava, agave y cerros bajos. Horizonte continuo sobre pampa inland.",
    href: "#vision",
    cta: "Cruzar Tierra",
    image: "/media/hero-poster-desktop.webp",
    imageAvif: "/media/hero-poster-desktop.avif",
    alt: "Pampa inland de Moon Paracas a plena luz",
  },
  {
    id: "cielo",
    roman: "II",
    name: "Cielo",
    line: "El día se entrega a la noche.",
    text: "El mismo predio, otra temperatura. El acto Cielo es astronomía, fuego bajo y silencio.",
    href: "/cielo",
    cta: "Entrar al ritual",
    image: "/media/stargazing_deck_night.png",
    imageAvif: "/media/stargazing_deck_night.avif",
    alt: "Deck de observación bajo el cielo nocturno de Paracas",
  },
  {
    id: "materia",
    roman: "III",
    name: "Materia",
    line: "Tocar barro, lino, bronce.",
    text: "Cinco capítulos táctiles del lookbook. Cada pieza es referencial; el contrato define el alcance.",
    href: "/galeria",
    cta: "Abrir el lookbook",
    image: "/media/gallery/Adobe_walls_holding_ceramic_vessels_202606170004.webp",
    alt: "Muros de adobe y cerámica artesanal",
  },
  {
    id: "ritual",
    roman: "IV",
    name: "Ritual",
    line: "Habitar el domo.",
    text: "Founder 50 y Comfort 50. Llegar, dormir, volver — o quedarse y cerrar el viento.",
    href: "/paracas-dome",
    cta: "Entrar al domo",
    image: "/media/interior_dome_sunrise.png",
    imageAvif: "/media/interior_dome_sunrise.avif",
    alt: "Interior del domo al amanecer sobre la pampa",
  },
  {
    id: "expediente",
    roman: "V",
    name: "Expediente",
    line: "Decidir con evidencia.",
    text: "La bóveda muestra qué hay en guía, qué se pide vigente y qué aún no se ha depositado.",
    href: "/documentos",
    cta: "Abrir la bóveda",
    image: "/images/masterplan-v4-commercial.png",
    alt: "Plano comercial V4 de Moon Paracas",
  },
];
