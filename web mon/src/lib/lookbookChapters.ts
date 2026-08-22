export type LookbookChapterId = "tierra" | "barro" | "lino" | "bronce" | "polvo";

export type GalleryItem = {
  src: string;
  category: string;
  alt: string;
  type: "image" | "video";
};

export type LookbookChapter = {
  id: LookbookChapterId;
  name: string;
  line: string;
  note: string;
};

export const LOOKBOOK_CHAPTERS: LookbookChapter[] = [
  { id: "tierra", name: "Tierra", line: "Grava. Agave. Cielo.", note: "La pampa inland, el horizonte continuo." },
  { id: "barro", name: "Barro", line: "Adobe. Sombra. Pared.", note: "Materia que guarda el calor del día." },
  { id: "lino", name: "Lino", line: "Cama. Silencio. Mañana.", note: "El interior como un umbral, no un showroom." },
  { id: "bronce", name: "Bronce", line: "Cobre. Peso. Luz.", note: "Objetos que envejecen con el polvo." },
  { id: "polvo", name: "Polvo", line: "Noche. Fuego. Estrellas.", note: "El cielo grande, el fuego bajo." },
];

const rules: Array<{ id: LookbookChapterId; keys: string[] }> = [
  { id: "lino", keys: ["linen", "fabric", "blanket", "bed", "throw", "rug", "jute", "basket", "cushion", "reading nook", "interior", "lounge chair", "butterfly"] },
  { id: "bronce", keys: ["copper", "bronze", "brass", "aluminum", "metal", "lantern", "fixture", "telescope", "binocular", "helix", "basin"] },
  { id: "polvo", keys: ["night", "star", "astronom", "constellation", "fire", "fogon", "dust", "sunset", "sunrise", "dusk", "milky", "walking_down_sandy"] },
  { id: "tierra", keys: ["agave", "cactus", "cacti", "sand", "scrub", "gravel", "desert plant", "xeriscape", "road"] },
  { id: "barro", keys: ["adobe", "clay", "ceramic", "vessel", "olla", "stone wall", "plaster", "terracotta", "doorway"] },
];

const categoryFallback: Record<string, LookbookChapterId> = {
  interiores: "lino",
  detalles: "bronce",
  amenidades: "polvo",
  paisajismo: "tierra",
  arquitectura: "barro",
};

export function chapterOf(item: GalleryItem): LookbookChapterId {
  const haystack = `${item.src} ${item.alt} ${item.category}`.toLowerCase();
  for (const rule of rules) {
    if (rule.keys.some((key) => haystack.includes(key))) return rule.id;
  }
  return categoryFallback[item.category.toLowerCase()] ?? "tierra";
}

export function chapterItems(items: GalleryItem[], chapterId: LookbookChapterId) {
  return items.filter((item) => chapterOf(item) === chapterId);
}

export function featuredItem(items: GalleryItem[]) {
  return items.find((item) => item.type === "video") ?? items[0] ?? null;
}

export function lookbookTitle(item: GalleryItem) {
  const cleaned = item.alt.replace(/[.…]+$/g, "").trim();
  return cleaned || "Pieza referencial";
}
