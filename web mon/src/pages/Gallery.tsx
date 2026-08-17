import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Grid, Play, X } from "lucide-react";
import { InteriorHero } from "../components/InteriorHero";

interface GalleryItem {
  src: string;
  category: string;
  alt: string;
  type: "image" | "video";
}

const categories = ["Todos", "Arquitectura", "Interiores", "Amenidades", "Detalles", "Paisajismo"];
const pageSize = 12;
const galleryTitle = (item: GalleryItem, index: number) => `${item.category} · escena ${String(index + 1).padStart(2, "0")}`;

export const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/media/gallery-manifest.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Gallery manifest returned ${response.status}`);
        return response.json() as Promise<GalleryItem[]>;
      })
      .then((data) => setItems(data.map((item) => ({ ...item, src: item.src.replace(/\/+/g, "/") }))))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const filteredItems = useMemo(
    () => activeCategory === "Todos" ? items : items.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase()),
    [activeCategory, items],
  );

  const categoryCount = useCallback((category: string) => (
    category === "Todos" ? items.length : items.filter((item) => item.category.toLowerCase() === category.toLowerCase()).length
  ), [items]);

  const navigateLightbox = useCallback((direction: "prev" | "next") => {
    setLightboxIndex((current) => {
      if (current === null || !filteredItems.length) return current;
      if (direction === "prev") return current === 0 ? filteredItems.length - 1 : current - 1;
      return current === filteredItems.length - 1 ? 0 : current + 1;
    });
  }, [filteredItems.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft") navigateLightbox("prev");
      if (event.key === "ArrowRight") navigateLightbox("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, navigateLightbox]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setVisibleCount(pageSize);
    setLightboxIndex(null);
  };

  return (
    <div className="min-h-[90vh] bg-[#111715] text-[#E1D9C1]">
      <InteriorHero
        eyebrow="Archivo visual"
        title={<>Una mirada al<br /><em className="font-normal text-[#d5aa83]">universo Moon.</em></>}
        description="Arquitectura, interiores y paisaje reunidos para comunicar la intención del proyecto. Cada pieza es una visualización referencial; los documentos contractuales definen el alcance final."
        index="Galería del proyecto"
        aside={<><p className="mt-4 font-display text-4xl text-white">{items.length || "—"}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">Piezas catalogadas</p></>}
      />

      <section className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12" aria-label="Galería de visualizaciones">
        <div className="no-scrollbar -mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {categories.map((category) => {
            const active = activeCategory === category;
            return (
              <button
                type="button"
                key={category}
                onClick={() => handleCategoryChange(category)}
                aria-pressed={active}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[9px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  active ? "border-[#bb5638] bg-[#bb5638] text-white" : "border-white/12 text-white/55 hover:border-white/30 hover:text-white"
                }`}
              >
                {category}<span className={active ? "text-white/70" : "text-white/28"}>{categoryCount(category)}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Cargando galería">
            {Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-square animate-pulse rounded-sm border border-white/5 bg-white/[0.035]" />)}
          </div>
        ) : loadError ? (
          <div className="rounded-md border border-[#bb5638]/30 bg-[#bb5638]/8 px-6 py-16 text-center">
            <Grid className="mx-auto h-9 w-9 text-[#f0b08c]" />
            <h2 className="mt-4 font-display text-3xl text-white">La galería no está disponible por ahora</h2>
            <p className="mt-2 text-xs leading-6 text-white/48">Vuelve a intentarlo en unos minutos.</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-md border border-dashed border-white/12 py-20 text-center">
            <Grid className="mx-auto h-10 w-10 text-white/25" />
            <p className="mt-4 text-xs text-white/45">No encontramos piezas en esta categoría.</p>
          </div>
        ) : (
          <>
            <div className="grid auto-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredItems.slice(0, visibleCount).map((item, index) => {
                const featured = index % 9 === 0;
                return (
                  <button
                    type="button"
                    key={item.src}
                    onClick={() => setLightboxIndex(index)}
                    className={`group relative overflow-hidden rounded-sm border border-white/8 bg-[#0d1211] text-left shadow-[0_18px_50px_rgba(0,0,0,0.2)] transition-colors hover:border-[#d5aa83]/55 ${featured ? "aspect-square sm:col-span-2 sm:aspect-[2/1]" : "aspect-square"}`}
                    aria-label={`Ampliar ${item.alt || "visualización de Moon Paracas"}`}
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.src}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.035] group-hover:opacity-100"
                        onMouseEnter={(event) => event.currentTarget.play().catch(() => undefined)}
                        onMouseLeave={(event) => { event.currentTarget.pause(); event.currentTarget.currentTime = 0; }}
                      />
                    ) : (
                      <img src={item.src} alt={item.alt} loading="lazy" className="h-full w-full object-cover opacity-[0.88] transition duration-700 group-hover:scale-[1.035] group-hover:opacity-100" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1110]/95 via-transparent to-black/10" aria-hidden="true" />
                    {item.type === "video" && <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35"><Play className="h-3.5 w-3.5 fill-white text-white" /></span>}
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                      <div className="min-w-0">
                        <span className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#f0b08c]">Render referencial · {item.category}</span>
                        <h2 className="mt-1 truncate font-display text-xl font-medium text-white">{galleryTitle(item, index)}</h2>
                      </div>
                      <Eye className="h-4 w-4 shrink-0 text-white/55 transition-transform group-hover:scale-110" aria-hidden="true" />
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredItems.length > visibleCount && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <button type="button" onClick={() => setVisibleCount((count) => count + pageSize)} className="inline-flex min-h-12 items-center rounded-md border border-white/18 px-7 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/[0.07]">
                  Ver {Math.min(pageSize, filteredItems.length - visibleCount)} piezas más
                </button>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">{Math.min(visibleCount, filteredItems.length)} de {filteredItems.length}</p>
              </div>
            )}
          </>
        )}
      </section>

      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#09100f]/97 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Visor de galería">
          <button type="button" onClick={() => setLightboxIndex(null)} className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white hover:bg-white/10 md:right-7 md:top-7" aria-label="Cerrar galería"><X className="h-5 w-5" /></button>
          <button type="button" onClick={() => navigateLightbox("prev")} className="absolute bottom-6 left-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white hover:bg-white/10 md:bottom-auto md:left-7" aria-label="Imagen anterior"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => navigateLightbox("next")} className="absolute bottom-6 right-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white hover:bg-white/10 md:bottom-auto md:right-7" aria-label="Imagen siguiente"><ChevronRight className="h-5 w-5" /></button>

          <div className="flex h-full w-full flex-col items-center justify-center px-4 pb-24 pt-20 md:p-16">
            <div className="flex max-h-[72vh] max-w-[90vw] items-center justify-center overflow-hidden rounded-sm border border-white/10 bg-black shadow-2xl">
              {filteredItems[lightboxIndex].type === "video" ? (
                <video src={filteredItems[lightboxIndex].src} controls autoPlay loop playsInline className="max-h-[72vh] max-w-[90vw] object-contain" />
              ) : (
                <img src={filteredItems[lightboxIndex].src} alt={filteredItems[lightboxIndex].alt} className="max-h-[72vh] max-w-[90vw] object-contain" />
              )}
            </div>
            <div className="mt-5 max-w-2xl text-center">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#f0b08c]">Render referencial · {filteredItems[lightboxIndex].category}</p>
              <h2 className="mt-2 font-display text-2xl font-medium text-white">{galleryTitle(filteredItems[lightboxIndex], lightboxIndex)}</h2>
              <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/35">{lightboxIndex + 1} / {filteredItems.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
