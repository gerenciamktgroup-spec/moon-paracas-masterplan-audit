import type { ReactNode } from "react";

interface InteriorHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  index?: string;
  aside?: ReactNode;
}

export function InteriorHero({ eyebrow, title, description, index = "Moon Paracas", aside }: InteriorHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#101a1b]">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_22%,rgba(187,86,56,0.16),transparent_27%),radial-gradient(circle_at_15%_95%,rgba(210,170,120,0.08),transparent_30%)]" aria-hidden="true" />
      <div className="absolute inset-y-0 left-[8%] -z-10 w-px bg-white/[0.04]" aria-hidden="true" />
      <div className="absolute inset-y-0 right-[8%] -z-10 w-px bg-white/[0.04]" aria-hidden="true" />

      <div className="mx-auto grid min-h-[410px] max-w-[1400px] items-end gap-10 px-5 pb-14 pt-16 sm:px-8 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)] lg:px-12 lg:pb-20 lg:pt-24">
        <div className="max-w-4xl">
          <div className="mb-8 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#d5aa83]">
            <span className="h-px w-10 bg-[#bb5638]" aria-hidden="true" />
            {eyebrow}
          </div>
          <h1 className="max-w-4xl font-display text-[clamp(3.25rem,7vw,6.75rem)] font-medium leading-[0.88] tracking-[-0.045em] text-[#f5f1e8]">
            {title}
          </h1>
          <p className="mt-8 max-w-2xl text-sm leading-7 text-white/62 sm:text-base sm:leading-8">
            {description}
          </p>
        </div>

        <div className="border-t border-white/12 pt-5 lg:mb-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/35">{index}</p>
          {aside ?? (
            <p className="mt-4 max-w-xs font-display text-2xl leading-tight text-white/78">
              Decidir con contexto, evidencia y calma.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
