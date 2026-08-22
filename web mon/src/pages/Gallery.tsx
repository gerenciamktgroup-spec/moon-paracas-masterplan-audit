import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { InteriorHero } from "../components/InteriorHero";
import { SilenceNote } from "../components/SilenceNote";
import {
  LOOKBOOK_CHAPTERS,
  chapterItems,
  featuredItem,
  lookbookTitle,
  type GalleryItem,
  type LookbookChapterId,
} from "../lib/lookbookChapters";

const pageSize = 14;

export const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeChapter, setActiveChapter] = useState<LookbookChapterId>("tierra");
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

  const chapter = LOOKBOOK_CHAPTERS.find((entry) => entry.id === activeChapter) ?? LOOKBOOK_CHAPTERS[0];
  const filteredItems = useMemo(() => chapterItems(items, activeChapter), [items, activeChapter]);
  const heroItem = useMemo(() => featuredItem(filteredItems), [filteredItems]);
  const stripItems = useMemo(
    () => filteredItems.filter((item) => item.src !== heroItem?.src).slice(0, visibleCount),
    [filteredItems, heroItem, visibleCount],
  );
  const remaining = Math.max(0, filteredItems.length - 1 - visibleCount);

  const openLightbox = (item: GalleryItem) => {
    const index = filteredItems.findIndex((entry) => entry.src === item.src);
    if (index >= 0) setLightboxIndex(index);
  };

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

  const handleChapterChange = (id: LookbookChapterId) => {
    setActiveChapter(id);
    setVisibleCount(pageSize);
    setLightboxIndex(null);
  };

  return (
    <div className="min-h-[90vh] bg-[#FAF8F5] text-[#1C1612]">
      <InteriorHero
        eyebrow="Lookbook de materia"
        title={<>Tierra. Barro.<br /><em className="font-normal italic text-[#A84F36]">Lino. Bronce. Polvo.</em></>}
        description="Cinco capítulos táctiles. Cada pieza es visualización referencial; el contrato define el alcance."
        index="Archivo Moon"
        aside={
          <>
            <p className="mt-4 font-display text-4xl text-[#1C1612]">{items.length || "—"}</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#786F66]">Piezas de materia</p>
          </>
        }
      />

      <section className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-16 lg:px-12" aria-label="Lookbook de materia">
        <div className="no-scrollbar -mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {LOOKBOOK_CHAPTERS.map((entry) => {
            const active = entry.id === activeChapter;
            const count = loading ? "—" : chapterItems(items, entry.id).length;
            return (
              <button
                type="button"
                key={entry.id}
                onClick={() => handleChapterChange(entry.id)}
                aria-pressed={active}
                className={`inline-flex min-h-12 shrink-0 flex-col items-start rounded-2xl border px-4 py-2.5 text-left transition-colors ${
                  active
                    ? "border-[#1C1612] bg-[#1C1612] text-[#FAF8F5]"
                    : "border-[#E8E1D5] bg-white text-[#1C1612] hover:border-[#C5A059]"
                }`}
              >
                <span className="font-display text-xl leading-none">{entry.name}</span>
                <span className={`mt-1 text-[9px] font-bold uppercase tracking-[0.14em] ${active ? "text-[#C5A059]" : "text-[#786F66]"}`}>
                  {entry.line} · {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <SilenceNote title="La pampa tarda un segundo en aparecer." body="Abriendo el capítulo." />
        ) : loadError ? (
          <SilenceNote title="Este capítulo no abre ahora." body="Vuelve en un momento. El archivo sigue en la bóveda." />
        ) : !heroItem ? (
          <SilenceNote title="Este capítulo aún no se abre." body={chapter.note} />
        ) : (
          <>
            <article className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr] lg:items-end">
              <div className="max-w-md pb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A84F36]">Capítulo {chapter.name}</p>
                <h2 className="moon-title mt-3 font-semibold text-[#1C1612]">{chapter.line}</h2>
                <p className="mt-5 text-sm leading-7 text-[#3D352E]">{chapter.note}</p>
                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#786F66]">
                  Render referencial · {filteredItems.length} piezas
                </p>
              </div>

              <button
                type="button"
                onClick={() => openLightbox(heroItem)}
                className="group relative isolate min-h-[52vh] overflow-hidden rounded-[28px] bg-[#E8E1D5] text-left shadow-[0_30px_80px_rgba(28,22,18,0.12)] lg:min-h-[68vh]"
                aria-label={`Ampliar ${lookbookTitle(heroItem)}`}
              >
                {heroItem.type === "video" ? (
                  <video
                    src={heroItem.src}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <img src={heroItem.src} alt={heroItem.alt} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
                )}
                <div className="moon-grain absolute inset-0 opacity-25" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1C1612]/75 to-transparent px-6 py-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#C5A059]">
                    {heroItem.type === "video" ? "Cinemagraph" : "Pieza principal"} · {chapter.name}
                  </p>
                  <p className="mt-1 font-display text-2xl text-[#FAF8F5]">{lookbookTitle(heroItem)}</p>
                </div>
                {heroItem.type === "video" && (
                  <span className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#1C1612]/40 text-white">
                    <Play className="h-4 w-4 fill-white" />
                  </span>
                )}
              </button>
            </article>

            <div className="mt-8">
              <p className="mb-3 font-display italic text-lg text-[#A84F36]">El capítulo continúa</p>
              <div className="no-scrollbar flex gap-3 overflow-x-auto pb-4">
                {stripItems.map((item) => (
                  <button
                    type="button"
                    key={item.src}
                    onClick={() => openLightbox(item)}
                    onMouseEnter={(event) => {
                      const video = event.currentTarget.querySelector("video");
                      video?.play().catch(() => undefined);
                    }}
                    onMouseLeave={(event) => {
                      const video = event.currentTarget.querySelector("video");
                      if (video) {
                        video.pause();
                        video.currentTime = 0;
                      }
                    }}
                    className="group relative h-44 w-[70vw] shrink-0 overflow-hidden rounded-2xl border border-[#E8E1D5] bg-[#F4EFE6] text-left sm:w-72"
                    aria-label={`Ampliar ${lookbookTitle(item)}`}
                  >
                    {item.type === "video" ? (
                      <video src={item.src} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
                    ) : (
                      <img src={item.src} alt={item.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1C1612]/70 to-transparent px-3 py-2 font-display text-sm text-[#FAF8F5]">
                      {lookbookTitle(item)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {remaining > 0 && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + pageSize)}
                  className="inline-flex min-h-12 items-center rounded-full border border-[#1C1612]/15 bg-white px-7 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1C1612] hover:border-[#C5A059]"
                >
                  Seguir el capítulo · {Math.min(pageSize, remaining)} más
                </button>
                <p className="text-[9px] uppercase tracking-[0.15em] text-[#786F66]">
                  {Math.min(visibleCount + 1, filteredItems.length)} de {filteredItems.length}
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FAF8F5]/92 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Visor del lookbook">
          <button type="button" onClick={() => setLightboxIndex(null)} className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E1D5] bg-white text-[#1C1612] md:right-7 md:top-7" aria-label="Cerrar lookbook">
            <X className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => navigateLightbox("prev")} className="absolute bottom-6 left-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E1D5] bg-white text-[#1C1612] md:bottom-auto md:left-7" aria-label="Pieza anterior">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => navigateLightbox("next")} className="absolute bottom-6 right-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E1D5] bg-white text-[#1C1612] md:bottom-auto md:right-7" aria-label="Pieza siguiente">
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="flex h-full w-full flex-col items-center justify-center px-4 pb-24 pt-20 md:p-16">
            <div className="flex max-h-[72vh] max-w-[90vw] items-center justify-center overflow-hidden rounded-[20px] border border-[#E8E1D5] bg-[#1C1612] shadow-[0_30px_80px_rgba(28,22,18,0.18)]">
              {filteredItems[lightboxIndex].type === "video" ? (
                <video src={filteredItems[lightboxIndex].src} controls autoPlay loop playsInline className="max-h-[72vh] max-w-[90vw] object-contain" />
              ) : (
                <img src={filteredItems[lightboxIndex].src} alt={filteredItems[lightboxIndex].alt} className="max-h-[72vh] max-w-[90vw] object-contain" />
              )}
            </div>
            <div className="mt-5 max-w-2xl text-center">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">
                Render referencial · {chapter.name}
              </p>
              <h2 className="mt-2 font-display text-2xl font-medium text-[#1C1612]">{lookbookTitle(filteredItems[lightboxIndex])}</h2>
              <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#786F66]">
                {lightboxIndex + 1} / {filteredItems.length} · {chapter.line}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
