import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, FileSearch, FileText, Scale, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { trackEvent } from "../lib/analytics";

type PortalStatus = "guide" | "request" | "pending";

type DocumentItem = {
  id: string;
  category: string;
  title: string;
  purpose: string;
  status: PortalStatus;
};

const documents: DocumentItem[] = [
  { id: "identity", category: "Titularidad", title: "Identidad, RUC y poderes del vendedor", purpose: "Permite verificar quién contrata, quién representa y con qué facultades.", status: "request" },
  { id: "property", category: "Predio", title: "Partida, título y cargas", purpose: "Debe identificar el predio matriz, titularidad, cargas, medidas y antecedentes vigentes.", status: "request" },
  { id: "municipal", category: "Municipal", title: "Zonificación y compatibilidad de uso", purpose: "Distingue el uso permitido de la visión comercial y de las autorizaciones todavía necesarias.", status: "request" },
  { id: "contract", category: "Contrato", title: "Matriz para revisar la compraventa", purpose: "Guía publicada para comprobar partes, objeto, pagos, salida y devolución.", status: "guide" },
  { id: "rules", category: "Convivencia", title: "Matriz para revisar el reglamento", purpose: "Guía publicada para comprobar parámetros, servicios, movilidad y administración.", status: "guide" },
  { id: "milestones", category: "Entrega", title: "Matriz para revisar hitos y áreas comunes", purpose: "Guía publicada para separar lo existente, lo contratado y lo sujeto a condiciones.", status: "guide" },
  { id: "prices", category: "Comercial", title: "Lista de precios y vigencia", purpose: "Debe indicar versión, fecha, moneda, impuestos, separación y condiciones de devolución.", status: "pending" },
  { id: "engineering", category: "Ingeniería", title: "Estudios, factibilidades y cronograma", purpose: "Debe respaldar accesos, riesgos, servicios autónomos, fases, responsables y fechas.", status: "pending" },
];

const statusConfig: Record<PortalStatus, { label: string; className: string; icon: typeof Clock3 }> = {
  guide: { label: "Guía publicada", className: "border-[#8db386]/30 bg-[#8db386]/10 text-[#b8d9b2]", icon: CheckCircle2 },
  request: { label: "Solicitar vigencia", className: "border-[#e7b67c]/30 bg-[#e7b67c]/10 text-[#f1c998]", icon: FileSearch },
  pending: { label: "Pendiente de publicar", className: "border-white/15 bg-white/5 text-white/55", icon: Clock3 },
};

const filters: { id: "all" | PortalStatus; label: string }[] = [
  { id: "all", label: "Todo" },
  { id: "guide", label: "Guías" },
  { id: "request", label: "Solicitar" },
  { id: "pending", label: "Pendientes" },
];

export function DocumentCenter() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const visibleDocuments = filter === "all" ? documents : documents.filter((document) => document.status === filter);

  useEffect(() => trackEvent("view_documents", { source: "document_center" }), []);

  return (
    <div className="min-h-screen bg-[#111715] text-white">
      <section className="border-b border-white/10 bg-[#153a43] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0b08c]"><ShieldCheck className="h-4 w-4" /> Centro de decisión</p>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[0.94] sm:text-6xl">Documentos, estado y preguntas antes de separar.</h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65">Este portal no reemplaza los documentos emitidos por sus autoridades o titulares. Muestra qué existe como guía web, qué debes solicitar vigente y qué todavía no se ha publicado.</p>
          </div>
          <div className="rounded-md border border-[#f0b08c]/20 bg-[#0d282e] p-6">
            <p className="flex items-start gap-3 text-xs leading-6 text-white/65"><AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[#f0b08c]" /> “Pendiente” no significa aprobado ni rechazado. Significa que el portal aún no presenta evidencia suficiente para tratarlo como verificado.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f0b08c]">Estado del portal · 15 julio 2026</p>
              <h2 className="mt-3 font-display text-4xl font-semibold">Matriz documental</h2>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar documentos por estado">
              {filters.map((item) => (
                <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={`min-h-10 rounded-md border px-4 text-[10px] font-bold uppercase tracking-[0.1em] ${filter === item.id ? "border-[#f0b08c] bg-[#f0b08c] text-[#18353b]" : "border-white/15 text-white/60 hover:border-white/40"}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {visibleDocuments.map((document) => {
              const status = statusConfig[document.status];
              const StatusIcon = status.icon;
              return (
                <article key={document.id} className="border border-white/10 bg-[#171d1b] p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#f0b08c]">{document.category}</span>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${status.className}`}><StatusIcon className="h-3.5 w-3.5" /> {status.label}</span>
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold">{document.title}</h3>
                  <p className="mt-3 text-xs leading-6 text-white/50">{document.purpose}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 grid gap-5 border border-white/10 bg-[#0d282e] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f0b08c]"><Scale className="h-4 w-4" /> Próximo paso responsable</p>
              <h2 className="mt-3 font-display text-3xl font-semibold">Solicita una versión identificada y revisa quién la emite.</h2>
              <p className="mt-3 text-xs leading-6 text-white/55">Nunca decidas usando una captura sin fecha, un render o una descripción comercial como sustituto del contrato y sus anexos.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link to="/tecnica" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/20 px-5 text-[10px] font-bold uppercase tracking-[0.1em] text-white hover:bg-white/10"><FileText className="h-4 w-4" /> Ver guía técnica</Link>
              <a href="/#contacto" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#bb5638] px-5 text-[10px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#9e452d]">Solicitar expediente <ArrowRight className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
