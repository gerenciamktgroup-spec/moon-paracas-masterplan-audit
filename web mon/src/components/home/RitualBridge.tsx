import { Link } from "react-router-dom";
import { PARACAS_DOME_OFFERS, formatPen } from "../../data/paracasDome";

const founder = PARACAS_DOME_OFFERS[0];
const comfort = PARACAS_DOME_OFFERS[1];

export function RitualBridge() {
  return (
    <section id="ritual" className="scroll-mt-24 bg-[#1C1612] py-20 text-[#FAF8F5] md:py-28">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-12">
        <div>
          <p className="font-display italic text-xl text-[#C5A059]">IV · Ritual</p>
          <h2 className="moon-title mt-3 font-semibold">
            Habitar el domo.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-[#F4EFE6]/72">
            Un recinto de 50 m² sobre 2,000 m². El viento queda fuera. El cielo entra por un triángulo.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <article className="border-t border-white/15 pt-5">
            <p className="font-display italic text-lg text-[#C5A059]">{founder.shortName}</p>
            <p className="mt-3 font-display text-3xl">{formatPen(founder.publicPrice)}</p>
            <p className="mt-3 font-display text-xl leading-snug">Llegar. Dormir. Volver.</p>
          </article>
          <article className="border-t border-white/15 pt-5">
            <p className="font-display italic text-lg text-[#C5A059]">{comfort.shortName}</p>
            <p className="mt-3 font-display text-3xl">{formatPen(comfort.publicPrice)}</p>
            <p className="mt-3 font-display text-xl leading-snug">Quedarse. Cerrar el viento.</p>
          </article>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <Link
          to="/paracas-dome"
          className="inline-flex items-center border-b border-[#C5A059]/70 pb-1 font-display text-2xl text-[#FAF8F5] hover:border-[#C5A059] hover:text-[#C5A059]"
        >
          Entrar
        </Link>
      </div>
    </section>
  );
}
