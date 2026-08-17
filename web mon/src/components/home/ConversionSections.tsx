import React from "react";
import {
  ArrowRight,
  BadgeCheck,
  Compass,
  FileSignature,
  Handshake,
  Leaf,
  LineChart,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";

const steps = [
  { title: "Conversa", text: "Cuéntanos qué tipo de experiencia buscas.", icon: MessageSquare },
  { title: "Explora", text: "Revisa el masterplan y compara ubicaciones.", icon: Compass },
  { title: "Elige", text: "Selecciona lote, paquete y forma de pago.", icon: BadgeCheck },
  { title: "Formaliza", text: "Revisa la documentación y firma tu adhesión.", icon: FileSignature },
  { title: "Pertenece", text: "Ingresa a la comunidad Moon Paracas.", icon: Handshake },
];

const benefits = [
  { title: "Ubicación singular", text: "Paracas reúne desierto, reserva natural y mar en un mismo horizonte.", icon: MapPin },
  { title: "Sostenibilidad real", text: "Energía solar, paisajismo xerófilo y soluciones de bajo impacto.", icon: Leaf },
  { title: "Comunidad", text: "Una escala humana para compartir sin perder privacidad.", icon: Users },
  { title: "Inversión tangible", text: "Un activo vinculado a tierra, arquitectura y experiencia.", icon: LineChart },
  { title: "Vida sin cercos", text: "Continuidad visual y una relación más libre con el paisaje.", icon: Sun },
  { title: "Proceso acompañado", text: "Información clara y asistencia desde la elección hasta la firma.", icon: ShieldCheck },
];

export const PurchaseProcessSection: React.FC = () => (
  <section data-testid="purchase-process" className="bg-[#dfe5dc] py-20 md:py-28">
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
      <SectionHeading
        eyebrow="El proceso de compra"
        title="Cinco pasos. Una decisión bien acompañada."
        description="Del primer contacto a la incorporación a la comunidad, cada etapa está diseñada para que avances con información y control."
      />
      <ol className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="group relative flex min-h-[190px] flex-col overflow-hidden rounded-lg border border-[#18353b]/12 bg-[#f3f3ec]/75 p-5 transition-all hover:-translate-y-1 hover:border-[#18353b]/25 hover:bg-white/80 hover:shadow-[0_18px_45px_rgba(24,53,59,0.08)] sm:min-h-[245px] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#18353b] text-[#f1b18e] shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-display text-4xl font-semibold text-[#18353b]/16">0{index + 1}</span>
              </div>
              <div className="mt-auto pt-5 sm:pt-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8d4936]">Paso {index + 1}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-[#18353b]">{step.title}</h3>
                <p className="mt-3 text-xs leading-6 text-[#606961]">{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-lg border border-[#18353b]/12 bg-[#18353b] p-5 text-white sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f0b08c]">Empieza con información real</p>
          <p className="mt-2 font-display text-2xl font-semibold">Explora ubicaciones, precios y disponibilidad.</p>
        </div>
        <Link to="/simulador" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#bb5638] px-5 text-[9px] font-bold uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 hover:bg-[#a64932]">Abrir masterplan <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </div>
  </section>
);

export const BenefitsSection: React.FC = () => (
  <>
    <section className="bg-[#f2f0e9] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Por qué Moon Paracas"
          title="Un proyecto que suma valor sin quitarle verdad al lugar."
          align="center"
        />
        <div className="mt-14 grid border-l border-t border-[#18353b]/15 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="min-h-[220px] border-b border-r border-[#18353b]/15 p-7 sm:p-9">
                <Icon className="h-6 w-6 text-[#b55034]" aria-hidden="true" />
                <h3 className="mt-7 font-display text-2xl font-semibold text-[#18353b]">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#606761]">{benefit.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>

    <section className="bg-[#8c4937] py-16 text-white md:py-20">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center px-5 text-center sm:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/65">Early Founders</p>
        <h2 className="mt-4 font-display text-4xl font-semibold md:text-5xl">La primera generación de Moon está tomando forma.</h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75">
          Este espacio está reservado para las historias verificadas de quienes elijan primero su lugar en el desierto.
        </p>
        <a
          href="#contacto"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-white px-7 text-xs font-bold uppercase tracking-[0.15em] text-[#7a3d2f] transition-colors hover:bg-[#f1ded2]"
        >
          Quiero ser Founder
        </a>
      </div>
    </section>
  </>
);
