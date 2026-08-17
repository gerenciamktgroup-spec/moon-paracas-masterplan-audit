import { useState } from "react";
import { Check, Heart, MapPin, Share2, X } from "lucide-react";
import { Lot } from "../types/map";

interface LotShortlistProps {
  lots: Lot[];
  favoriteIds: string[];
  maxItems: number;
  onSelect: (lot: Lot) => void;
  onRemove: (lotId: string) => void;
  onShare: () => Promise<"shared" | "copied" | "unavailable">;
}

const formatPen = (value: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(value);

export function LotShortlist({ lots, favoriteIds, maxItems, onSelect, onRemove, onShare }: LotShortlistProps) {
  const [shareStatus, setShareStatus] = useState<"idle" | "success" | "error">("idle");
  const shortlistedLots = favoriteIds.map((id) => lots.find((lot) => lot.id === id)).filter((lot): lot is Lot => Boolean(lot));

  const handleShare = async () => {
    try {
      const result = await onShare();
      setShareStatus(result === "unavailable" ? "error" : "success");
    } catch {
      setShareStatus("error");
    }
    window.setTimeout(() => setShareStatus("idle"), 3500);
  };

  return (
    <section className="mx-auto w-full max-w-[1200px] rounded-md border border-white/10 bg-[#162220] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.2)] sm:p-7" aria-label="Lotes favoritos">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f0b08c]"><Heart className="h-4 w-4" /> Mi selección · {shortlistedLots.length}/{maxItems}</p>
          <h2 className="mt-2 font-display text-2xl font-medium text-white">Tu lista corta para decidir mejor</h2>
          <p className="mt-2 text-xs leading-5 text-white/48">Guarda hasta cinco lotes en este dispositivo y comparte un enlace sin enviar datos personales.</p>
        </div>
        <button type="button" onClick={handleShare} disabled={!shortlistedLots.length} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/15 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-35">
          {shareStatus === "success" ? <Check className="h-4 w-4 text-[#9bc693]" /> : <Share2 className="h-4 w-4" />}
          {shareStatus === "success" ? "Enlace listo" : shareStatus === "error" ? "No se pudo compartir" : "Compartir selección"}
        </button>
      </div>

      {shortlistedLots.length ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {shortlistedLots.map((lot) => (
            <article key={lot.id} className="relative rounded-sm border border-white/10 bg-[#101a1b] p-4 transition-colors hover:border-[#d5aa83]/40">
              <button type="button" onClick={() => onRemove(lot.id)} className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/45 hover:bg-white/10 hover:text-white" aria-label={`Quitar lote ${lot.number} de favoritos`}><X className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => onSelect(lot)} className="block w-full pr-7 text-left">
                <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#E2725B]">{lot.typology.replace("tiny-house", "tiny house")}</span>
                <strong className="mt-2 block font-display text-xl text-white">Lote {lot.number}</strong>
                <span className="mt-2 flex items-center gap-1 text-[10px] text-[#E1D9C1]/50"><MapPin className="h-3 w-3" /> {lot.blockId} · {Math.round(lot.areaM2)} m²</span>
                <span className="mt-3 block text-xs font-semibold text-white/80">{formatPen(lot.price)}</span>
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-sm border border-dashed border-white/12 px-4 py-7 text-center text-xs text-white/42">Selecciona un lote en el plano y usa “Guardar en mi selección”.</p>
      )}
    </section>
  );
}
