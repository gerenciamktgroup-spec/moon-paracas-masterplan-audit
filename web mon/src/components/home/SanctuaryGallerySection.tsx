import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Eye, Camera, Maximize2, X, Compass, CheckCircle2 } from "lucide-react";

interface GalleryPhoto {
  id: string;
  title: string;
  category: "domo" | "interior" | "oasis" | "obras";
  categoryLabel: string;
  src: string;
  caption: string;
  aspect?: string;
}

const HIGHLIGHT_PHOTOS: GalleryPhoto[] = [
  {
    id: "photo-01",
    title: "Domos Geodésicos al Atardecer",
    category: "domo",
    categoryLabel: "Arquitectura",
    src: "/media/gallery/Geodesic_domes_in_desert_202606170004.webp",
    caption: "Estructuras geodésicas bioclimáticas integradas armónicamente a las dunas y pampa de Paracas.",
    aspect: "col-span-1 md:col-span-2 row-span-2",
  },
  {
    id: "photo-02",
    title: "Suite Principal & Vista al Desierto",
    category: "interior",
    categoryLabel: "Interiores",
    src: "/images/paracas_dome_int_1.png",
    caption: "Cama King con vistas panorámicas, textiles de lino natural y aislamiento térmico Paracas.",
  },
  {
    id: "photo-03",
    title: "Espejo de Agua & Plunge Pool",
    category: "oasis",
    categoryLabel: "Oasis & Decks",
    src: "/media/gallery/Circular_fire_pit_reflecting_pool_202606170004.webp",
    caption: "Zona de relajación exterior con plunge pool de microcemento y fogatero en piedra caliche.",
  },
  {
    id: "photo-04",
    title: "Cielo Nocturno & Noche Estelar",
    category: "oasis",
    categoryLabel: "Experiencia",
    src: "/media/gallery/Desert_eco-village_night_reflection_202606170004.webp",
    caption: "Cielo sin contaminación lumínica para astroturismo y fogatas bajo las estrellas.",
  },
  {
    id: "photo-05",
    title: "Rincón de Lectura en Adobe Noble",
    category: "interior",
    categoryLabel: "Interiores",
    src: "/media/gallery/Adobe_reading_nook_desert_dome_202606170004.webp",
    caption: "Detalles en madera rústica, muros de tierra compactada y luz natural cenital.",
  },
  {
    id: "photo-06",
    title: "Masterplan Aéreo 3D Georreferenciado",
    category: "domo",
    categoryLabel: "Masterplan",
    src: "/images/masterplan_3d.jpg",
    caption: "Disposición de las 4 aldeas rodeando el oasis central de 20,662 m².",
    aspect: "col-span-1 md:col-span-2",
  },
  {
    id: "photo-07",
    title: "Obra Previa: Condominio Las Bahías",
    category: "obras",
    categoryLabel: "Trayectoria",
    src: "/media/experience/bahias 1.jpg",
    caption: "Desarrollo campestre ecológico consolidado en Cieneguilla con micro-redes solares.",
  },
  {
    id: "photo-08",
    title: "Obra Previa: Mar y Bosques",
    category: "obras",
    categoryLabel: "Trayectoria",
    src: "/media/experience/mar y bosques .jpg",
    caption: "Comunidad costera entregada y habitada con pórtico monumental de seguridad.",
  },
];

export const SanctuaryGallerySection: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "domo" | "interior" | "oasis" | "obras">("all");
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  const filteredPhotos = selectedFilter === "all"
    ? HIGHLIGHT_PHOTOS
    : HIGHLIGHT_PHOTOS.filter((p) => p.category === selectedFilter);

  return (
    <section className="bg-[#FAF7F2] py-20 md:py-28 text-[#161311] border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        
        {/* Encabezado Editorial */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-[#E8E1D5] pb-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">
              <Camera className="h-3.5 w-3.5 text-[#C5A059]" />
              Archivo Visual & Materiales · Colección Moon Paracas
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#161311]">
              La estética del santuario.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#786F66] max-w-2xl">
              Fotografías, renders hiperrealistas de arquitectura bioclimática y antecedentes constructivos de nuestros proyectos consolidados.
            </p>
          </div>

          <Link
            to="/galeria"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#161311] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-[#C85B3E]"
          >
            <span>Ver Lookbook Completo (320+ Piezas)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Filtros de Categoría */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            { id: "all", label: "Todas las Fotografías" },
            { id: "domo", label: "Arquitectura & Domos" },
            { id: "interior", label: "Interiores & Suite" },
            { id: "oasis", label: "Oasis, Fuego & Estrellas" },
            { id: "obras", label: "Obras Previas Entregadas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                selectedFilter === tab.id
                  ? "bg-[#C85B3E] text-white shadow-sm"
                  : "bg-white border border-[#E8E1D5] text-[#786F66] hover:text-[#161311]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grilla Editorial Masonry/Mosaic */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[240px]">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className={`group relative overflow-hidden rounded-3xl border border-[#E8E1D5] bg-[#E8E1D5]/40 shadow-xs transition hover:shadow-xl cursor-pointer ${
                photo.aspect || "col-span-1 row-span-1"
              }`}
            >
              <img
                src={photo.src}
                alt={photo.title}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 transition duration-300 group-hover:opacity-100" />

              {/* Botón Lupa en hover */}
              <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 transition duration-300 group-hover:opacity-100">
                <Maximize2 className="h-4 w-4" />
              </div>

              {/* Textos y Badges */}
              <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                <span className="inline-block rounded-full bg-[#C5A059]/40 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#FAF7F2] mb-1.5">
                  {photo.categoryLabel}
                </span>
                <h4 className="font-display text-base sm:text-lg font-bold leading-snug">
                  {photo.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-[11px] text-[#FAF7F2]/80 leading-relaxed font-light">
                  {photo.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Lightbox */}
        {activePhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setActivePhoto(null)}
          >
            <div
              className="relative max-w-4xl w-full rounded-3xl overflow-hidden bg-[#161311] border border-white/20 text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="max-h-[70vh] overflow-hidden flex items-center justify-center bg-black">
                <img
                  src={activePhoto.src}
                  alt={activePhoto.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
              </div>

              <div className="p-6 bg-[#161311] border-t border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">
                  {activePhoto.categoryLabel}
                </span>
                <h3 className="font-display text-2xl font-bold mt-1 text-white">
                  {activePhoto.title}
                </h3>
                <p className="mt-2 text-xs text-[#FAF7F2]/80 leading-relaxed">
                  {activePhoto.caption}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
