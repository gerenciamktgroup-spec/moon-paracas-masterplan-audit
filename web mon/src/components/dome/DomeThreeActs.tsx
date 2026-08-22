import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, MessageCircle } from "lucide-react";
import { PARACAS_DOME_OFFERS, PARACAS_DOME_PROJECT, formatPen } from "../../data/paracasDome";
import { CONTACT, whatsappHref } from "../../config/project";
import { WA_COMFORT, WA_FOUNDER } from "../../config/whatsappCopy";
import { trackEvent } from "../../lib/analytics";

const acts = [
  {
    id: "pampa",
    numeral: "I",
    title: "Pampa",
    lines: ["Llegas.", "El cielo es más grande que el recinto."],
    caption: "Render referencial · pampa inland de Ica",
    image: "/images/paracas_dome_ext_1.png",
    avif: "/images/paracas_dome_ext_1.avif",
    imageAlt: "Domo geodésico sobre pampa inland de Paracas, cerros bajos y cielo amplio",
  },
  {
    id: "umbral",
    numeral: "II",
    title: "Umbral",
    lines: ["Entras.", "El viento queda fuera."],
    caption: "Sombra, calor, silencio",
    image: "/media/interior_dome_sunrise.png",
    imageAlt: "Umbral del domo al amanecer, interior cálido abierto a la pampa",
  },
  {
    id: "dentro",
    numeral: "III",
    title: "Dentro",
    lines: ["Dormir. Volver.", "Un triángulo de cielo."],
    caption: "Interior referencial · 50 m²",
    image: "/images/paracas_dome_int_1.png",
    avif: "/images/paracas_dome_int_1.avif",
    imageAlt: "Interior del domo geodésico con vigas de madera y cama de lino",
    video: "/media/Desert_bedroom_at_night_202606230045.mp4",
  },
] as const;

const interiorHotspots = [
  { id: "umbral", x: "20%", y: "60%", label: "Umbral", line: "El viento queda fuera." },
  { id: "cama", x: "48%", y: "72%", label: "Cama", line: "Lino. Silencio. Mañana." },
  { id: "triangulo", x: "70%", y: "28%", label: "Triángulo", line: "Un corte de cielo." },
] as const;

const rituals = [
  {
    offer: PARACAS_DOME_OFFERS[0],
    life: "Llegar. Dormir. Volver.",
    wa: WA_FOUNDER,
  },
  {
    offer: PARACAS_DOME_OFFERS[1],
    life: "Quedarse. Cerrar el viento. Habitar seguido.",
    wa: WA_COMFORT,
  },
];

