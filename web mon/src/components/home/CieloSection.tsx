import { Link } from "react-router-dom";
import { PARACAS_DOME_PROJECT } from "../../data/paracasDome";

export function CieloSection() {
  return (
    <section id="cielo" className="cielo-track relative bg-[#1C1612]" aria-label="Acto Cielo: de la pampa al cielo nocturno">
      <div className="cielo-sticky">
        <picture>
          <source type="image/avif" media="(max-width: 767px)" srcSet="/media/hero-poster-mobile.avif" />
          <source type="image/avif" srcSet="/media/hero-poster-desktop.avif" />
          <source type="image/webp" media="(max-width: 767px)" srcSet="/media/hero-poster-mobile.webp" />
          <img
            src="/media/hero-poster-desktop.webp"
            alt="Pampa inland de Moon Paracas a plena luz: tierra, cerros bajos y cielo amplio"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <picture>
          <source type="image/avif" srcSet="/media/stargazing_deck_night.avif" />
          <img
            src="/media/stargazing_deck_night.png"
            alt="Deck de observación bajo el cielo nocturno inland de Paracas"
            className="cielo-night absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,22,18,0.18)_0%,rgba(28,22,18,0.22)_42%,rgba(28,22,18,0.78)_100%)]" />
        <div className="moon-grain absolute inset-0 mix-blend-soft-light opacity-30" aria-hidden="true" />

        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-12 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[1400px]">
            <p className="font-display italic text-xl text-[#C5A059]">II · Cielo</p>

            <div className="relative mt-4 min-h-[9.5rem] sm:min-h-[11rem]">
              <div className="cielo-copy-day absolute inset-0">
                <h2 className="moon-display font-semibold text-[#FAF8F5]">
                  El día es pampa.
                </h2>
                <p className="moon-lede mt-3 max-w-md text-[#F4EFE6]">Tierra. Grava. Silencio.</p>
              </div>
              <div className="cielo-copy-night absolute inset-0">
                <h2 className="moon-display font-semibold text-[#FAF8F5]">
                  La noche se gana.
                </h2>
                <p className="moon-lede mt-3 max-w-md text-[#F4EFE6]">Cielo. Estrellas. Calor bajo.</p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-end justify-between gap-5 border-t border-white/15 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C5A059]">
                {PARACAS_DOME_PROJECT.lotCount} unidades · etapa Founder
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/cielo"
                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FAF8F5] underline decoration-[#C5A059]/50 underline-offset-8 hover:decoration-[#C5A059]"
                >
                  Ritual completo
                </Link>
                <Link
                  to="/paracas-dome"
                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FAF8F5]/80 underline decoration-white/25 underline-offset-8 hover:text-[#FAF8F5]"
                >
                  Entrar al domo
                </Link>
                <Link
                  to="/galeria"
                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FAF8F5]/70 underline decoration-white/20 underline-offset-8 hover:text-[#FAF8F5]"
                >
                  Capítulo Polvo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
