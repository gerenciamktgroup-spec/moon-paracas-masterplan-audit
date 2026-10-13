import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Download, FileText, Lock, Scale, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { trackEvent } from "../lib/analytics";
import { CONTACT, whatsappHref } from "../config/project";
import { COMMERCIAL_PRICE_PERIOD_LABEL, COMMERCIAL_PRICE_VERSION, STANDARD_LOT_PRICE_USD } from "../config/pricing";
import { WA_EXPEDIENTE } from "../config/whatsappCopy";

type PortalStatus = "verified" | "framework" | "audit";

type DocumentItem = {
  id: string;
  index: string;
  category: string;
  title: string;
  fileName: string;
  purpose: string;
  highlights: string[];
  status: PortalStatus;
};

const verifiedDossierDocuments: DocumentItem[] = [
  {
    id: "doc-01",
    index: "01",
    category: "Contrato Principal",
    title: "Contrato de Incorporación y Adjudicación de Área de Uso Exclusivo",
    fileName: "01_Contrato_Incorporacion_y_Adjudicacion_Area_Uso_Exclusivo.docx",
    purpose: "Instrumento legal marco que formaliza la incorporación del adquirente como asociado activo y la adjudicación física y jurídica de su área de uso exclusivo (lote de 120 m² para Casa Domo o 240 m² lote doble).",
    highlights: [
      "Individualización precisa de coordenadas y número de lote dentro del lote matriz de 11.26 ha.",
      "Reconocimiento expreso del derecho de posesión pacífica, uso perpetuo y construcción.",
      "Garantía de libre transmisibilidad y sucesión conforme a la ley peruana.",
    ],
    status: "verified",
  },
  {
    id: "doc-02",
    index: "02",
    category: "Etapa Fundadora",
    title: "Anexo de Condiciones Comerciales Fase 0 — Etapa Fundadora",
    fileName: "02_Anexo_Condiciones_Fase_0_Etapa_Fundadora.docx",
    purpose: "Establece las condiciones preferenciales, precio congelado de preventa ($120 USD / m² -> $14,400 USD por lote de 120 m²) y prioridad en la elección de ubicación para los primeros adquirentes.",
    highlights: [
      "Tarifa congelada de lanzamiento sin reajustes de inflación ni costos ocultos.",
      "Financiamiento directo hasta 36 meses sin intereses bancarios.",
      "Separación inicial deducible del monto total de adjudicación.",
    ],
    status: "verified",
  },
  {
    id: "doc-03",
    index: "03",
    category: "Ingeniería & Obras",
    title: "Anexo Cronograma de Obras e Hitos de Caja Positiva (CAPEX)",
    fileName: "03_Anexo_Cronograma_Obras_Hitos_Caja_Positiva.docx",
    purpose: "Plan maestro constructivo calendarizado con respaldo presupuestal auditado. Desglosa los hitos de infraestructura: cerco perimétrico, perforación de pozos, red de biodigestores, vías y Oasis central.",
    highlights: [
      "Hitos vinculados a fondos de reserva específicos para garantizar la entrega.",
      "Fase 1: Cerco perimétrico + Pórtico de ingreso + Primer anillo vial compactado.",
      "Fase 2: Oasis central de 20,000 m², laguna ecológica, club house y amenidades zen.",
    ],
    status: "verified",
  },
  {
    id: "doc-04",
    index: "04",
    category: "Respaldo Fiduciario",
    title: "Acuerdo de Aporte, Valorización y Pago del Terreno Matriz",
    fileName: "04_Acuerdo_Aporte_Valorizacion_Pago_Terreno.docx",
    purpose: "Demuestra la cadena de titularidad, solvencia y pago irrevocable del predio matriz de 112,591.80 m² (11.26 ha), eliminando riesgos de contingencias o gravámenes con terceros.",
    highlights: [
      "Identificación registral y topográfica con vértices UTM 18S A, B, C y D.",
      "Inafectación de deudas o gravámenes hipotecarios de entidades bancarias.",
      "Asignación exclusiva del predio al proyecto eco-residencial Moon Paracas.",
    ],
    status: "verified",
  },
  {
    id: "doc-05",
    index: "05",
    category: "Libre Disposición",
    title: "Contrato de Transferencia y Cesión de Membresía",
    fileName: "05_Contrato_Transferencia_Membresia.docx",
    purpose: "Garantiza al comprador la potestad de vender, ceder o transferir su lote en el mercado secundario con total respaldo administrativo y sin trabas corporativas desmedidas.",
    highlights: [
      "Procedimiento ágil de transferencia notarial y actualización del padrón de asociados.",
      "Capacidad de monetizar la plusvalía generada por el avance de obras.",
      "Cero cláusulas leoninas de retención forzada de patrimonio.",
    ],
    status: "verified",
  },
  {
    id: "doc-06",
    index: "06",
    category: "Seguridad Jurídica",
    title: "Constancia de Adjudicación y Acta de Posesión Física Interna",
    fileName: "07_Constancia_Adjudicacion_Posesion_Interna.docx",
    purpose: "Documento oficial emitido al completar la suscripción que certifica la posesión material del lote individual, con límites, colindancias y entrega de estacas de replanteo.",
    highlights: [
      "Plano perimétrico individual visado con frentes, fondos y distancias.",
      "Asignación de espacio de estacionamiento en el hub vehicular correspondiente.",
      "Acta formal de entrega y delimitación en campo.",
    ],
    status: "verified",
  },
  {
    id: "doc-07",
    index: "07",
    category: "Mitigación Técnica",
    title: "Anexo de Riesgos Técnicos y Mitigaciones Ambientales (Disclosure)",
    fileName: "08_Anexo_Riesgos_Disclosure.docx",
    purpose: "Transparencia técnica total sobre las condiciones climáticas del desierto de Paracas (vientos Paracas, salinidad, suelo arenoso) y las soluciones de ingeniería aplicadas a las estructuras domo.",
    highlights: [
      "Estructuras geodésicas autoportantes aerodinámicas probadas para vientos > 70 km/h.",
      "Lonas arquitectónicas con protección UV grado marino y aislamiento térmico multicapa.",
      "Sistemas de tratamiento ecológico de aguas grises y biodigestores sin infiltración freática.",
    ],
    status: "audit",
  },
  {
    id: "doc-08",
    index: "08",
    category: "Convivencia & Eco-Resort",
    title: "Reglamento Interno y Parámetros Arquitectónicos Casa Domo",
    fileName: "09_Reglamento_Interno_Base.docx",
    purpose: "Norma de convivencia, mantenimiento de áreas comunes, estándares estéticos Quiet Luxury, gestión de residuos y lineamientos para alquiler temporal (Airbnb / Glamping).",
    highlights: [
      "Permite renta vacacional con manual de operación y estándares de hospitalidad.",
      "Protección contra contaminación lumínica para garantizar cielos estrellados (Dark Sky compliance).",
      "Horarios de silencio y preservación del entorno natural desértico.",
    ],
    status: "framework",
  },
  {
    id: "doc-09",
    index: "09",
    category: "Presupuesto & Balances",
    title: "Masterplan Técnico Consolidado y Presupuesto CAPEX de Obra",
    fileName: "00_Masterplan_Tecnico_Consolidado_Moon_Paracas.xlsx",
    purpose: "Cuadro integral de áreas, balance de masas (55% vendible / 45% áreas comunes) y presupuesto detallado de inversión de obra por etapas.",
    highlights: [
      "384 lotes individuales distribuidos simétricamente en 4 aldeas de 96 lotes cada una.",
      "192 plazas de cocheras en el acceso sur + áreas de maniobra y carritos de golf.",
      "20,662.15 m² de Oasis central con laguna artificial de agua cristalina y club house.",
    ],
    status: "verified",
  },
  {
    id: "doc-10",
    index: "10",
    category: "Topografía & Cartografía",
    title: "Polígono Georreferenciado Oficial UTM WGS84 Zona 18S (11.26 ha)",
    fileName: "11has paracas.kml",
    purpose: "Archivo cartográfico digital oficial para visualización en Google Earth y sistemas SIG, con los vértices geodésicos exactos que coinciden con el plano satelital del proyecto.",
    highlights: [
      "Vértice A (Sur / Acceso): 374,763.430 E, 8,460,135.551 N (-13.926156°, -76.159257°).",
      "Vértice B (Oeste): 374,552.033 E, 8,460,333.976 N (-13.924352°, -76.161205°).",
      "Vértice C (Norte): 374,772.368 E, 8,460,646.965 N (-13.921533°, -76.159151°).",
      "Vértice D (Este): 374,993.574 E, 8,460,440.900 N (-13.923405°, -76.157113°).",
    ],
    status: "verified",
  },
];