export function DomeThreeActs() {
  const [activeSpot, setActiveSpot] = useState<(typeof interiorHotspots)[number]["id"]>("cama");
  const openSpot = interiorHotspots.find((spot) => spot.id === activeSpot) ?? interiorHotspots[1];

  return (
    <div className="relative">
      <header className="relative mx-auto max-w-[1400px] px-5 pb-6 pt-10 sm:px-8 lg:px-12 lg:pt-14">
        <p className="font-display italic text-xl text-[#A84F36]">IV · Ritual</p>
        <h1 className="moon-display mt-3 max-w-3xl font-semibold text-[#1C1612]">
          Un refugio. <em className="font-normal italic text-[#A84F36]">Tres umbrales.</em>
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-[#3D352E]">
          Lote de {PARACAS_DOME_PROJECT.lotAreaM2.toLocaleString("es-PE")} m², domo de 50 m² instalado y acceso a Moon Club. Pampa. Cielo grande.
        </p>
      </header>

      <div className="space-y-3 px-0 sm:px-5 lg:px-12">
        {acts.map((act) => (
          <article
            key={act.id}
            className="dome-act relative isolate min-h-[88svh] overflow-hidden bg-[#1C1612] text-[#FAF8F5] sm:rounded-[28px]"
          >
            <picture>
              {"avif" in act && act.avif ? <source type="image/avif" srcSet={act.avif} /> : null}
              <img
                src={act.image}
                alt={act.imageAlt}
                className="dome-act-media absolute inset-0 h-full w-full object-cover"
                loading={act.id === "pampa" ? "eager" : "lazy"}
                fetchPriority={act.id === "pampa" ? "high" : undefined}
              />
            </picture>
            {"video" in act && act.video && (
              <video
                className="absolute inset-0 hidden h-full w-full object-cover lg:block"
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                poster={act.image}
                aria-hidden="true"
              >
                <source src={act.video} type="video/mp4" />
              </video>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,22,18,0.18)_0%,rgba(28,22,18,0.12)_40%,rgba(28,22,18,0.78)_100%)]" />
            <div className="moon-grain absolute inset-0" aria-hidden="true" />

            {act.id === "dentro" && (
              <div className="absolute inset-0 z-20">
                {interiorHotspots.map((spot) => (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => setActiveSpot(spot.id)}
                    className={`absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition ${
                      activeSpot === spot.id
                        ? "border-[#FAF8F5] bg-[#C85B3E] scale-110"
                        : "border-[#FAF8F5]/80 bg-[#1C1612]/35 hover:bg-[#C5A059]"
                    }`}
                    style={{ left: spot.x, top: spot.y }}
                    aria-pressed={activeSpot === spot.id}
                    aria-label={spot.label}
                  />
                ))}
                <div className="absolute bottom-28 left-5 max-w-xs rounded-2xl border border-white/15 bg-[#1C1612]/75 px-4 py-3 backdrop-blur-md sm:left-10 lg:left-14">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#C5A059]">{openSpot.label}</p>
                  <p className="mt-1 font-display text-xl text-[#FAF8F5]">{openSpot.line}</p>
                </div>
              </div>
            )}

            <div className="relative z-10 flex min-h-[88svh] flex-col justify-end px-5 py-10 sm:px-10 lg:px-14">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C5A059]">
                Acto {act.numeral}
              </p>
              <h2 className="moon-display mt-3 font-semibold">{act.title}</h2>
              <div className="mt-5 max-w-md space-y-1 font-display text-2xl font-medium leading-snug text-[#F4EFE6] sm:text-3xl">
                {act.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#FAF8F5]/55">{act.caption}</p>
            </div>
          </article>
        ))}
      </div>

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="rituals-title">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A84F36]">Dos maneras de habitar</p>
        <h2 id="rituals-title" className="moon-title mt-3 max-w-2xl font-semibold text-[#1C1612]">
          Founder o Comfort. El mismo silencio, distinto umbral.
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {rituals.map(({ offer, life, wa }) => (
            <article key={offer.id} className="flex flex-col rounded-[24px] border border-[#E8E1D5] bg-white p-6 shadow-[0_18px_40px_rgba(28,22,18,0.05)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">{offer.stageLabel}</p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-[#1C1612]">{offer.shortName}</h3>
                </div>
                <p className="font-display text-2xl font-semibold text-[#A84F36]">{formatPen(offer.publicPrice)}</p>
              </div>
              <p className="mt-5 font-display text-xl italic leading-snug text-[#3D352E]">{life}</p>
              <p className="mt-3 text-sm leading-6 text-[#786F66]">
                {PARACAS_DOME_PROJECT.lotAreaM2.toLocaleString("es-PE")} m² + domo {offer.domeAreaM2} m² · {offer.summary}
              </p>
              <div className="mt-8 flex flex-col gap-2 sm:flex-row">
                <a
                  href={whatsappHref(wa)}
                  target={CONTACT.whatsapp ? "_blank" : undefined}
                  rel={CONTACT.whatsapp ? "noreferrer" : undefined}
                  onClick={() => trackEvent("whatsapp_click", { source: "dome_ritual", offerId: offer.id })}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#C85B3E] px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#A84F36]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp {offer.shortName}
                </a>
                <Link
                  to="/paracas-dome/simulador"
                  onClick={() => trackEvent("view_lot", { source: "dome_ritual", offerId: offer.id })}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#1C1612]/15 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1C1612] hover:border-[#C5A059]"
                >
                  <Calculator className="h-4 w-4" aria-hidden="true" />
                  Simular cuotas
                </Link>
              </div>
              <Link
                to="/paracas-dome/ofertas"
                className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A84F36]"
              >
                Ver el detalle del pack <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
