import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";

const experienceImages = [
  {
    src: "/media/gallery/Sunrise_from_bed_desert_202606170004.mp4",
    alt: "Amanecer desde el interior del domo sobre la pampa",
    label: "Despertar",
    type: "video" as const,
    className: "md:col-span-2 md:row-span-2",
  },
  {
    src: "/media/gallery/Fire_crackles_in_stone_pit_202606170004.mp4",
    alt: "Fogón de piedra en la pampa inland",
    label: "Fogón",
    type: "video" as const,
    className: "md:col-span-2",
  },
  {
    src: "/media/stargazing_deck_night.png",
    avif: "/media/stargazing_deck_night.avif",
    alt: "Deck privado de observación astronómica bajo el cielo de Paracas",
    label: "Noches sin ruido",
    type: "image" as const,
    className: "md:col-span-1",
  },
  {
    src: "/media/gallery/Walking_down_sandy_road_at_202606170004.mp4",
    alt: "Camino de tierra compacta entre agaves y adobe",
    label: "El camino",
    type: "video" as const,
    className: "md:col-span-1",
  },
  {
    src: "/media/gallery/Adobe_house_with_solar_panels_202606170004.webp",
    alt: "Arquitectura de adobe y paneles solares integrada al paisaje árido",
    label: "Autonomía solar",
    type: "image" as const,
    className: "md:col-span-4",
  },
];

export function VisionSection() {
  return (
  <section id="vision" className="relative scroll-mt-24 overflow-hidden bg-[#FAF8F5] py-20 md:py-28">
    <div className="pointer-events-none absolute -left-36 top-24 h-72 w-72 rounded-full border border-[#1C1612]/6" aria-hidden="true" />
    <div className="relative mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-12">
      <div>
        <SectionHeading
          eyebrow="I · Tierra"
          title="Hay lugares que no se compran. Se eligen para volver a uno mismo."
          description="Un refugio sin cercos. Arquitectura que toca la tierra con ligereza. Una comunidad que comparte el mismo respeto por el paisaje."
        />
        <blockquote className="moon-lede mt-8 max-w-xl border-l-2 border-[#C85B3E] pl-5 text-[#3D352E]">
          “El verdadero lujo aquí es tener horizonte, silencio y tiempo.”
        </blockquote>
        <div className="mt-9 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-[#1C1612]/15 pt-7">
          {[
            ["50 m²", "Domo geodésico"],
            ["Solar", "Energía autónoma"],
            ["Sin cercos", "Paisaje continuo"],
            ["Paracas", "Ica, Perú"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-display text-2xl font-semibold text-[#1C1612]">{value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#737b72]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 lg:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65 }}
          className="group relative col-span-12 min-h-[340px] overflow-hidden rounded-lg shadow-[0_24px_60px_rgba(24,53,59,0.13)] sm:col-span-8 sm:min-h-[520px]"
        >
          <img
            src="/images/domo_ext_1.png"
            alt="Domo Moon Paracas con paneles solares y jardín xerófilo"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,22,22,0.72),transparent_45%)]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-6">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f0b08c]">Arquitectura orgánica</p>
              <p className="mt-2 font-display text-2xl font-semibold">Domo, sombra y paisaje seco</p>
            </div>
            <span className="rounded-full border border-white/22 bg-black/20 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm">Referencia</span>
          </div>
        </motion.div>
        <div className="col-span-12 grid grid-cols-2 gap-3 sm:col-span-4 sm:flex sm:flex-col sm:pt-10">
          {[
            ["/media/gallery/Adobe_walls_holding_ceramic_vessels_202606170004.webp", "Muros de adobe y cerámica artesanal", "Materia"],
            ["/media/gallery/Baskets_holding_throws_in_dome_202606170004_2.webp", "Cestas tejidas y textiles naturales en el interior del domo", "Textura"],
          ].map(([src, alt, label], index) => (
            <figure key={src} className="group relative flex-1 overflow-hidden rounded-lg shadow-[0_18px_45px_rgba(24,53,59,0.1)]">
              <img src={src} alt={alt} className={`h-full min-h-[180px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:min-h-[230px] ${index === 0 ? "object-center" : "object-[55%_center]"}`} loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,22,22,0.58),transparent_55%)]" />
              <figcaption className="absolute bottom-0 left-0 p-4 text-[9px] font-bold uppercase tracking-[0.16em] text-white">{label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
}

export const ExperienceSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((activeIndex + 1) % experienceImages.length);
      if (event.key === "ArrowLeft") setActiveIndex((activeIndex - 1 + experienceImages.length) % experienceImages.length);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex]);

  const move = (direction: number) => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + direction + experienceImages.length) % experienceImages.length);
  };

  return (
    <section id="experiencia" className="scroll-mt-24 bg-transparent py-20 text-[#1C1612] md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="III · Materia"
            title="La luz cambia. El cuerpo baja el ritmo."
            description="Piedra, adobe, lino, fuego y cielo. El mismo paisaje, respirando."
          />
          <p className="max-w-sm text-xs leading-6 text-[#786F66]">
            Elige una pieza. Algunas respiran solas.
          </p>
        </div>

        <div className="mt-12 grid auto-rows-[220px] grid-cols-1 gap-3 md:grid-cols-4">
          {experienceImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`group relative overflow-hidden rounded-md text-left focus:outline-none focus:ring-2 focus:ring-[#f0b08c] ${image.className}`}
              aria-label={`Ampliar: ${image.label}`}
            >
              {image.type === "video" ? (
                <video
                  src={image.src}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <picture>
                  {"avif" in image && image.avif ? <source type="image/avif" srcSet={image.avif} /> : null}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </picture>
              )}
              <span className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,16,14,0.75)_0%,transparent_55%)]" />
              <span className="absolute bottom-0 left-0 p-5 font-display text-xl font-semibold text-white">{image.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#081111]/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={experienceImages[activeIndex].label}
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Cerrar galería"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              move(-1);
            }}
            className="absolute left-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-8"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <figure className="max-w-6xl" onClick={(event) => event.stopPropagation()}>
            {experienceImages[activeIndex].type === "video" ? (
              <video
                src={experienceImages[activeIndex].src}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[80vh] max-w-full rounded-md object-contain"
              />
            ) : (
              <img
                src={experienceImages[activeIndex].src}
                alt={experienceImages[activeIndex].alt}
                className="max-h-[80vh] max-w-full rounded-md object-contain"
              />
            )}
            <figcaption className="mt-4 text-center font-display text-xl text-white">
              {experienceImages[activeIndex].label}
            </figcaption>
          </figure>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              move(1);
            }}
            className="absolute right-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-8"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </section>
  );
};
