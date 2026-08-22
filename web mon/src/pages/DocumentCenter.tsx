import { useEffect, useMemo, useState } from "react";
import { ArrowRight, FileText, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { trackEvent } from "../lib/analytics";
import { CONTACT, whatsappHref } from "../config/project";
import { COMMERCIAL_PRICE_PERIOD_LABEL, COMMERCIAL_PRICE_VERSION } from "../config/pricing";
import { WA_EXPEDIENTE } from "../config/whatsappCopy";
import { SilenceNote } from "../components/SilenceNote";

type PortalStatus = "guide" | "request" | "pending";

type DocumentItem = {
  id: string;
  index: string;
  category: string;
  title: string;
  purpose: string;
  status: PortalStatus;
};

const documents: DocumentItem[] = [
  { id: "identity", index: "01", category: "Titularidad", title: "Identidad, RUC y poderes del vendedor", purpose: "Permite verificar quién contrata, quién representa y con qué facultades.", status: "request" },
  { id: "property", index: "02", category: "Predio", title: "Partida, título y cargas", purpose: "Debe identificar el predio matriz, titularidad, cargas, medidas y antecedentes vigentes.", status: "request" },
  { id: "municipal", index: "03", category: "Municipal", title: "Zonificación y compatibilidad de uso", purpose: "Distingue el uso permitido de la visión comercial y de las autorizaciones todavía necesarias.", status: "request" },
  { id: "contract", index: "04", category: "Contrato", title: "Matriz para revisar la compraventa", purpose: "Guía publicada para comprobar partes, objeto, pagos, salida y devolución.", status: "guide" },
  { id: "rules", index: "05", category: "Convivencia", title: "Matriz para revisar el reglamento", purpose: "Guía publicada para comprobar parámetros, servicios, movilidad y administración.", status: "guide" },
  { id: "milestones", index: "06", category: "Entrega", title: "Matriz para revisar hitos y áreas comunes", purpose: "Guía publicada para separar lo existente, lo contratado y lo sujeto a condiciones.", status: "guide" },
  { id: "prices", index: "07", category: "Comercial", title: "Lista de precios y vigencia", purpose: "Debe indicar versión, fecha, moneda, impuestos, separación y condiciones de devolución.", status: "pending" },
  { id: "engineering", index: "08", category: "Ingeniería", title: "Estudios, factibilidades y cronograma", purpose: "Debe respaldar accesos, riesgos, servicios autónomos, fases, responsables y fechas.", status: "pending" },
];

const statusConfig: Record<PortalStatus, { label: string; drawer: string; className: string }> = {
  guide: {
    label: "En guía",
    drawer: "Depositado como guía web. No sustituye el original emitido.",
    className: "border-[#4E6646]/25 bg-[#4E6646]/8 text-[#4E6646]",
  },
  request: {
    label: "A solicitar",
    drawer: "Pide vigencia: emisor, fecha y número de documento.",
    className: "border-[#C5A059]/40 bg-[#C5A059]/10 text-[#A84F36]",
  },
  pending: {
    label: "Aún no depositado",
    drawer: "No significa aprobado ni rechazado. Aún no hay evidencia suficiente en esta bóveda.",
    className: "border-[#E8E1D5] bg-[#F4EFE6] text-[#786F66]",
  },
};

const filters: { id: "all" | PortalStatus; label: string }[] = [
  { id: "all", label: "Todo el expediente" },
  { id: "guide", label: "En guía" },
  { id: "request", label: "A solicitar" },
  { id: "pending", label: "Aún no depositado" },
];

export function DocumentCenter() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const visibleDocuments = filter === "all" ? documents : documents.filter((document) => document.status === filter);
  const counts = useMemo(
    () => ({
      guide: documents.filter((item) => item.status === "guide").length,
      request: documents.filter((item) => item.status === "request").length,
      pending: documents.filter((item) => item.status === "pending").length,
    }),
    [],
  );

  useEffect(() => trackEvent("view_documents", { source: "vault" }), []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1612]">
      <section className="relative overflow-hidden border-b border-[#E8E1D5] bg-[#F4EFE6]">
        <div className="moon-grain absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1200px] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#A84F36]">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#C5A059]/50 bg-white font-display text-sm text-[#1C1612]">M</span>
            Bóveda privada
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F66]">Expediente Moon Paracas</p>
              <h1 className="moon-display mt-4 max-w-3xl font-semibold">
                El archivo, <em className="font-normal italic text-[#A84F36]">no el ticket.</em>
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-[#3D352E]">
                Esta bóveda no reemplaza documentos emitidos por sus autoridades o titulares. Muestra qué hay en guía web, qué debes pedir vigente y qué aún no se ha depositado.
              </p>
            </div>

            <aside className="rounded-[24px] border border-[#C5A059]/35 bg-white p-6 shadow-[0_20px_50px_rgba(28,22,18,0.06)]">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">Sello de lectura</p>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#786F66]">Volumen</dt>
                  <dd className="mt-1 font-display text-2xl">{COMMERCIAL_PRICE_VERSION}</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#786F66]">Lista comercial</dt>
                  <dd className="mt-1 font-display text-2xl capitalize">{COMMERCIAL_PRICE_PERIOD_LABEL}</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#786F66]">Fichas</dt>
                  <dd className="mt-1 font-display text-2xl">{documents.length}</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#786F66]">Aún no depositadas</dt>
                  <dd className="mt-1 font-display text-2xl">{counts.pending}</dd>
                </div>
              </dl>
              <p className="mt-5 border-t border-[#E8E1D5] pt-4 text-xs leading-6 text-[#3D352E]">
                {counts.guide} en guía · {counts.request} a solicitar · {counts.pending} aún no depositadas. “Aún no depositado” no es un rechazo.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A84F36]">Índice de fichas</p>
              <h2 className="moon-title mt-2 font-semibold">Ocho piezas. Un expediente.</h2>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar fichas por estado de depósito">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  aria-pressed={filter === item.id}
                  className={`min-h-10 rounded-full border px-4 text-[10px] font-bold uppercase tracking-[0.1em] ${
                    filter === item.id
                      ? "border-[#1C1612] bg-[#1C1612] text-[#FAF8F5]"
                      : "border-[#E8E1D5] bg-white text-[#786F66] hover:border-[#C5A059]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {visibleDocuments.length === 0 ? (
            <div className="mt-12">
              <SilenceNote title="Este cajón del expediente está vacío." body="Cambia el filtro o pide la ficha vigente al asesor." />
            </div>
          ) : (
            <ol className="mt-10 divide-y divide-[#E8E1D5] overflow-hidden rounded-[24px] border border-[#E8E1D5] bg-white">
              {visibleDocuments.map((document) => {
                const status = statusConfig[document.status];
                return (
                  <li key={document.id}>
                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-start gap-4 px-5 py-5 sm:items-center sm:px-7 sm:py-6 [&::-webkit-details-marker]:hidden">
                        <span className="font-display text-2xl text-[#C5A059] sm:text-3xl">{document.index}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#786F66]">{document.category}</p>
                          <h3 className="mt-1 font-display text-xl font-semibold sm:text-2xl">{document.title}</h3>
                        </div>
                        <span className={`mt-1 inline-flex shrink-0 rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${status.className}`}>
                          {status.label}
                        </span>
                      </summary>
                      <div className="border-t border-[#E8E1D5] bg-[#FAF8F5] px-5 py-5 sm:px-7">
                        <p className="max-w-2xl text-sm leading-7 text-[#3D352E]">{document.purpose}</p>
                        <p className="mt-3 text-xs leading-6 text-[#786F66]">{status.drawer}</p>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="mt-10 grid gap-6 rounded-[24px] border border-[#E8E1D5] bg-white p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A84F36]">
                <Scale className="h-4 w-4" /> Siguiente paso
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold">Pide una versión identificada. Revisa quién la emite.</h2>
              <p className="mt-3 max-w-xl text-xs leading-6 text-[#786F66]">
                Nunca decidas con una captura sin fecha, un render o una descripción comercial como sustituto del contrato y sus anexos.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                to="/tecnica"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#1C1612]/15 px-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#1C1612] hover:border-[#C5A059]"
              >
                <FileText className="h-4 w-4" /> Guía técnica
              </Link>
              <a
                href={whatsappHref(WA_EXPEDIENTE)}
                target={CONTACT.whatsapp ? "_blank" : undefined}
                rel={CONTACT.whatsapp ? "noreferrer" : undefined}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C85B3E] px-5 text-[10px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#A84F36]"
              >
                Solicitar expediente <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
