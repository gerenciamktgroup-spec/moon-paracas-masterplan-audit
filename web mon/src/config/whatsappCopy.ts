import { PARACAS_DOME_OFFERS, PARACAS_DOME_PROJECT, formatPen } from "../data/paracasDome";
import {
  COMMERCIAL_PRICE_PERIOD_LABEL,
  LOT_PRICE_PER_M2_USD,
  STANDARD_LOT_AREA_M2,
  STANDARD_LOT_PRICE_PEN,
  STANDARD_LOT_PRICE_USD,
  formatUsdAmount,
} from "./pricing";

const founder = PARACAS_DOME_OFFERS[0];
const comfort = PARACAS_DOME_OFFERS[1];
const lotM2 = PARACAS_DOME_PROJECT.lotAreaM2.toLocaleString("es-PE");

export const WA_LOT = `Hola. Me interesa un lote de ${STANDARD_LOT_AREA_M2} m² en Moon Paracas, km 240 Panamericana Sur (lista ${COMMERCIAL_PRICE_PERIOD_LABEL}: $${LOT_PRICE_PER_M2_USD} USD/m², desde ${formatUsdAmount(STANDARD_LOT_PRICE_USD)} / S/ ${STANDARD_LOT_PRICE_PEN.toLocaleString("es-PE")}, financiamiento directo sin intereses).`;

export const WA_FOUNDER = `Hola. Me interesa Founder 50 (${formatPen(founder.publicPrice)}, lote ${lotM2} m² + domo ${founder.domeAreaM2} m²).`;

export const WA_COMFORT = `Hola. Me interesa Comfort 50 (${formatPen(comfort.publicPrice)}, lote ${lotM2} m² + domo ${comfort.domeAreaM2} m², aislamiento térmico y puerta rígida).`;

export const WA_ADVISOR = `Hola. Quiero hablar con un asesor de Moon Paracas sobre un lote de ${STANDARD_LOT_AREA_M2} m² o los packs Dome Founder 50 / Comfort 50.`;

export const WA_EXPEDIENTE = `Hola. Solicito una versión identificada del expediente Moon Paracas: titularidad, predio, contrato y lista vigente. Necesito emisor, fecha y número de documento.`;

export const WA_CIELO = `Hola. Quiero coordinar una visita al cielo de Moon Paracas: deck de observación y silencio nocturno en la pampa inland.`;

export function waOfferMessage(offerId: string) {
  if (offerId === "lote" || offerId === "lot") return WA_LOT;
  return offerId === "comfort-50" || offerId === "comfort" ? WA_COMFORT : WA_FOUNDER;
}