const statusConfig: Record<PortalStatus, { label: string; drawer: string; className: string }> = {
  verified: {
    label: "Depositado & Auditado",
    drawer: "Documento oficial listo para revisión notarial o descarga de suscripción.",
    className: "border-[#4E6646]/30 bg-[#4E6646]/10 text-[#4E6646]",
  },
  audit: {
    label: "Ficha de Ingeniería",
    drawer: "Estudio técnico con especificaciones de resistencia eólica y bioclimatología.",
    className: "border-[#C5A059]/40 bg-[#C5A059]/15 text-[#A84F36]",
  },
  framework: {
    label: "Reglamento Aprobado",
    drawer: "Estatuto normativo vinculante de convivencia y estándares arquitectónicos.",
    className: "border-[#1C1612]/20 bg-[#1C1612]/5 text-[#1C1612]",
  },
};

const filters: { id: "all" | PortalStatus; label: string }[] = [
  { id: "all", label: "Todo el Expediente (10)" },
  { id: "verified", label: "Contratos & Títulos (7)" },
  { id: "audit", label: "Ingeniería & Riesgos (1)" },
  { id: "framework", label: "Reglamento & Convivencia (2)" },
];

export function DocumentCenter() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const visibleDocuments =
    filter === "all"
      ? verifiedDossierDocuments
      : verifiedDossierDocuments.filter((doc) => doc.status === filter);

  useEffect(() => trackEvent("view_documents", { source: "vault_v1_dossier" }), []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1612]">
      {/* ── HERO BANNER DE LA BÓVEDA DOCUMENTAL ── */}
      <section className="relative overflow-hidden border-b border-[#E8E1D5] bg-[#F4EFE6]">
        <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] opacity-20" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1240px] px-5 pt-28 pb-16 sm:px-8 sm:pt-32 md:pb-24 lg:px-12">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#A84F36]">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#C5A059]/50 bg-white font-display text-sm text-[#1C1612]">
              M
            </span>
            <span>Bóveda Jurídica & Expediente de Obra 2026</span>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F66]">
                Expediente Integral Moon Paracas · V1 Trabajo
              </p>
              <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold text-[#1C1612] leading-tight">
                Certeza jurídica, <em className="font-normal italic text-[#A84F36]">no promesas al aire.</em>
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#3D352E]">
                El comprador exigente de Lima (San Isidro, Miraflores, Surco, La Molina) no compra renders: compra respaldo.
                Aquí transparentamos los 10 instrumentos legales, contractuales y técnicos que garantizan la adjudicación de tu lote de 120 m² a ${STANDARD_LOT_PRICE_USD.toLocaleString()} USD y el cronograma de ejecución del Eco-Resort.
              </p>
            </div>

            <aside className="rounded-3xl border border-[#C5A059]/40 bg-white p-7 shadow-[0_20px_50px_rgba(28,22,18,0.06)]">
              <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">Sello Notarial</p>
                  <p className="font-display text-lg font-bold text-[#1C1612]">Expediente Completo</p>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#4E6646]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4E6646]">
                  <Shield className="h-3.5 w-3.5" />
                  10 Piezas
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#786F66]">Versión de Trabajo</dt>
                  <dd className="mt-1 font-display text-xl font-bold text-[#1C1612]">{COMMERCIAL_PRICE_VERSION}</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#786F66]">Precio Lote Domo</dt>
                  <dd className="mt-1 font-display text-xl font-bold text-[#A84F36]">${STANDARD_LOT_PRICE_USD.toLocaleString()} USD</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#786F66]">Predio Matriz</dt>
                  <dd className="mt-1 font-display text-base font-bold text-[#1C1612]">11.26 ha (UTM 18S)</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#786F66]">Modalidad</dt>
                  <dd className="mt-1 font-display text-base font-bold text-[#1C1612]">Asociación & Adjudicación</dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-[#E8E1D5] pt-4 flex items-center justify-between text-xs text-[#786F66]">
                <span>Caja positiva · CAPEX auditado</span>
                <span className="font-semibold text-[#1C1612]">{COMMERCIAL_PRICE_PERIOD_LABEL}</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── LISTADO DETALLADO DE LOS 10 DOCUMENTOS ── */}
      <section className="px-5 py-14 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A84F36]">
                Índice Oficial de Documentos
              </p>
              <h2 className="mt-2 font-display text-2xl sm:text-4xl font-bold text-[#1C1612]">
                Diez piezas. Un expediente integral.
              </h2>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar documentos por categoría">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`min-h-10 rounded-full border px-4 text-[10px] font-bold uppercase tracking-[0.1em] transition cursor-pointer ${
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

          {/* Acordeón de Documentos */}
          <ol className="mt-10 divide-y divide-[#E8E1D5] overflow-hidden rounded-3xl border border-[#E8E1D5] bg-white shadow-sm">
            {visibleDocuments.map((doc) => {
              const status = statusConfig[doc.status];
              return (
                <li key={doc.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-start gap-4 px-5 py-5 sm:items-center sm:px-8 sm:py-6 transition hover:bg-[#FAF8F5] [&::-webkit-details-marker]:hidden">
                      <span className="font-display text-2xl font-bold text-[#C5A059] sm:text-3xl">
                        {doc.index}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#786F66]">
                            {doc.category}
                          </p>
                          <span className="text-[10px] text-[#E8E1D5]">·</span>
                          <span className="font-mono text-[9px] text-[#A84F36]/80">{doc.fileName}</span>
                        </div>
                        <h3 className="mt-1 font-display text-lg sm:text-xl font-bold text-[#1C1612]">
                          {doc.title}
                        </h3>
                      </div>
                      <span className={`mt-1 inline-flex shrink-0 rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${status.className}`}>
                        {status.label}
                      </span>
                    </summary>

                    <div className="border-t border-[#E8E1D5] bg-[#FAF8F5] px-6 py-6 sm:px-10">
                      <p className="max-w-3xl text-sm leading-relaxed text-[#3D352E]">
                        {doc.purpose}
                      </p>

                      <div className="mt-5 rounded-2xl border border-[#E8E1D5] bg-white p-5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36] mb-3 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
                          Cláusulas y Garantías Destacadas
                        </p>
                        <ul className="space-y-2 text-xs text-[#524941]">
                          {doc.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <CheckCircle2 className="h-4 w-4 text-[#4E6646] shrink-0 mt-0.5" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E1D5]">
                        <p className="text-xs text-[#786F66] flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-[#C5A059]" />
                          {status.drawer}
                        </p>
                        <a
                          href={whatsappHref(`Hola! Solicito revisión del documento: ${doc.title} (${doc.fileName}) del proyecto Moon Paracas.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#1C1612] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#C85B3E] transition"
                        >
                          <span>Solicitar Copia Notarial</span>
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>

          {/* Call to action de asistencia jurídica */}
          <div className="mt-12 grid gap-6 rounded-3xl border border-[#C5A059]/40 bg-[#FAF7F2] p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center shadow-sm">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A84F36]">
                <Scale className="h-4 w-4" /> Asesoría Legal Personalizada
              </p>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-[#1C1612]">
                ¿Deseas que tu abogado revise el expediente completo?
              </h2>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[#786F66]">
                Te compartimos la carpeta completa de Google Drive con las 10 minutas legales, contratos en Word, cuadro de lotes en Excel y el archivo KML de coordenadas geodésicas para su revisión formal antes de cualquier firma.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                to="/tecnica"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#1C1612]/20 bg-white px-5 text-xs font-bold uppercase tracking-wider text-[#1C1612] hover:bg-[#FAF8F5] transition"
              >
                <FileText className="h-4 w-4 text-[#A84F36]" /> Memoria Técnica
              </Link>
              <a
                href={whatsappHref(WA_EXPEDIENTE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#C85B3E] px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#A84F36] shadow-md shadow-[#C85B3E]/20 transition"
              >
                Solicitar Acceso al Drive Completo <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
