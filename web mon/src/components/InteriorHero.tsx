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
    <section className="relative isolate overflow-hidden border-b border-[#E8E1D5] bg-[#FAF8F5]">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_22%,rgba(200,91,62,0.10),transparent_27%),radial-gradient(circle_at_15%_95%,rgba(197,160,89,0.12),transparent_30%)]" aria-hidden="true" />
      <div className="absolute inset-y-0 left-[8%] -z-10 w-px bg-[#E8E1D5]" aria-hidden="true" />
      <div className="absolute inset-y-0 right-[8%] -z-10 w-px bg-[#E8E1D5]" aria-hidden="true" />

      <div className="mx-auto grid min-h-[320px] max-w-[1400px] items-end gap-8 px-5 pb-12 pt-12 sm:px-8 sm:pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)] lg:px-12 lg:pb-16 lg:pt-20">
        <div className="max-w-4xl">
          <div className="mb-8 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#A84F36]">
            <span className="h-px w-10 bg-[#C85B3E]" aria-hidden="true" />
            {eyebrow}
          </div>
          <h1 className="moon-display max-w-3xl font-medium text-[#1C1612]">
            {title}
          </h1>
          <p className="mt-8 max-w-2xl text-sm leading-7 text-[#3D352E] sm:text-base sm:leading-8">
            {description}
          </p>
        </div>

        <div className="border-t border-[#E8E1D5] pt-5 lg:mb-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#786F66]">{index}</p>
          {aside ?? (
            <p className="mt-4 max-w-xs font-display text-2xl leading-tight text-[#3D352E]">
              Decidir con contexto, evidencia y calma.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
