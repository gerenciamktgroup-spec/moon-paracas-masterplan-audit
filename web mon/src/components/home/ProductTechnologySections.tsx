import React, { useState } from "react";
import {
  BatteryCharging,
  Check,
  Droplets,
  Layers3,
  Leaf,
  PanelsTopLeft,
  ShieldCheck,
  Sun,
  Wind,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";
import { PROJECT } from "../../config/project";

type SystemId = "estructura" | "confort" | "autonomia";

const domeSystems = [
  {
    id: "estructura" as const,
    label: "Estructura",
    title: "Una envolvente ligera, firme y pensada para el desierto.",
    description:
      "El Domo 50 concentra su resistencia en una geometría eficiente y deja el horizonte como protagonista. La configuración base prioriza instalación, anclaje y protección exterior.",
    image: "/images/domo_ext_2.png",
    alt: "Exterior del Domo 50 integrado al paisaje de Paracas",
    icon: Layers3,
    points: [
      "50 m² de superficie interior",
      "Cobertura PVC con protección UV, tratamiento ignífugo y antibacterial",
      "Anclaje básico reforzado y ventanas triangulares",
    ],
  },
  {
    id: "confort" as const,
    label: "Confort",
    title: "El nivel de uso define el nivel de equipamiento.",
    description:
      "Comfort 50 incorpora aislamiento y mejor cierre para estadías frecuentes. Founder 50 permite añadir esas mejoras de forma progresiva y mantener el control de la inversión.",
    image: "/images/domo_int_2.png",
    alt: "Interior cálido y equipado del Domo 50",
    icon: Wind,
    points: [
      "Aislamiento térmico incluido en Comfort 50",
      "Puerta rígida y mejor cierre frente a viento y arena",
      "Ventanal panorámico y tabiquería como opciones",
    ],
  },
  {
    id: "autonomia" as const,
    label: "Autonomía",
    title: "Tecnología útil, elegida según tu forma de habitar.",
    description:
      "La autonomía no se presenta como una promesa abstracta: se construye con módulos concretos de energía, agua y saneamiento disponibles en el configurador comercial.",
    image: "/media/amenity_solar.jpeg",
    alt: "Pérgola solar integrada a la arquitectura del proyecto",
    icon: BatteryCharging,
    points: [
      "Kits solares básico y comfort",
      "Cisterna individual de 1,000 litros",
      "Baño seco y equipamiento de bajo consumo",
    ],
  },
];

const environmentalSystems = [
  {
    title: "Baja densidad",
    status: "Decisión de proyecto",
    metric: PROJECT.areaLabel,
    text: "Un masterplan de escala controlada que prioriza recorridos, áreas abiertas y relación con el paisaje.",
    icon: PanelsTopLeft,
  },
  {
    title: "Energía solar",
    status: "Configurable",
    metric: "2 niveles",
    text: "Kits básico y comfort para dimensionar la autonomía según frecuencia de uso y equipamiento.",
    icon: Sun,
  },
  {
    title: "Agua y saneamiento",
    status: "Configurable",
    metric: "1,000 L",
    text: "Cisterna individual y baño seco disponibles como módulos, con alcance y precio visibles antes de comprar.",
    icon: Droplets,
  },
  {
    title: "Paisaje continuo",
    status: "Lenguaje base",
    metric: "Sin cercos",
    text: "Paisajismo xerófilo, piedra y pircas bajas para delimitar sin convertir el desierto en una urbanización convencional.",
    icon: Leaf,
  },
];

export const DomeSystemSection: React.FC = () => {
  const [activeId, setActiveId] = useState<SystemId>("estructura");
  const activeSystem = domeSystems.find((system) => system.id === activeId) ?? domeSystems[0];
  const ActiveIcon = activeSystem.icon;

  return (
    <section id="arquitectura" className="scroll-mt-24 bg-[#e2e5dd] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Arquitectura habitable"
            title="Domo 50: un sistema que puede crecer contigo."
            description="Explora qué pertenece a la estructura, qué mejora el confort y qué módulos construyen autonomía. Cada capa se presenta con un alcance concreto."
          />
          <p className="max-w-sm border-l border-[#18353b]/20 pl-5 text-xs leading-6 text-[#5f6b65]">
            La configuración final depende del paquete y los upgrades elegidos. Nada opcional se presenta como incluido.
          </p>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-md border border-[#18353b]/15 bg-[#f5f3ec] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[420px] overflow-hidden lg:min-h-[620px]">
            <img
              key={activeSystem.image}
              src={activeSystem.image}
              alt={activeSystem.alt}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,23,23,0.06)_35%,rgba(10,23,23,0.82)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white sm:p-8">
              <div>
                <p className="text-[10px] font-bold uppercase text-white/60">Sistema activo</p>
                <p className="mt-1 font-display text-3xl font-semibold">{activeSystem.label}</p>
              </div>
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/20 backdrop-blur-md">
                <ActiveIcon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
          </div>

          <div className="flex min-h-[520px] flex-col p-5 sm:p-8 lg:p-10">
            <div className="grid grid-cols-3 gap-1 rounded-md bg-[#d8ddd4] p-1" aria-label="Capas del Domo 50">
              {domeSystems.map((system) => {
                const Icon = system.icon;
                const active = system.id === activeId;
                return (
                  <button
                    key={system.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveId(system.id)}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] px-2 text-[10px] font-bold uppercase transition-colors ${
                      active ? "bg-[#18353b] text-white shadow-sm" : "text-[#53625d] hover:bg-white/65"
                    }`}
                  >
                    <Icon className="hidden h-4 w-4 sm:block" aria-hidden="true" />
                    {system.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-1 flex-col justify-center py-10" aria-live="polite">
              <p className="text-[10px] font-bold uppercase text-[#a44c36]">Capa {domeSystems.findIndex((system) => system.id === activeId) + 1} de 3</p>
              <h3 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight text-[#18353b] md:text-5xl">
                {activeSystem.title}
              </h3>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#5e6964]">{activeSystem.description}</p>
              <ul className="mt-8 space-y-4 border-t border-[#18353b]/12 pt-7">
                {activeSystem.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#344b49]">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c96549]/12 text-[#a44c36]">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/paracas-dome/ofertas"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#bb5638] px-6 text-xs font-bold uppercase text-white transition-colors hover:bg-[#9e452d]"
            >
              Comparar configuraciones
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const EnvironmentalSystemsSection: React.FC = () => (
  <section id="sistemas" className="scroll-mt-24 bg-[#18353b] py-20 text-white md:py-28">
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
        <SectionHeading
          eyebrow="Diseño responsable"
          title="Menos discurso. Más decisiones que se pueden revisar."
          description="Moon distingue lo que forma parte del proyecto, lo que se configura y lo que depende de cada paquete. Esa claridad también es sostenibilidad."
          inverse
        />
        <div className="flex items-start gap-4 border-l border-white/15 pl-5 text-xs leading-6 text-white/60">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#f0b08c]" aria-hidden="true" />
          <p>
            Estos son criterios y componentes del proyecto, no certificaciones ambientales. Su alcance final se formaliza en la ficha técnica y el contrato aplicable.
          </p>
        </div>
      </div>

      <div className="mt-12 grid border-l border-t border-white/15 sm:grid-cols-2 xl:grid-cols-4">
        {environmentalSystems.map((system) => {
          const Icon = system.icon;
          return (
            <article key={system.title} className="flex min-h-[330px] flex-col border-b border-r border-white/15 p-7 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <Icon className="h-6 w-6 text-[#f0b08c]" aria-hidden="true" />
                <span className="rounded-sm border border-white/15 px-2 py-1 text-[9px] font-bold uppercase text-white/55">{system.status}</span>
              </div>
              <p className="mt-10 font-display text-4xl font-semibold text-[#f2c4a8]">{system.metric}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">{system.title}</h3>
              <p className="mt-auto pt-6 text-xs leading-6 text-white/58">{system.text}</p>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);
