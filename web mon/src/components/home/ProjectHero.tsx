import React, { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Calculator, Map, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { PROJECT } from "../../config/project";
import { COMMERCIAL_PRICE_PERIOD_LABEL } from "../../config/pricing";

const stats = [
  [PROJECT.areaLabel, "de paisaje"],
  [String(PROJECT.residentialLots), "lotes residenciales"],
  ["6", "aldeas peatonales"],
];

export function ProjectHero() {
  const reduceMotion = useReducedMotion();
  const [showVideo, setShowVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(min-width: 1024px)").matches) return;
    const timer = window.setTimeout(() => setShowVideo(true), 1400);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <section data-testid="project-hero" className="relative flex min-h-[calc(100svh-72px)] items-end overflow-hidden bg-[#172126] text-white md:min-h-[820px]">
      <picture className="absolute inset-0">
        <source media="(max-width: 767px)" srcSet="/media/hero-poster-mobile.webp" />
        <img
          src="/media/hero-poster-desktop.webp"
          alt="Arquitectura orgánica integrada al paisaje desértico de Moon Paracas"
          className="h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      {showVideo && (
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/media/hero-poster-desktop.webp"
          onCanPlay={() => setVideoReady(true)}
          aria-hidden="true"
        >
          <source src="/media/hero_bg.mp4" type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,18,19,0.94)_0%,rgba(10,18,19,0.64)_48%,rgba(10,18,19,0.12)_78%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,14,14,0.96)_0%,rgba(9,14,14,0.08)_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(240,176,140,0.12),transparent_34%)]" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-28 pt-28 sm:px-8 md:pb-14 lg:px-12"
      >
        <div className="max-w-4xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/16 bg-black/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0b08c] backdrop-blur-md">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Fase Founder · Cupos limitados
          </p>
          <h1 className="font-display text-[clamp(4.6rem,11vw,10rem)] font-semibold leading-[0.78] tracking-[-0.045em] text-[#fffaf0]">
            Moon Paracas
          </h1>
          <p className="mt-8 max-w-2xl font-display text-2xl font-medium leading-[1.02] text-[#f5d8c5] sm:text-3xl md:text-4xl">
            Tu refugio orgánico entre el desierto y el mar.
          </p>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#ece8df] md:text-base">
            Un proyecto de baja densidad para quienes buscan espacio, arquitectura y una decisión patrimonial explicada con claridad.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#masterplan"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ba5638] px-7 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_35px_rgba(186,86,56,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#9e452d] focus:outline-none focus:ring-2 focus:ring-[#f4d2bd] focus:ring-offset-2 focus:ring-offset-[#172126]"
            >
              <Map className="h-4 w-4" aria-hidden="true" />
              Explorar el masterplan
            </a>
            <a
              href="#financiamiento"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 bg-black/20 px-7 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#18353b] focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Calculator className="h-4 w-4" aria-hidden="true" />
              Calcular financiamiento
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-7 border-t border-white/20 pt-6 md:flex-row md:items-end">
          <dl className="grid grid-cols-3 gap-5 sm:max-w-xl sm:gap-10">
            {stats.map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl font-semibold text-white sm:text-3xl">{value}</dt>
                <dd className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/65 sm:text-[10px]">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-end gap-5 md:justify-end">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/45">Lista comercial · {COMMERCIAL_PRICE_PERIOD_LABEL}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-[#ffd5bd]">Lotes desde S/ 37,500</p>
            </div>
            <Link
              to="/simulador"
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white underline decoration-white/35 underline-offset-8 hover:decoration-white"
            >
              Ver disponibilidad <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </motion.div>

      <a
        href="#vision"
        className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 text-white/65 transition-colors hover:text-white lg:block"
        aria-label="Ir a la visión del proyecto"
      >
        <ArrowDown className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
