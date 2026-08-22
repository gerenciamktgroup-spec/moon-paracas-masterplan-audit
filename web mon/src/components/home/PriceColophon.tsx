import { Link } from "react-router-dom";
import { PARACAS_DOME_OFFERS, formatPen } from "../../data/paracasDome";
import { CONTACT, whatsappHref } from "../../config/project";
import { WA_LOT } from "../../config/whatsappCopy";
import {
  COMMERCIAL_PRICE_PERIOD_LABEL,
  STANDARD_LOT_AREA_M2,
  STANDARD_LOT_DOWN_PEN,
  STANDARD_LOT_MONTHLY_18_PEN,
  STANDARD_LOT_PRICE_PEN,
  formatPenAmount,
} from "../../config/pricing";

const founder = PARACAS_DOME_OFFERS[0];
const comfort = PARACAS_DOME_OFFERS[1];

export function PriceColophon() {
  return (
    <section
      id="colofon"
      className="border-y border-[#E8E1D5] bg-[#FAF8F5] text-[#1C1612]"
      aria-label="Lista comercial"
    >
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-10 sm:px-8 md:grid-cols-3 lg:px-12 lg:py-12">
        <article>
          <p className="font-display italic text-lg text-[#A84F36]">Lote</p>
          <p className="mt-2 font-display text-3xl leading-none">{STANDARD_LOT_AREA_M2} m² · {formatPenAmount(STANDARD_LOT_PRICE_PEN)}</p>
          <p className="mt-3 text-xs leading-5 text-[#786F66]">
            Lista {COMMERCIAL_PRICE_PERIOD_LABEL} · sin intereses · inicial {formatPenAmount(STANDARD_LOT_DOWN_PEN)} · {formatPenAmount(STANDARD_LOT_MONTHLY_18_PEN)} / 18 meses
          </p>
        </article>
        <article>
          <p className="font-display italic text-lg text-[#A84F36]">{founder.shortName}</p>
          <p className="mt-2 font-display text-3xl leading-none">{formatPen(founder.publicPrice)}</p>
          <p className="mt-3 text-xs leading-5 text-[#786F66]">Llegar. Dormir. Volver.</p>
        </article>
        <article>
          <p className="font-display italic text-lg text-[#A84F36]">{comfort.shortName}</p>
          <p className="mt-2 font-display text-3xl leading-none">{formatPen(comfort.publicPrice)}</p>
          <p className="mt-3 text-xs leading-5 text-[#786F66]">Quedarse. Cerrar el viento.</p>
        </article>
      </div>
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 border-t border-[#E8E1D5] px-5 py-5 sm:px-8 lg:px-12">
        <p className="text-xs text-[#786F66]">Render referencial. El contrato define el alcance.</p>
        <div className="flex flex-wrap gap-5">
          <a href={whatsappHref(WA_LOT)} className="font-display text-lg text-[#A84F36] underline decoration-[#C5A059]/50 underline-offset-4 hover:decoration-[#C5A059]">
            WhatsApp
          </a>
          <Link to="/simulador" className="font-display text-lg text-[#1C1612] underline decoration-[#C5A059]/50 underline-offset-4 hover:decoration-[#C5A059]">
            Ver el predio
          </Link>
          <a href="#financiamiento" className="font-display text-lg text-[#1C1612] underline decoration-[#C5A059]/50 underline-offset-4 hover:decoration-[#C5A059]">
            Financiar
          </a>
        </div>
      </div>
    </section>
  );
}
