import { ArrowUpRight, Compass, FileSearch, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { trackEvent } from "../../lib/analytics";

const paths = [
  {
    number: "01",
    verb: "Vivir",
    icon: Heart,
    eyebrow: "Escapada con propósito",
    title: "Quiero venir, quedarme y volver.",
    text: "Empieza por cómo se siente el lugar, qué mantenimiento requiere y qué incluye realmente cada configuración.",
    href: "#experiencia",
    cta: "Descubrir la experiencia",
    accent: "#f0a17f",
    image: "/media/interior_dome_sunrise.png",
    alt: "Interior cálido orientado hacia el paisaje de Paracas",
    imagePosition: "object-center",
    imageScale: "group-hover:scale-[1.035]",
    tags: ["Uso personal", "Confort", "Bajo mantenimiento"],
  },
  {
    number: "02",
    verb: "Verificar",
    icon: FileSearch,
    eyebrow: "Patrimonio verificable",
    title: "Quiero decidir con números y documentos claros.",
    text: "Contrasta lote, precio, pagos y condiciones antes de separar. La visión inspira; el expediente confirma.",
    href: "/documentos",
    cta: "Revisar el expediente",
    accent: "#a8cfb4",
    image: "/images/masterplan-v4-commercial.png",
    alt: "Plano comercial V4 con cuatro aldeas, lotes, áreas y tipologías verificables",
    imagePosition: "object-[27%_center]",
    imageScale: "scale-[1.18] group-hover:scale-[1.21]",
    tags: ["Plano V4", "Precios", "Condiciones"],
  },
  {
    number: "03",
    verb: "Crear",
    icon: Sparkles,
    eyebrow: "Etapa Founder",
    title: "Quiero empezar hoy y construir por etapas.",
    text: "Define una base habitable y añade confort, autonomía o paisaje cuando tu manera de usar el lugar lo pida.",
    href: "/paracas-dome",
    cta: "Explorar Paracas Dome",
    accent: "#e1c083",
    image: "/media/stargazing_deck_night.png",
    alt: "Domo iluminado y terraza de observación bajo el cielo nocturno",
    imagePosition: "object-center",
    imageScale: "group-hover:scale-[1.035]",
    tags: ["Domo base", "Upgrades", "Por etapas"],
  },
] as const;

export function IntentPathSection() {
  return (
    <section data-testid="intent-path-section" className="relative overflow-hidden bg-[#e4e8df] py-20 text-[#18353b] md:py-24">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-[#18353b]/7" />
      <div className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 rounded-full border border-[#18353b]/7" />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-7 border-b border-[#18353b]/15 pb-9 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#a84f36]">
              <Compass className="h-4 w-4" aria-hidden="true" /> Elige tu punto de partida
            </p>
            <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[0.96] sm:text-5xl lg:text-6xl">
              Tres formas de hacer tuyo Paracas.
            </h2>
          </div>
          <div className="lg:justify-self-end">
            <p className="max-w-xl text-sm leading-7 text-[#5f6c66]">
              No todos buscan lo mismo. Elige la ruta que describe mejor tu decisión y te llevamos directo a la experiencia, los documentos o la configuración.
            </p>
            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.18em] text-[#18353b]/45">
              Tres rutas · Un mismo estándar de claridad
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {paths.map((path, index) => {
            const Icon = path.icon;
            const content = (
              <>
                <img
                  src={path.image}
                  alt={path.alt}
                  className={`absolute inset-0 h-full w-full object-cover ${path.imagePosition} ${path.imageScale} transition-transform duration-700`}
                  loading="lazy"
                />
                <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,18,19,0.12)_12%,rgba(7,18,19,0.42)_48%,rgba(7,18,19,0.98)_100%)]" />
                <span className="absolute inset-0 bg-[linear-gradient(110deg,rgba(8,19,20,0.32),transparent_50%)]" />

                <span className="relative flex items-start justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-[#0d1b1c]/48 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                    <Icon className="h-3.5 w-3.5" style={{ color: path.accent }} aria-hidden="true" /> {path.verb}
                  </span>
                  <span className="font-display text-3xl text-white/58">{path.number}</span>
                </span>

                <span className={`relative mt-auto block ${index === 0 ? "md:max-w-[470px] lg:max-w-none" : ""}`}>
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: path.accent }}>{path.eyebrow}</span>
                  <span className="mt-3 block font-display text-[1.7rem] font-semibold leading-[1.02] text-white lg:text-3xl">{path.title}</span>
                  <span className="mt-4 block text-[11px] leading-5 text-white/68 lg:text-xs lg:leading-6">{path.text}</span>

                  <span className="mt-5 flex flex-wrap gap-1.5">
                    {path.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/16 bg-white/7 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-white/66 backdrop-blur-sm">
                        {tag}
                      </span>
                    ))}
                  </span>

                  <span className="mt-6 flex items-center justify-between border-t border-white/18 pt-5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white">{path.cta}</span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#18353b] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </span>
                </span>
              </>
            );

            const className = `group relative isolate flex min-h-[500px] overflow-hidden rounded-md p-5 shadow-[0_22px_60px_rgba(19,42,42,0.13)] outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#b85d42] focus-visible:ring-offset-2 sm:p-6 md:min-h-[540px] lg:min-h-[590px] lg:col-span-1 lg:p-7 ${index === 0 ? "md:col-span-2" : ""}`;
            const label = `${path.cta}: ${path.title}`;

            return path.href.startsWith("/") ? (
              <Link
                key={path.number}
                to={path.href}
                data-testid="intent-card"
                aria-label={label}
                className={className}
                onClick={() => trackEvent("select_intent", { intent: path.eyebrow, destination: path.href })}
              >
                {content}
              </Link>
            ) : (
              <a
                key={path.number}
                href={path.href}
                data-testid="intent-card"
                aria-label={label}
                className={className}
                onClick={() => trackEvent("select_intent", { intent: path.eyebrow, destination: path.href })}
              >
                {content}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
