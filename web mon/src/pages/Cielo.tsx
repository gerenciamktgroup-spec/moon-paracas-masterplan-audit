import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CONTACT, whatsappHref } from "../config/project";
import { WA_CIELO } from "../config/whatsappCopy";
import { trackEvent } from "../lib/analytics";

const acts = [
  {
    index: "01",
    title: "El día es pampa.",
    body: "Tierra compacta, agave y un cielo que basta. El predio se lee de día: grava, cerros bajos, sombra corta.",
  },
  {
    index: "02",
    title: "El umbral es térmico.",
    body: "Cuando baja la luz, baja el cuerpo. El viento queda fuera del ritual; el fuego se queda bajo.",
  },
  {
    index: "03",
    title: "La noche se gana.",
    body: "Deck de observación, polvo y constelaciones. No es un espectáculo: es un silencio que se elige.",
  },
];

export function Cielo() {
  useEffect(() => {
    trackEvent("select_intent", { intent: "Cielo", destination: "/cielo" });
  }, []);

  return (
    <div className="bg-[#1C1612] text-[#FAF8F5]">
      <section className="relative min-h-[88svh] overflow-hidden">
        <picture>
          <source type="image/avif" srcSet="/media/stargazing_deck_night.avif" />
          <img
            src="/media/stargazing_deck_night.png"
            alt="Deck de observación bajo el cielo nocturno inland de Paracas"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <video
          className="absolute inset-0 hidden h-full w-full object-cover opacity-80 lg:block"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/media/stargazing_deck_night.png"
          aria-hidden="true"
        >
          <source src="/media/Drone_view_desert_property_starg._202606230136.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,22,18,0.28)_0%,rgba(28,22,18,0.22)_40%,rgba(28,22,18,0.88)_100%)]" />
        <div className="moon-grain absolute inset-0 mix-blend-soft-light opacity-35" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-[1400px] flex-col justify-end px-5 pb-16 sm:px-8 lg:px-12">
          <p className="font-display italic text-xl text-[#C5A059]">II · Cielo</p>
          <h1 className="moon-display mt-4 max-w-3xl font-semibold">
            La noche no se compra.
            <em className="mt-3 block font-normal italic text-[#C5A059]">Se espera.</em>
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-[#F4EFE6]/78">
            Astronomía, fuego y silencio. El mismo predio, otra temperatura.
          </p>
        </div>
      </section>

      <section className="cielo-track" aria-label="De la pampa al cielo">
        <div className="cielo-sticky">
          <picture>
            <source type="image/avif" srcSet="/media/hero-poster-desktop.avif" />
            <img src="/media/hero-poster-desktop.webp" alt="Pampa inland a plena luz" className="absolute inset-0 h-full w-full object-cover" />
          </picture>
          <picture>
            <source type="image/avif" srcSet="/media/stargazing_deck_night.avif" />
            <img
              src="/media/stargazing_deck_night.png"
              alt="La misma pampa de noche"
              className="cielo-night absolute inset-0 h-full w-full object-cover"
            />
          </picture>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,22,18,0.15),rgba(28,22,18,0.78))]" />
          <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-12 sm:px-8 lg:px-12">
            <div className="relative min-h-[9rem]">
              <div className="cielo-copy-day absolute inset-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C5A059]">Día</p>
                <h2 className="moon-display mt-3 font-semibold">Tierra. Grava. Silencio.</h2>
              </div>
              <div className="cielo-copy-night absolute inset-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C5A059]">Noche</p>
                <h2 className="moon-display mt-3 font-semibold">Cielo. Estrellas. Calor bajo.</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-28">
        <div>
          <p className="font-display italic text-xl text-[#C5A059]">Tres actos</p>
          <h2 className="moon-title mt-3 font-semibold">Cómo se cruza el umbral.</h2>
        </div>
        <ol className="space-y-8">
          {acts.map((act) => (
            <li key={act.index} className="border-t border-white/12 pt-6">
              <p className="font-display text-3xl text-[#C5A059]">{act.index}</p>
              <h3 className="mt-2 font-display text-3xl font-semibold">{act.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">{act.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-3 px-5 pb-8 sm:px-8 md:grid-cols-3 lg:px-12">
        <figure className="relative min-h-[320px] overflow-hidden rounded-[24px] md:min-h-[460px]">
          <video className="absolute inset-0 h-full w-full object-cover" autoPlay loop muted playsInline preload="metadata">
            <source src="/media/gallery/Fire_crackles_in_stone_pit_202606170004.mp4" type="video/mp4" />
          </video>
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1C1612] p-6 font-display text-2xl">Fogón</figcaption>
        </figure>
        <figure className="relative min-h-[320px] overflow-hidden rounded-[24px] md:min-h-[460px]">
          <video className="absolute inset-0 h-full w-full object-cover" autoPlay loop muted playsInline preload="metadata">
            <source src="/media/Desert_bedroom_at_night_202606230045.mp4" type="video/mp4" />
          </video>
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1C1612] p-6 font-display text-2xl">Interior de noche</figcaption>
        </figure>
        <figure className="relative min-h-[320px] overflow-hidden rounded-[24px] bg-[#2A231E] p-8 md:min-h-[460px]">
          <p className="font-display italic text-xl text-[#C5A059]">Carta de silencio</p>
          <blockquote className="mt-8 font-display text-3xl leading-tight sm:text-4xl">
            “No hay más ruido que el que traes.”
          </blockquote>
          <p className="mt-6 text-sm leading-7 text-white/60">
            El lujo aquí no es un amenity. Es el intervalo entre el día de pampa y la noche que se gana.
          </p>
        </figure>
      </section>

      <section className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-16 sm:px-8 sm:flex-row sm:items-end sm:justify-between lg:px-12 lg:py-24">
        <div>
          <p className="font-display italic text-xl text-[#C5A059]">Siguiente umbral</p>
          <h2 className="moon-title mt-3 max-w-xl font-semibold">Habitar el domo o pedir el cielo en persona.</h2>
        </div>
        <div className="flex flex-wrap items-end gap-6">
          <Link to="/paracas-dome" className="border-b border-[#C5A059]/70 pb-1 font-display text-2xl text-[#FAF8F5] hover:border-[#C5A059]">
            Entrar al domo
          </Link>
          <Link to="/galeria" className="border-b border-white/25 pb-1 font-display text-2xl text-[#FAF8F5]/80 hover:text-[#FAF8F5]">
            Capítulo Polvo
          </Link>
          <a
            href={whatsappHref(WA_CIELO)}
            target={CONTACT.whatsapp ? "_blank" : undefined}
            rel={CONTACT.whatsapp ? "noreferrer" : undefined}
            className="border-b border-[#C5A059]/40 pb-1 font-display text-2xl text-[#C5A059]"
          >
            Coordinar visita
          </a>
        </div>
      </section>
    </div>
  );
}
