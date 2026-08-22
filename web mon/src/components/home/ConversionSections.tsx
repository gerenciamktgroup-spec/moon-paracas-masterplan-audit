import React from "react";
import {
  Leaf,
  LineChart,
  MapPin,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";

const steps = [
  { title: "Conversa", text: "Cuéntanos qué tipo de lote o inversión buscas.", icon: Users },
  { title: "Explora", text: "Revisa el Masterplan y compara ubicaciones en el predio.", icon: MapPin },
  { title: "Elige", text: "Selecciona tu lote de 120 m² o doble y tu plan de cuotas.", icon: LineChart },
  { title: "Formaliza", text: "Revisa el contrato notarial y firma tu adjudicación.", icon: ShieldCheck },
  { title: "Pertenece", text: "Ingresa a la comunidad de propietarios Moon Paracas.", icon: Sun },
];

const benefits = [
  { title: "Ubicación singular", text: "Pampa inland de Ica: cerros bajos, cielo grande y reserva cercana.", icon: MapPin },
  { title: "Sostenibilidad real", text: "Energía solar, paisajismo xerófilo y soluciones de bajo impacto.", icon: Leaf },
  { title: "Comunidad", text: "Una escala humana para compartir sin perder privacidad.", icon: Users },
  { title: "Inversión tangible", text: "Un activo vinculado a tierra, arquitectura y experiencia.", icon: LineChart },
  { title: "Vida sin cercos", text: "Continuidad visual y una relación más libre con el paisaje.", icon: Sun },
  { title: "Proceso acompañado", text: "Información clara y asistencia desde la elección hasta la firma.", icon: ShieldCheck },
];

export const PurchaseProcessSection: React.FC = () => (
  <section data-testid="purchase-process" className="bg-[#F4EFE6] py-20 md:py-28">
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
      <SectionHeading
        eyebrow="El proceso"
        title="Cinco pasos. Una decisión acompañada."
        description="Del primer contacto a la incorporación a la comunidad, cada etapa está diseñada para que avances con información y control."
      />
      <ol className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="group relative flex min-h-[190px] flex-col overflow-hidden border border-[#E8E1D5] bg-white p-5 sm:min-h-[245px] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="font-display text-3xl text-[#C5A059]">{`0${index + 1}`}</span>
              </div>
              <div className="mt-auto pt-5 sm:pt-8">
                <h3 className="mt-2 font-display text-2xl font-semibold text-[#1C1612]">{step.title}</h3>
                <p className="mt-3 text-xs leading-6 text-[#786F66]">{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-lg border border-[#1C1612]/12 bg-[#1C1612] p-5 text-white sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="font-display italic text-lg text-[#C5A059]">El predio</p>
          <p className="mt-2 font-display text-2xl font-semibold">Ubicaciones, precios y disponibilidad.</p>
        </div>
        <Link to="/simulador" className="inline-flex items-center border-b border-[#C5A059]/70 pb-1 font-display text-2xl text-white hover:border-[#C5A059]">Ver el predio</Link>
      </div>
    </div>
  </section>
);

export const BenefitsSection: React.FC = () => (
  <>
    <section className="bg-[#FAF8F5] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Por qué Moon Paracas"
          title="Un proyecto que suma valor sin quitarle verdad al lugar."
          align="center"
        />
        <div className="mt-14 grid border-l border-t border-[#1C1612]/15 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="min-h-[220px] border-b border-r border-[#1C1612]/15 p-7 sm:p-9">
                <Icon className="h-6 w-6 text-[#b55034]" aria-hidden="true" />
                <h3 className="mt-7 font-display text-2xl font-semibold text-[#1C1612]">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#606761]">{benefit.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>

    <section className="bg-[#1C1612] py-16 text-[#FAF8F5] md:py-20">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
        <p className="font-display italic text-xl text-[#C5A059]">Carta</p>
        <h2 className="moon-title mt-3 font-semibold">La primera generación está tomando forma.</h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#F4EFE6]/72">
          Este espacio espera las historias de quienes elijan primero su lugar en la pampa.
        </p>
        <a href="#contacto" className="mt-8 inline-flex items-center border-b border-[#C5A059]/70 pb-1 font-display text-2xl text-[#FAF8F5] hover:border-[#C5A059]">
          Escribir
        </a>
      </div>
    </section>
  </>
);
