import React, { useState } from "react";
import { Clock, FileSearch, FileText, Scale, ShieldCheck } from "lucide-react";

type DocumentKey = "contract" | "rules" | "milestones";

const documents: Record<DocumentKey, { title: string; purpose: string; items: [string, string][] }> = {
  contract: {
    title: "Contrato y estructura del derecho",
    purpose: "Debe explicar quién vende, qué derecho se adquiere y qué documento acredita cada etapa.",
    items: [
      ["Partes y poderes", "Razón social, RUC, representante, vigencia de poder y datos del comprador."],
      ["Objeto", "Identificación del lote, área, plano aplicable y naturaleza exacta del derecho adquirido."],
      ["Pagos", "Reserva, inicial, cuotas, moneda, intereses, mora, comprobantes y aplicación de cada abono."],
      ["Salida y devolución", "Desistimiento, incumplimiento, penalidades, plazos y procedimiento de reembolso."],
    ],
  },
  rules: {
    title: "Reglamento de uso y convivencia",
    purpose: "Debe convertir la visión arquitectónica en obligaciones medibles para todas las partes.",
    items: [
      ["Parámetros de edificación", "Alturas, retiros, materiales, revisión de planos y responsables de aprobarlos."],
      ["Servicios autónomos", "Responsabilidad, mantenimiento y permisos de soluciones solares, agua y saneamiento."],
      ["Movilidad y ruido", "Circulaciones permitidas, estacionamientos, horarios y procedimiento ante infracciones."],
      ["Administración", "Cuotas, presupuesto, rendición de cuentas, votaciones y modificación del reglamento."],
    ],
  },
  milestones: {
    title: "Anexo de hitos y entrega",
    purpose: "Debe separar lo existente, lo contratado y lo sujeto a permisos o a un umbral comercial.",
    items: [
      ["Punto de partida", "Estado físico y registral documentado a la fecha de firma."],
      ["Hitos verificables", "Obra, responsable, condición de inicio, fecha o ventana y evidencia de culminación."],
      ["Áreas comunes", "Alcance, medidas referenciales, equipamiento, fases y costos de mantenimiento."],
      ["Entrega y remedios", "Acta, tolerancias, observaciones, subsanación y consecuencias de un retraso."],
    ],
  },
};

const tabs: { key: DocumentKey; label: string; icon: typeof FileText }[] = [
  { key: "contract", label: "Contrato", icon: FileText },
  { key: "rules", label: "Reglamento", icon: Scale },
  { key: "milestones", label: "Hitos", icon: Clock },
];

export const ContractsAndRules: React.FC = () => {
  const [selected, setSelected] = useState<DocumentKey>("contract");
  const current = documents[selected];

  return (
    <div id="contracts" className="mx-auto max-w-6xl border border-white/10 bg-[#1D1714]/60 p-6 shadow-xl backdrop-blur-md md:p-8">
      <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0b08c]">
            <FileSearch className="h-4 w-4" /> Matriz de revisión documental
          </p>
          <h4 className="mt-3 font-display text-3xl font-semibold text-white">Lo importante no es ver un contrato. Es saber qué comprobar.</h4>
          <p className="mt-3 text-xs leading-6 text-white/55">
            Este visor resume los puntos que la versión vigente debe definir. No es un contrato, una copia certificada ni una constancia registral.
          </p>
        </div>
        <div className="flex gap-1 rounded-md border border-white/10 bg-black/25 p-1" role="tablist" aria-label="Documentos a revisar">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected === key}
              onClick={() => setSelected(key)}
              className={`inline-flex min-h-10 items-center gap-2 rounded px-4 text-[10px] font-bold uppercase tracking-[0.1em] ${selected === key ? "bg-[#bb5638] text-white" : "text-white/55 hover:text-white"}`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="border border-[#f0b08c]/20 bg-black/20 p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#f0b08c]">Propósito del documento</p>
          <h5 className="mt-3 font-display text-3xl font-semibold text-white">{current.title}</h5>
          <p className="mt-4 text-xs leading-6 text-white/55">{current.purpose}</p>
          <div className="mt-7 border-t border-white/10 pt-5">
            <p className="flex items-start gap-2 text-[10px] leading-5 text-white/50">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#8db386]" />
              Compara la versión recibida con la oferta, el plano seleccionado y los comprobantes de pago.
            </p>
          </div>
          <a href="#contacto" className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#bb5638] px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Solicitar versión vigente
          </a>
        </div>

        <div className="grid gap-px bg-white/10 sm:grid-cols-2" role="tabpanel">
          {current.items.map(([title, description], index) => (
            <article key={title} className="min-h-[190px] bg-[#171310] p-6">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f0b08c]">Punto 0{index + 1}</span>
                <span className="h-2 w-2 rounded-full bg-[#8db386]" />
              </div>
              <h5 className="mt-6 font-display text-2xl font-semibold text-white">{title}</h5>
              <p className="mt-3 text-xs leading-6 text-white/50">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
