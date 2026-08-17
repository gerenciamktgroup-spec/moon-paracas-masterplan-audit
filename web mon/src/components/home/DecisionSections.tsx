import React, { useMemo } from "react";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  FileCheck2,
  FileText,
  MapPin,
  MessageCircle,
  Route,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Lot } from "../../types/map";
import { SectionHeading } from "./SectionHeading";
import { CONTACT, PROJECT, whatsappHref } from "../../config/project";

type AvailabilitySectionProps = {
  lots: Lot[];
  domeLots: Lot[];
};

const residentialLots = (lots: Lot[]) =>
  lots.filter((lot) => lot.typology !== "parking" && lot.typology !== "parking-external");

const summarize = (lots: Lot[]) => ({
  total: lots.length,
  available: lots.filter((lot) => lot.status === "available").length,
  inProcess: lots.filter((lot) => ["offer", "reserved", "blocked"].includes(lot.status)).length,
  sold: lots.filter((lot) => lot.status === "sold").length,
});

export const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({ lots, domeLots }) => {
  const moon = useMemo(() => {
    const live = summarize(residentialLots(lots));
    const officialTotal = PROJECT.residentialLots;
    return {
      ...live,
      total: live.total > 0 ? officialTotal : 0,
      available: live.total > 0 ? Math.max(0, officialTotal - live.inProcess - live.sold) : 0,
    };
  }, [lots]);
  const dome = useMemo(() => summarize(domeLots), [domeLots]);
  const connected = moon.total > 0 && dome.total > 0;

  const projects = [
    { name: "Moon Paracas", data: moon, totalReference: PROJECT.residentialLots, href: "/simulador", note: "Lotes residenciales" },
    { name: "Paracas Dome", data: dome, totalReference: 50, href: "/paracas-dome/lotes", note: "Lotes de 2,000 m²" },
  ];

  return (
    <section id="disponibilidad" className="scroll-mt-24 bg-[#101a1b] py-20 text-white md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Disponibilidad para comparar"
            title="Del plano a una decisión mejor informada."
            description="Compara ubicación, estado y tipo de lote antes de hablar con un asesor. Así la conversación empieza con alternativas que realmente te interesan."
            inverse
          />
          <div className="inline-flex w-fit items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-3 text-[10px] font-bold uppercase text-white/65">
            <span className={`h-2 w-2 rounded-full ${connected ? "bg-[#78c68a] shadow-[0_0_0_5px_rgba(120,198,138,0.12)]" : "bg-[#d3aa76]"}`} />
            {connected ? "Inventario listo para consultar" : "Cargando disponibilidad"}
          </div>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-md bg-white/15 lg:grid-cols-2">
          {projects.map((project) => {
            const total = project.data.total || project.totalReference;
            const available = project.data.total ? project.data.available : null;
            const availabilityPercent = available === null ? 0 : Math.round((available / total) * 100);
            return (
              <article key={project.name} className="bg-[#162627] p-6 sm:p-9">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#f0b08c]">{project.note}</p>
                    <h3 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{project.name}</h3>
                  </div>
                  <ScanSearch className="h-7 w-7 text-white/25" aria-hidden="true" />
                </div>

                <div className="mt-9 grid grid-cols-3 gap-4 border-y border-white/12 py-6">
                  <div>
                    <p className="font-display text-3xl font-semibold text-white">{total}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase text-white/45">Total</p>
                  </div>
                  <div>
                    <p className="font-display text-3xl font-semibold text-[#9fd0aa]">{available ?? "..."}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase text-white/45">Disponibles</p>
                  </div>
                  <div>
                    <p className="font-display text-3xl font-semibold text-[#f0c09f]">{project.data.total ? project.data.inProcess : "..."}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase text-white/45">En proceso</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase text-white/45">
                    <span>Disponibilidad actual</span>
                    <span>{available === null ? "Sincronizando" : `${availabilityPercent}%`}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-[#78a982] transition-[width] duration-700" style={{ width: `${availabilityPercent}%` }} />
                  </div>
                </div>

                <Link
                  to={project.href}
                  className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-white/20 px-6 text-xs font-bold uppercase text-white transition-colors hover:bg-white hover:text-[#18353b]"
                >
                  Ver ubicación y lotes <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-center text-[10px] leading-5 text-white/40">
          La disponibilidad es referencial. Antes de separar, confirmamos contigo que el lote siga libre y que las condiciones comerciales estén vigentes.
        </p>
      </div>
    </section>
  );
};

const documentItems = [
  { title: "Ficha técnica", text: "Áreas, componentes incluidos y opciones de equipamiento.", icon: FileText },
  { title: "Condiciones comerciales", text: "Precio, inicial, cuotas, reserva y vigencia de la oferta.", icon: FileCheck2 },
  { title: "Estructura y reglas", text: "Documentos aplicables, uso, administración y alcances del proyecto.", icon: ShieldCheck },
  { title: "Hitos de entrega", text: "Qué activa cada pago y qué condiciones dependen del desarrollo progresivo.", icon: CheckCircle2 },
];

export const LocationAndTrustSection: React.FC = () => (
  <>
    <section id="ubicacion" className="scroll-mt-24 bg-[#f2f0e9] py-20 md:py-28">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-12">
        <div className="relative min-h-[520px] overflow-hidden rounded-md">
          <img
            src="/media/gallery/Walking_path_through_desert_gardens_202606170004.webp"
            alt="Sendero entre jardines secos y arquitectura integrada al desierto"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,25,25,0.08)_20%,rgba(11,25,25,0.88)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9">
            <p className="text-[10px] font-bold uppercase text-[#f0b08c]">Costa sur del Perú</p>
            <p className="mt-2 font-display text-4xl font-semibold">Paracas, Ica</p>
            <div className="mt-6 grid gap-3 border-t border-white/20 pt-5 sm:grid-cols-3">
              <p className="flex items-center gap-2 text-xs text-white/75"><MapPin className="h-4 w-4" /> Desierto y costa</p>
              <p className="flex items-center gap-2 text-xs text-white/75"><Route className="h-4 w-4" /> Acceso coordinado</p>
              <p className="flex items-center gap-2 text-xs text-white/75"><CalendarCheck2 className="h-4 w-4" /> Visita privada</p>
            </div>
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="El destino"
            title="Aquí la ubicación no es un dato. Es la experiencia."
            description="Moon Paracas se plantea desde la relación entre desierto, cielo y costa. La ruta exacta al predio se comparte al coordinar una visita, para recibirte con contexto y proteger la privacidad del lugar."
          />
          <div className="mt-9 border-l border-[#18353b]/15">
            {[
              ["01", "Conoce el proyecto", "Revisa el masterplan, las tipologías y el alcance técnico desde la web."],
              ["02", "Coordina tu visita", "Un asesor confirma disponibilidad y prepara una ruta según tu interés."],
              ["03", "Recorre con criterio", "Visita el entorno, contrasta ubicaciones y resuelve dudas documentales."],
            ].map(([number, title, text]) => (
              <div key={number} className="grid grid-cols-[48px_1fr] gap-4 border-b border-[#18353b]/15 py-5 pl-5 first:border-t">
                <span className="font-display text-2xl font-semibold text-[#b55034]">{number}</span>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[#18353b]">{title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[#667069]">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <a
            href="#contacto"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#18353b] px-6 text-xs font-bold uppercase text-white hover:bg-[#0f2a2e]"
          >
            Agendar visita privada <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>

    <section id="transparencia" className="scroll-mt-24 bg-[#dfe5dc] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <SectionHeading
            eyebrow="Expediente de decisión"
            title="La confianza también se diseña."
            description="Antes de separar, debes poder distinguir el proyecto, la oferta, los opcionales y los compromisos documentales. Moon organiza esa revisión en un solo recorrido."
          />
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link to="/tecnica" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#18353b] px-6 text-xs font-bold uppercase text-white hover:bg-[#0f2a2e]">
              Revisar transparencia <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#contacto" className="inline-flex min-h-12 items-center rounded-md border border-[#18353b]/25 px-6 text-xs font-bold uppercase text-[#18353b] hover:bg-white/60">
              Solicitar expediente
            </a>
          </div>
        </div>

        <div className="mt-12 grid border-l border-t border-[#18353b]/15 sm:grid-cols-2 lg:grid-cols-4">
          {documentItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="min-h-[250px] border-b border-r border-[#18353b]/15 p-7">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-[#b55034]" aria-hidden="true" />
                  <span className="text-[9px] font-bold uppercase text-[#66726b]">0{index + 1}</span>
                </div>
                <h3 className="mt-8 font-display text-2xl font-semibold text-[#18353b]">{item.title}</h3>
                <p className="mt-3 text-xs leading-6 text-[#606b64]">{item.text}</p>
                <p className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase text-[#3f6654]">
                  <CircleDot className="h-3.5 w-3.5" /> Disponible para revisión
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  </>
);

const faqs = [
  {
    question: "¿Qué incluye exactamente Founder 50?",
    answer:
      "Incluye un área interna asignada de 2,000 m², Domo geodésico base de 50 m², cobertura PVC tratada, puerta estándar, ventanas básicas, preparación del punto de instalación, anclaje, señalética y acceso a beneficios Moon Club. Los opcionales se cotizan por separado.",
  },
  {
    question: "¿Cuál es la diferencia entre Founder 50 y Comfort 50?",
    answer:
      "Comfort 50 añade aislamiento térmico, puerta rígida y mejores cierres para viento y arena. Founder 50 mantiene una entrada inicial más accesible y permite incorporar mejoras después.",
  },
  {
    question: "¿Cómo funciona el financiamiento directo?",
    answer:
      "El modelo web usa 50% de inicial y hasta 18 meses bajo un escenario sin interés. La lista de precios y el contrato vigentes deben confirmar plazo, tasas, gastos, mora y cualquier condición aplicable.",
  },
  {
    question: "¿La disponibilidad que veo está actualizada?",
    answer:
      "La web muestra el inventario comercial disponible para comparar. Antes de separar, un asesor confirma que el lote siga libre y valida contigo el precio y las condiciones vigentes.",
  },
  {
    question: "¿Los renders representan el producto final?",
    answer:
      "Los renders expresan la visión arquitectónica y son referenciales. La ficha técnica y el contrato aplicable definen áreas, acabados, equipamiento, cronograma y alcance final.",
  },
  {
    question: "¿Cómo se estructura Paracas Dome?",
    answer:
      "Paracas Dome se plantea mediante una asociación o entidad administradora con asignación interna de área de uso exclusivo. La documentación específica debe revisarse antes de firmar y no debe confundirse con una partida registral individual independizada.",
  },
  {
    question: "¿La compra garantiza rentabilidad por alquiler?",
    answer:
      "No. Existen configuraciones orientadas a una futura operación de estadías, pero no se promete renta garantizada. Cualquier esquema de administración, costos y proyección debe documentarse por separado.",
  },
  {
    question: "¿Qué ocurre después de separar un lote?",
    answer:
      "Se bloquea temporalmente la unidad, se valida la información del comprador y se entrega el expediente aplicable para revisión. La asignación y los hitos posteriores dependen de la firma y de los pagos establecidos.",
  },
];

export const FaqSection: React.FC = () => (
  <section className="bg-[#f2f0e9] py-20 md:py-28">
    <div className="mx-auto grid max-w-[1200px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.65fr_1.35fr] lg:px-12">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <SectionHeading
          eyebrow="Preguntas clave"
          title="Respuestas antes de decidir."
          description="Información comercial resumida para ayudarte a comparar. Los documentos firmados siempre prevalecen sobre el contenido del sitio."
        />
        <a href="#contacto" className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase text-[#a44c36] underline decoration-[#a44c36]/35 underline-offset-8">
          Consultar otro tema <MessageCircle className="h-4 w-4" />
        </a>
      </div>

      <div className="border-t border-[#18353b]/18">
        {faqs.map((faq, index) => (
          <details key={faq.question} className="group border-b border-[#18353b]/18">
            <summary className="flex min-h-[92px] cursor-pointer list-none items-center justify-between gap-5 py-5 [&::-webkit-details-marker]:hidden">
              <span className="flex items-start gap-4">
                <span className="mt-1 text-[10px] font-bold text-[#b55034]">0{index + 1}</span>
                <span className="font-display text-xl font-semibold text-[#18353b] sm:text-2xl">{faq.question}</span>
              </span>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#18353b]/20 text-[#18353b] transition-transform group-open:rotate-180">
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </span>
            </summary>
            <p className="max-w-3xl pb-7 pl-10 pr-12 text-sm leading-7 text-[#626c66]">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export const MobileActionBar: React.FC = () => (
  <nav aria-label="Acciones rápidas" className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-white/15 bg-[#101a1b]/96 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_18px_50px_rgba(4,12,13,0.36)] backdrop-blur-xl md:hidden">
    <div className="grid grid-cols-[1fr_1.15fr] gap-2">
      <Link to="/simulador" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/20 text-[10px] font-bold uppercase text-white">
        <ScanSearch className="h-4 w-4" /> Ver lotes
      </Link>
      <a
        href={whatsappHref("Hola, quiero información sobre Moon Paracas.")}
        target={CONTACT.whatsapp ? "_blank" : undefined}
        rel={CONTACT.whatsapp ? "noreferrer" : undefined}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#bb5638] text-[10px] font-bold uppercase text-white"
      >
        <MessageCircle className="h-4 w-4" /> Hablar con un asesor
      </a>
    </div>
  </nav>
);
