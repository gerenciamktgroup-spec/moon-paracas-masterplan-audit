import { useState } from "react";
import { ArrowLeft, CircleGauge, House, Sparkles } from "lucide-react";
import { Lot } from "../../types/map";
import { TYPOLOGY_VISUALS } from "./mapVisuals";

type DomeConceptPanelProps = {
  selectedLot: Lot | null;
  onBackToMap: () => void;
};

type SceneId = "exterior" | "interior" | "patio";

const scenes = [
  {
    id: "exterior" as const,
    label: "Exterior",
    title: "Arquitectura que acompaña el paisaje",
    image: "/images/domo_ext_1.png",
    alt: "Domo conceptual con pérgola solar y jardín de bajo consumo hídrico",
  },
  {
    id: "interior" as const,
    label: "Interior",
    title: "Dormir con el horizonte a la vista",
    image: "/media/interior_dome_sunrise.png",
    alt: "Interior conceptual de domo orientado hacia el paisaje desértico",
  },
  {
    id: "patio" as const,
    label: "Patio",
    title: "El exterior también forma parte de la casa",
    image: "/media/plunge_pool_breakfast.png",
    alt: "Patio conceptual de piedra con piscina y vista al desierto",
  },
] as const;

const areaFormatter = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 });

function DomeScaleDiagram() {
  return (
    <svg viewBox="0 0 240 150" className="h-auto w-full" role="img" aria-label="Comparación conceptual de huellas circulares de cuatro y ocho metros">
      <defs>
        <radialGradient id="dome-volume" cx="36%" cy="28%">
          <stop offset="0%" stopColor="#fff4df" stopOpacity="0.96" />
          <stop offset="72%" stopColor="#d38a69" stopOpacity="0.68" />
          <stop offset="100%" stopColor="#874a3c" stopOpacity="0.58" />
        </radialGradient>
      </defs>
      <path d="M22 129H218" stroke="rgba(255,255,255,.16)" />
      <circle cx="82" cy="92" r="35" fill="url(#dome-volume)" stroke="#f0b08c" strokeWidth="1.5" />
      <path d="M47 92 82 57l35 35M55 111l27-54 27 54M47 92h70M58 70l48 42M106 70l-48 42" fill="none" stroke="rgba(28,52,55,.72)" strokeWidth="1" />
      <circle cx="169" cy="106" r="18" fill="rgba(226,211,183,.22)" stroke="rgba(226,211,183,.72)" />
      <path d="M151 106h36M169 88v36" stroke="rgba(226,211,183,.55)" strokeDasharray="3 3" />
      <text x="82" y="144" textAnchor="middle" fill="#f5dbc8" fontSize="10" fontWeight="700">Ø8 m · 50,3 m²</text>
      <text x="169" y="144" textAnchor="middle" fill="rgba(255,255,255,.58)" fontSize="10" fontWeight="700">Ø4 m · 12,6 m²</text>
    </svg>
  );
}

export function DomeConceptPanel({ selectedLot, onBackToMap }: DomeConceptPanelProps) {
  const [activeSceneId, setActiveSceneId] = useState<SceneId>("exterior");
  const activeScene = scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];
  const activeLot = selectedLot && !selectedLot.typology.startsWith("parking") ? selectedLot : null;
  const typologyLabel = activeLot ? (TYPOLOGY_VISUALS[activeLot.typology]?.label ?? "Lote residencial") : null;

  return (
    <div data-testid="dome-concept-panel" className="flex min-h-[580px] flex-1 flex-col bg-[#0d1617] lg:grid lg:grid-cols-[minmax(0,1.48fr)_minmax(310px,0.52fr)]">
      <div className="relative min-h-[480px] overflow-hidden lg:min-h-0">
        <img
          key={activeScene.image}
          src={activeScene.image}
          alt={activeScene.alt}
          className="absolute inset-0 h-full w-full object-cover motion-safe:animate-[fade-in_.45s_ease-out]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,16,17,0.08)_28%,rgba(8,16,17,0.92)_100%)]" />

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#101a1b]/72 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white/75 backdrop-blur-md sm:left-6 sm:top-6">
          <Sparkles className="h-3.5 w-3.5 text-[#f0b08c]" aria-hidden="true" /> Inspiración arquitectónica
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <div aria-live="polite">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#f0b08c]">{activeScene.label}</p>
            <h3 className="mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">{activeScene.title}</h3>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2" role="tablist" aria-label="Escenas conceptuales del domo">
            {scenes.map((scene) => {
              const isActive = scene.id === activeSceneId;
              return (
                <button
                  key={scene.id}
                  type="button"
                  data-scene-id={scene.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveSceneId(scene.id)}
                  className={`group/thumb relative min-h-16 overflow-hidden rounded border text-left transition ${isActive ? "border-[#f0b08c]" : "border-white/18 hover:border-white/55"}`}
                >
                  <img src={scene.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform group-hover/thumb:scale-105" />
                  <span className={`absolute inset-0 ${isActive ? "bg-[#102225]/28" : "bg-[#071011]/58"}`} />
                  <span className="absolute inset-x-0 bottom-0 px-2 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white">{scene.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="flex flex-col border-t border-white/10 bg-[#122122] p-5 text-white sm:p-7 lg:border-l lg:border-t-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#f0b08c]">Del lote a la experiencia</p>
        <h3 className="mt-3 font-display text-3xl font-semibold leading-tight">Un domo, un patio, todo el cielo.</h3>
        <p className="mt-4 text-xs leading-6 text-white/58">
          La geometría circular libera terreno para sombra, jardín seco y una vida exterior más generosa. Puedes empezar compacto o proyectar una pieza de mayor escala.
        </p>

        <div className="mt-5 rounded-md border border-white/10 bg-[#0d191a] p-3">
          <DomeScaleDiagram />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded border border-white/10 p-3">
            <CircleGauge className="h-4 w-4 text-[#f0b08c]" aria-hidden="true" />
            <strong className="mt-3 block font-display text-xl">282 / 282</strong>
            <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.12em] text-white/42">Cabida Ø8 verificada</span>
          </div>
          <div className="rounded border border-white/10 p-3">
            <House className="h-4 w-4 text-[#d7be8d]" aria-hidden="true" />
            <strong className="mt-3 block font-display text-xl">120–240 m²</strong>
            <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.12em] text-white/42">Cuatro tipologías</span>
          </div>
        </div>

        <div className="mt-5 rounded-md border border-[#f0b08c]/18 bg-[#f0b08c]/7 p-4">
          {activeLot ? (
            <>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#f0b08c]">Tu selección</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <strong className="font-display text-2xl">Lote {activeLot.number}</strong>
                  <p className="mt-1 text-[10px] text-white/50">{typologyLabel}</p>
                </div>
                <strong className="text-sm">{areaFormatter.format(activeLot.areaM2)} m²</strong>
              </div>
            </>
          ) : (
            <>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#f0b08c]">Primero, la ubicación</p>
              <p className="mt-2 text-xs leading-5 text-white/62">Vuelve al plano y elige un lote para ver aquí su área y compatibilidad.</p>
            </>
          )}
        </div>

        <button
          type="button"
          data-testid="back-to-map"
          onClick={onBackToMap}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#c85b3e] px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#ad4b32]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {activeLot ? "Volver al lote elegido" : "Elegir lote en el plano"}
        </button>

        <p className="mt-4 text-[9px] leading-4 text-white/34">
          Imágenes referenciales de arquitectura y paisajismo. La venta corresponde al lote; domo, piscina, pérgola y equipamiento se cotizan por separado.
        </p>
      </aside>
    </div>
  );
}
