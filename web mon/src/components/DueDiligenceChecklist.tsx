import { CheckCircle2, Download, FileSearch, ShieldAlert } from "lucide-react";

const checks = [
  ["Identidad del proveedor", "Razón social, RUC, poderes vigentes y canal formal de atención."],
  ["Situación del predio", "Partida matriz, titularidad, cargas, zonificación y compatibilidad del uso propuesto."],
  ["Derecho que adquieres", "Diferenciar propiedad independizada, copropiedad, membresía o área de uso exclusivo."],
  ["Oferta económica", "Precio total, reserva, inicial, cuotas, mantenimiento, opcionales y causales de devolución."],
  ["Entrega por hitos", "Obras incluidas, condiciones previas, plazos, tolerancias y remedios ante retrasos."],
  ["Renders y anexos", "Relacionar cada promesa visual con una especificación escrita y una versión del plano."],
];

export const DueDiligenceChecklist = () => (
  <div className="mx-auto max-w-5xl overflow-hidden rounded-md border border-[#E8E1D5] bg-white">
    <div className="grid gap-8 border-b border-[#E8E1D5] p-6 sm:p-9 lg:grid-cols-[0.72fr_1.28fr]">
      <div>
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">
          <ShieldAlert className="h-4 w-4" /> Antes de separar
        </p>
        <h4 className="mt-4 font-display text-3xl font-semibold text-[#1C1612]">Una decisión patrimonial merece evidencia.</h4>
        <p className="mt-4 text-xs leading-6 text-[#786F66]">
          Esta lista no reemplaza asesoría legal, pero te ayuda a solicitar el mismo expediente para cada alternativa y comparar sin zonas grises.
        </p>
      </div>
      <div className="grid gap-px bg-[#E8E1D5] sm:grid-cols-2">
        {checks.map(([title, text], index) => (
          <div key={title} className="bg-[#FAF8F5] p-5">
            <div className="flex items-start justify-between gap-4">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4E6646]" />
              <span className="text-[9px] font-bold text-[#C5A059]">0{index + 1}</span>
            </div>
            <h5 className="mt-4 text-xs font-bold uppercase tracking-[0.1em] text-[#1C1612]">{title}</h5>
            <p className="mt-2 text-[11px] leading-5 text-[#786F66]">{text}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="flex flex-col justify-between gap-4 bg-[#F4EFE6] px-6 py-5 sm:flex-row sm:items-center sm:px-9">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#786F66]">
        <FileSearch className="h-4 w-4 text-[#f0b08c]" /> Solicita documentos vigentes y verifica su emisor.
      </p>
      <a href="#contacto" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#bb5638] px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
        <Download className="h-4 w-4" /> Solicitar expediente
      </a>
    </div>
  </div>
);
