import React, { useState, useRef, useMemo, useEffect } from "react";
import { Lot, MasterplanScene } from "../../types/map";
import { centroid, pathFromPolygon } from "../../lib/geometry";
import {
  Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Home, Filter,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown,
  X, ChevronLeft, MessageCircle, Search,
} from "lucide-react";
import { LotsLayer } from "./layers/LotsLayer";
import { MapDetailLevel } from "./mapVisuals";
import { PROJECT, whatsappHref } from "../../config/project";

// ── The masterplan model generates all polygons in a 730 × 820 SVG space ──
const SVG_W = 730;
const SVG_H = 820;

interface MapCanvasProps {
  scene: MasterplanScene;
  visibleLots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot | null) => void;
}

export function MapCanvas({
  scene,
  visibleLots,
  selectedLot,
  onSelectLot,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeZone, setActiveZone] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [baseMap, setBaseMap] = useState<"masterplan" | "satellite">("masterplan");
  const [activeTab, setActiveTab] = useState<"lotes" | "areas">("lotes");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const detailLevel: MapDetailLevel = useMemo(() => {
    if (transform.scale > 1.8) return "close";
    if (transform.scale > 1.25) return "detail";
    return "overview";
  }, [transform.scale]);

  // Filter lots by search query (e.g. searching "15" or "Mz. A")
  const filteredLots = useMemo(() => {
    if (!searchQuery.trim()) return visibleLots;
    const q = searchQuery.toLowerCase().trim();
    return visibleLots.filter(
      (lot) =>
        lot.number.toString().includes(q) ||
        (lot.blockId && lot.blockId.toLowerCase().includes(q)) ||
        lot.id.toLowerCase().includes(q)
    );
  }, [visibleLots, searchQuery]);

  // Auto-center viewport on selected lot using real polygon centroid
  useEffect(() => {
    if (!selectedLot?.polygon || selectedLot.polygon.length < 3) return;
    const pt = centroid(selectedLot.polygon);
    // Map from SVG space to transform offset: center SVG at (SVG_W/2, SVG_H/2)
    const cx = SVG_W / 2;
    const cy = SVG_H / 2;
    setTransform((prev) => ({
      scale: Math.max(prev.scale, 2.0),
      x: (cx - pt.x) * Math.max(prev.scale, 2.0) / prev.scale,
      y: (cy - pt.y) * Math.max(prev.scale, 2.0) / prev.scale,
    }));
  }, [selectedLot]);

  const handleZoom = (factor: number) => {
    setTransform((prev) => {
      const newScale = Math.min(Math.max(prev.scale * factor, 0.8), 4.0);
      return { ...prev, scale: newScale };
    });
  };

  const handlePanStep = (dx: number, dy: number) => {
    setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };

  const handleReset = () => {
    setTransform({ scale: 1, x: 0, y: 0 });
    setActiveZone("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  // Jump to specific Aldea zone — offsets tuned to 730×820 space
  const jumpToZone = (zone: string) => {
    setActiveZone(zone);
    switch (zone) {
      case "c1": // Aldea 1 (Norte / Arriba-Izquierda)
        setTransform({ scale: 1.8, x: 140, y: 120 });
        break;
      case "c2": // Aldea 2 (Este / Arriba-Derecha)
        setTransform({ scale: 1.8, x: -140, y: 120 });
        break;
      case "c3": // Aldea 3 (Sur / Abajo-Derecha)
        setTransform({ scale: 1.8, x: -140, y: -120 });
        break;
      case "c4": // Aldea 4 (Oeste / Abajo-Izquierda)
        setTransform({ scale: 1.8, x: 140, y: -120 });
        break;
      case "oasis": // Oasis Central
        setTransform({ scale: 2.4, x: 0, y: 0 });
        break;
      default:
        setTransform({ scale: 1, x: 0, y: 0 });
    }
  };

  // Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };
  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(e.deltaY < 0 ? 1.15 : 0.88);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => undefined);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => undefined);
      setIsFullscreen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available": return { label: "Disponible", bg: "bg-[#3E704D]/20 text-[#60A373] border-[#60A373]/40" };
      case "reserved":  return { label: "Reservado",  bg: "bg-[#C48F54]/20 text-[#E2AA6E] border-[#E2AA6E]/40" };
      case "offer":     return { label: "En Oferta",  bg: "bg-[#C85B3E]/20 text-[#F08264] border-[#F08264]/40" };
      case "sold":      return { label: "Vendido",    bg: "bg-[#E57373]/20 text-[#E57373] border-[#E57373]/40" };
      case "blocked":   return { label: "Bloqueado",  bg: "bg-[#455451]/20 text-[#8E9B98] border-[#8E9B98]/40" };
      default:          return { label: "Disponible", bg: "bg-[#3E704D]/20 text-[#60A373] border-[#60A373]/40" };
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* ── SECTION TITLE (Renacer style) ── */}
      <div className="mb-3 text-center">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-[#82ba8d]">
          MASTERPLAN INTERACTIVO
        </h2>
      </div>

      <div
        ref={containerRef}
        className={`relative h-[650px] w-full select-none overflow-hidden rounded-xl border border-white/15 bg-[#0a1110] shadow-[0_25px_80px_rgba(0,0,0,0.8)] md:h-[720px] ${
          isFullscreen ? "fixed inset-0 z-50 h-screen w-screen rounded-none" : ""
        }`}
      >
        {/* ── TOP LEFT TABS & QUICK SEARCH ── */}
        <div className="pointer-events-auto absolute top-3 left-3 z-30 flex items-center gap-2">
          <div className="flex items-center rounded-full border border-white/20 bg-[#080d0e]/92 p-1 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("areas")}
              className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase transition ${
                activeTab === "areas" ? "bg-white text-[#080d0e] shadow" : "text-white/70 hover:bg-white/10"
              }`}
            >
              Áreas Comunes
            </button>
            <button
              onClick={() => setActiveTab("lotes")}
              className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase transition ${
                activeTab === "lotes" ? "bg-[#7a9e58] text-white shadow" : "text-white/70 hover:bg-white/10"
              }`}
            >
              Lotes
            </button>
          </div>

          {/* Quick Lot Search Input */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-white/20 bg-[#080d0e]/92 px-3 py-1.5 backdrop-blur-md">
            <Search className="h-3.5 w-3.5 text-white/50" />
            <input
              type="text"
              placeholder="Buscar Lote (ej. 15)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[10px] font-bold text-white placeholder-white/40 focus:outline-none w-28"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-white/50 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── TOP CENTER STATUS FILTER BAR ── */}
        <div className="pointer-events-auto absolute top-3 left-1/2 z-30 hidden sm:flex -translate-x-1/2 flex-wrap items-center gap-1.5 rounded-full border border-white/15 bg-[#080d0e]/94 px-4 py-1.5 shadow-2xl backdrop-blur-md">
          <span className="mr-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
            <Filter className="h-3 w-3 text-[#c5a059]" /> ESTADO:
          </span>
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase transition ${
              statusFilter === "all" ? "bg-white text-[#080d0e]" : "text-white/70 hover:bg-white/10"
            }`}
          >
            TODOS
          </button>
          <button
            onClick={() => setStatusFilter("available")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase transition ${
              statusFilter === "available" ? "bg-[#3E704D] text-white shadow" : "text-[#73A982] hover:bg-[#3E704D]/30"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#60A373]" /> DISPONIBLE
          </button>
          <button
            onClick={() => setStatusFilter("reserved")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase transition ${
              statusFilter === "reserved" ? "bg-[#C48F54] text-white shadow" : "text-[#E2AA6E] hover:bg-[#C48F54]/30"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#E2AA6E]" /> RESERVADO
          </button>
          <button
            onClick={() => setStatusFilter("offer")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase transition ${
              statusFilter === "offer" ? "bg-[#C85B3E] text-white shadow" : "text-[#F08264] hover:bg-[#C85B3E]/30"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#F08264]" /> EN OFERTA
          </button>
          <button
            onClick={() => setStatusFilter("sold")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase transition ${
              statusFilter === "sold" ? "bg-[#2B3634] text-white shadow" : "text-white/50 hover:bg-white/10"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#E57373]" /> VENDIDO
          </button>
        </div>

        {/* ── TOP RIGHT ALDEA SECTOR QUICK JUMP ── */}
        <div className="pointer-events-auto absolute top-3 right-3 z-30 hidden md:flex items-center gap-1 rounded-full border border-[#c5a059]/40 bg-[#080d0e]/92 px-2 py-1 backdrop-blur-md">
          <button onClick={() => jumpToZone("c1")} className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase transition ${activeZone === "c1" ? "bg-[#7a9e58] text-white" : "text-[#7a9e58] hover:bg-white/10"}`}>ALDEA 1</button>
          <button onClick={() => jumpToZone("c2")} className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase transition ${activeZone === "c2" ? "bg-[#d4a34b] text-[#080d0e]" : "text-[#d4a34b] hover:bg-white/10"}`}>ALDEA 2</button>
          <button onClick={() => jumpToZone("c3")} className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase transition ${activeZone === "c3" ? "bg-[#d4734b] text-white" : "text-[#d4734b] hover:bg-white/10"}`}>ALDEA 3</button>
          <button onClick={() => jumpToZone("c4")} className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase transition ${activeZone === "c4" ? "bg-[#9c8470] text-white" : "text-[#9c8470] hover:bg-white/10"}`}>ALDEA 4</button>
          <button onClick={() => jumpToZone("oasis")} className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase transition ${activeZone === "oasis" ? "bg-[#54a8cf] text-white" : "text-[#54a8cf] hover:bg-white/10"}`}>OASIS</button>
        </div>

        {/* ── BOTTOM LEFT BASEMAP THUMBNAIL (Satelital / Render) ── */}
        <div className="pointer-events-auto absolute bottom-4 left-4 z-30">
          <button
            onClick={() => setBaseMap((prev) => (prev === "masterplan" ? "satellite" : "masterplan"))}
            className="flex flex-col items-center overflow-hidden rounded-lg border border-white/30 bg-[#080d0e]/90 shadow-xl transition-all hover:scale-105 active:scale-95"
            title="Cambiar entre plano máster y vista satelital"
          >
            <div className="h-12 w-16 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${baseMap === "masterplan" ? "/images/masterplan_bg.png" : "/images/masterplan-v3-commercial.png"})` }}>
              <div className="h-full w-full bg-black/30 backdrop-brightness-90" />
            </div>
            <span className="w-full bg-[#080d0e] py-1 text-center text-[9px] font-bold uppercase tracking-wider text-white">
              {baseMap === "masterplan" ? "Satelital" : "Masterplan"}
            </span>
          </button>
        </div>

        {/* ── BOTTOM STATUS LEGEND BAR ── */}
        <div className="pointer-events-auto absolute bottom-4 left-24 sm:left-28 z-30 hidden lg:flex items-center gap-2 rounded-full border border-white/15 bg-[#080d0e]/94 px-4 py-2 shadow-2xl backdrop-blur-md">
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-[#73A982]">🚩 Disponible</span>
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-[#E2AA6E]">🚩 Reservado</span>
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-[#F08264]">🚩 Vendido</span>
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-[#8E9B98]">🚩 Bloqueado</span>
        </div>

        {/* ── BOTTOM NAVIGATION CONTROLS BAR ── */}
        <div className="pointer-events-auto absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-[#080d0e]/94 p-1.5 shadow-2xl backdrop-blur-md">
          <button onClick={handleReset} className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25" title="Vista Inicio">
            <Home className="h-4 w-4" />
          </button>
          <button onClick={() => handlePanStep(40, 0)} className="rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/25" title="Mover Izquierda">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button onClick={() => handlePanStep(-40, 0)} className="rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/25" title="Mover Derecha">
            <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => handlePanStep(0, 40)} className="rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/25" title="Mover Arriba">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button onClick={() => handlePanStep(0, -40)} className="rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/25" title="Mover Abajo">
            <ArrowDown className="h-4 w-4" />
          </button>
          <button onClick={() => handleZoom(1.15)} className="rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/25" title="Inclinación +">
            <ChevronsUp className="h-4 w-4 text-[#82ba8d]" />
          </button>
          <button onClick={() => handleZoom(0.88)} className="rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/25" title="Inclinación -">
            <ChevronsDown className="h-4 w-4 text-[#82ba8d]" />
          </button>
          <button onClick={() => handleZoom(1.2)} className="rounded-full bg-white/10 p-2 text-[#e5c158] transition hover:bg-white/25" title="Acercar (+)">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={() => handleZoom(0.8)} className="rounded-full bg-white/10 p-2 text-[#e5c158] transition hover:bg-white/25" title="Alejar (-)">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button onClick={toggleFullscreen} className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25" title="Pantalla Completa">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* ── RIGHT-SIDE DRAWER MODAL OVERLAY ON LOT SELECTION ── */}
        {selectedLot && (() => {
          const badge = getStatusBadge(selectedLot.status);
          const lotBlock = selectedLot.blockId ? selectedLot.blockId.replace("C", "Mz. ") : "Mz. A";
          const waMsg = `Hola! Quisiera información del Lote ${selectedLot.number} (${lotBlock}) en ${PROJECT.name}.`;

          return (
            <div className="pointer-events-auto absolute top-4 right-4 z-40 w-80 max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-white/20 bg-[#0c1413]/95 p-5 text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <button onClick={() => onSelectLot(null)} className="flex items-center gap-1 text-[11px] font-bold text-white/70 hover:text-white transition">
                  <ChevronLeft className="h-4 w-4" /> Volver
                </button>
                <button onClick={() => onSelectLot(null)} className="rounded-full bg-white/10 p-1 text-white/60 hover:bg-white/20 hover:text-white transition">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4">
                <h3 className="font-display text-lg font-bold text-[#82ba8d]">{PROJECT.name}</h3>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-base font-semibold text-white">{lotBlock} - Lote {selectedLot.number}</p>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${badge.bg}`}>{badge.label}</span>
                </div>
                <p className="mt-0.5 text-[11px] font-medium text-white/60">Etapa 1 · Paracas, Ica</p>
              </div>

              <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5"><span className="text-white/60">Tipología</span><span className="font-bold text-white capitalize">{selectedLot.typology}</span></div>
                <div className="flex justify-between py-1 border-b border-white/5"><span className="text-white/60">Área de Parcela</span><span className="font-bold text-white">{selectedLot.areaM2.toFixed(2)} m²</span></div>
                {selectedLot.dimensions && <div className="flex justify-between py-1 border-b border-white/5"><span className="text-white/60">Dimensiones</span><span className="font-bold text-white text-right max-w-[60%]">{selectedLot.dimensions}</span></div>}
                <div className="flex justify-between py-1 border-b border-white/5"><span className="text-white/60">Domo Geodésico</span><span className="font-bold text-[#82ba8d]">Ø{selectedLot.recommendedDomeDiameterM ?? 8} · {selectedLot.fitsDome8m ? "50.00" : "12.57"} m²</span></div>
                {selectedLot.price > 0 && <div className="flex justify-between py-1 border-b border-white/5"><span className="text-white/60">Precio Preventa</span><span className="font-bold text-[#c5a059]">S/ {selectedLot.price.toLocaleString()}</span></div>}
              </div>

              <div className="mt-5 space-y-2">
                <a href={whatsappHref(waMsg)} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-display text-xs font-bold text-white shadow-lg transition hover:bg-[#20ba59] active:scale-95">
                  <MessageCircle className="h-4 w-4 fill-current" /> Contáctanos por WhatsApp
                </a>
              </div>
            </div>
          );
        })()}

        {/* ── MAIN INTERACTIVE VIEWPORT ── */}
        <div
          className="h-full w-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div
            className="relative h-full w-full origin-center transition-transform duration-150 ease-out"
            style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
          >
            {/* SVG Viewport (730×820) */}
            <svg
              className="h-full w-full pointer-events-auto"
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="mp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(197,160,89,0.03)" strokeWidth="0.5" />
                </pattern>
              </defs>

              {/* ── Background Google Earth Satellite / Render Image ── */}
              <image
                href={baseMap === "masterplan" ? "/images/masterplan_bg.png" : "/images/masterplan-v3-commercial.png"}
                x="0"
                y="0"
                width={SVG_W}
                height={SVG_H}
                preserveAspectRatio="xMidYMid slice"
                opacity={0.92}
              />

              {/* Grid overlay */}
              <rect width={SVG_W} height={SVG_H} fill="url(#mp-grid)" pointerEvents="none" />

              {/* ── Green Hedge Block Boundaries (Cerco vivo perimetral) ── */}
              {scene.blocks.map((block) => (
                <path
                  key={block.id}
                  d={pathFromPolygon(block.polygon)}
                  fill="none"
                  stroke="#7a9e58"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  opacity="0.85"
                  pointerEvents="none"
                />
              ))}

              {/* ── Interactive lot hotspots — 282 polygons from real model ── */}
              <LotsLayer
                lots={filteredLots}
                selectedLotId={selectedLot?.id}
                onSelect={onSelectLot}
                colorMode="status"
                detailLevel={detailLevel}
                baseMap="roadmap"
                filterStatus={statusFilter}
              />

              {/* ── Selected lot pulsing yellow ring ── */}
              {selectedLot?.polygon && selectedLot.polygon.length >= 3 && (() => {
                const pt = centroid(selectedLot.polygon);
                return (
                  <g transform={`translate(${pt.x}, ${pt.y})`} pointerEvents="none">
                    <circle r="14" fill="none" stroke="#FFD700" strokeWidth="2.5" className="animate-ping opacity-70" />
                    <circle r="6"  fill="#FFD700" stroke="#FFF" strokeWidth="1.5" />
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
