import React, { useState, useRef, useMemo, useEffect } from "react";
import { Lot, MasterplanScene } from "../../types/map";
import { centroid } from "../../lib/geometry";
import { APIProvider, Map as GoogleMap, useMap } from "@vis.gl/react-google-maps";
import {
  Maximize2, Minimize2, ZoomIn, ZoomOut, Home, Menu,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  X, ChevronLeft, ChevronRight, MessageCircle, Layers, Compass
} from "lucide-react";
import { LotsLayer, STATUS_CONFIG } from "./layers/LotsLayer";
import { AmenitiesLayer, AmenityPin } from "./layers/AmenitiesLayer";
import { CustomSVGOverlay } from "./CustomSVGOverlay";
import { PROJECT, whatsappHref } from "../../config/project";

const SVG_W = 800;
const SVG_H = 800;

// Coordinates of Moon Paracas in Paracas, Ica, Perú
const MOON_PARACAS_COORDS = PROJECT.centerCoordinates; // { lat: -13.923861, lng: -76.159180 }

interface MapCanvasProps {
  scene: MasterplanScene;
  visibleLots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot | null) => void;
}

// Google Maps Pan/Zoom synchronizer component
function GoogleMapController({
  selectedLot,
  selectedAmenity,
}: {
  selectedLot: Lot | null;
  selectedAmenity: AmenityPin | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (selectedLot?.polygon && selectedLot.polygon.length >= 3) {
      // Smoothly pan towards center
      map.setZoom(18);
    }
  }, [selectedLot, map]);

  useEffect(() => {
    if (!map || !selectedAmenity) return;
    map.setZoom(18);
  }, [selectedAmenity, map]);

  return null;
}

export function MapCanvas({
  scene,
  visibleLots,
  selectedLot,
  onSelectLot,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Transform & View State
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Top Tabs: "areas" | "lotes"
  const [activeTab, setActiveTab] = useState<"areas" | "lotes">("lotes");

  // Menu / Entorno Drawer open state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Selected Amenity Pin for "areas" mode
  const [selectedAmenity, setSelectedAmenity] = useState<AmenityPin | null>(null);

  // Basemap style toggle: "google-satellite" | "google-hybrid" | "masterplan"
  const [baseMap, setBaseMap] = useState<"google-satellite" | "google-hybrid" | "masterplan">("google-satellite");
  const [isBasemapMenuOpen, setIsBasemapMenuOpen] = useState(false);

  // Active status filter (all | available | reserved | offer | sold | blocked)
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Active Aldea filter
  const [activeAldea, setActiveAldea] = useState<string>("all");

  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";
  const isGoogleMapsReady = Boolean(googleMapsKey);

  // Center viewport on selected lot using real centroid
  useEffect(() => {
    if (!selectedLot?.polygon || selectedLot.polygon.length < 3) return;
    const pt = centroid(selectedLot.polygon);
    const cx = SVG_W / 2;
    const cy = SVG_H / 2;
    setTransform({
      scale: 2.4,
      x: (cx - pt.x) * 2.4,
      y: (cy - pt.y) * 2.4,
    });
    setSelectedAmenity(null);
  }, [selectedLot]);

  // Center on selected amenity
  useEffect(() => {
    if (!selectedAmenity) return;
    const cx = SVG_W / 2;
    const cy = SVG_H / 2;
    setTransform({
      scale: 2.2,
      x: (cx - selectedAmenity.center.x) * 2.2,
      y: (cy - selectedAmenity.center.y) * 2.2,
    });
    onSelectLot(null);
  }, [selectedAmenity]);

  // Zoom controls
  const handleZoom = (factor: number) => {
    setTransform((prev) => {
      const newScale = Math.min(Math.max(prev.scale * factor, 0.75), 4.5);
      return { ...prev, scale: newScale };
    });
  };

  // Pan step
  const handlePanStep = (dx: number, dy: number) => {
    setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };

  // Reset Home
  const handleReset = () => {
    setTransform({ scale: 1, x: 0, y: 0 });
    onSelectLot(null);
    setSelectedAmenity(null);
    setIsMenuOpen(false);
    setStatusFilter("all");
    setActiveAldea("all");
  };

  // Quick jump to Aldea
  const jumpToSector = (sectorKey: string) => {
    setActiveAldea(sectorKey);
    setIsMenuOpen(false);
    switch (sectorKey) {
      case "A1": // Aldea 1 (Oeste)
        setTransform({ scale: 1.9, x: 230, y: 0 });
        break;
      case "A2": // Aldea 2 (Norte)
        setTransform({ scale: 1.9, x: 0, y: 230 });
        break;
      case "A3": // Aldea 3 (Este)
        setTransform({ scale: 1.9, x: -230, y: 0 });
        break;
      case "A4": // Aldea 4 (Sur)
        setTransform({ scale: 1.9, x: 0, y: -180 });
        break;
      case "OASIS": // Oasis Central
        setTransform({ scale: 2.5, x: 0, y: 0 });
        break;
      case "PARKING": // Cocheras
        setTransform({ scale: 2.3, x: 0, y: -310 });
        break;
      default:
        setTransform({ scale: 1, x: 0, y: 0 });
    }
  };

  // Mouse drag pan
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

  // Wheel zoom via native non-passive listener
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.14 : 0.88;
      setTransform((prev) => {
        const newScale = Math.min(Math.max(prev.scale * factor, 0.75), 4.5);
        return { ...prev, scale: newScale };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Filter lots by status and Aldea
  const displayedLots = useMemo(() => {
    return visibleLots.filter((lot) => {
      if (statusFilter !== "all" && lot.status !== statusFilter) return false;
      if (activeAldea !== "all") {
        if (activeAldea === "A1" && lot.blockId !== "A1" && lot.blockId !== "C1") return false;
        if (activeAldea === "A2" && lot.blockId !== "A2" && lot.blockId !== "C2") return false;
        if (activeAldea === "A3" && lot.blockId !== "A3" && lot.blockId !== "C3") return false;
        if (activeAldea === "A4" && lot.blockId !== "A4" && lot.blockId !== "C4") return false;
        if (activeAldea === "PARKING" && !lot.typology.startsWith("parking")) return false;
      }
      return true;
    });
  }, [visibleLots, statusFilter, activeAldea]);

  // WhatsApp message builder
  const getLotWhatsAppMessage = (lot: Lot) => {
    const blockName =
      lot.blockId === "A1" ? "Aldea 1 (Oeste)"
      : lot.blockId === "A2" ? "Aldea 2 (Norte)"
      : lot.blockId === "A3" ? "Aldea 3 (Este)"
      : lot.blockId === "A4" ? "Aldea 4 (Sur)"
      : lot.blockId;
    return `Hola, deseo recibir información y cotización formal del Lote ${lot.number} (${blockName}), área ${lot.areaM2} m² a $140 USD/m² ($16,800 USD / S/ 63,000 PEN) en el Condominio Ecológico Moon Paracas.`;
  };

  // Terrain SVG 4 corners in 800x800 space
  const terrainCorners = useMemo(() => [
    { x: 30, y: 25 },
    { x: 770, y: 25 },
    { x: 770, y: 775 },
    { x: 30, y: 775 },
  ], []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-[#e6ded5] select-none transition-all duration-300 font-sans ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen"
          : "h-[640px] sm:h-[720px] lg:h-[760px] rounded-2xl border border-[#c4baa9] shadow-2xl"
      }`}
    >
      {/* ── TOP LEFT TABS & MENU (RENACER HERRADURA STYLE) ── */}
      <div className="pointer-events-auto absolute top-4 left-4 z-40 flex items-center gap-2">
        {/* Main Tab Pill */}
        <div className="flex items-center overflow-hidden rounded-full bg-white shadow-lg border border-black/10 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("areas");
              onSelectLot(null);
            }}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
              activeTab === "areas"
                ? "bg-[#8c9a44] text-white shadow-sm"
                : "bg-transparent text-[#4a5553] hover:text-black"
            }`}
          >
            Áreas Comunes
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("lotes");
              setSelectedAmenity(null);
            }}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
              activeTab === "lotes"
                ? "bg-[#8c9a44] text-white shadow-sm"
                : "bg-transparent text-[#4a5553] hover:text-black"
            }`}
          >
            Lotes
          </button>
        </div>

        {/* Entorno & Hamburger Menu */}
        <div className="flex items-center overflow-hidden rounded-full bg-[#3d3835] text-white shadow-lg border border-black/20 p-0.5">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold hover:bg-white/10 rounded-full transition"
          >
            <span>Entorno</span>
            <div className="h-3.5 w-px bg-white/20 ml-1 mr-0.5" />
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Direct Google Maps Geolocation Pill */}
        <a
          href={`https://www.google.com/maps/@${MOON_PARACAS_COORDS.lat},${MOON_PARACAS_COORDS.lng},17z/data=!3m1!1e3`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-[11px] font-bold text-[#1f2d2a] shadow-lg border border-black/10 hover:bg-[#f0ede6] transition"
          title="Ver coordenadas satelitales en Google Maps (-13.923861, -76.159180)"
        >
          <Compass className="h-3.5 w-3.5 text-[#8c9a44]" />
          <span>Google Maps (Paracas)</span>
        </a>
      </div>

      {/* ── RIGHT FLOATING DRAWER MODAL (RENACER HERRADURA STYLE) ── */}
      {/* Case 1: Lot Selected */}
      {selectedLot && (
        <div className="pointer-events-auto absolute top-4 right-4 z-40 w-full max-w-[340px] sm:max-w-[370px] animate-in fade-in slide-in-from-right duration-200">
          <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-black/10">
            {/* Header: Volver + Close */}
            <div className="flex items-center justify-between pb-3">
              <button
                type="button"
                onClick={() => onSelectLot(null)}
                className="flex items-center gap-1 text-xs font-semibold text-[#5c6865] hover:text-black"
              >
                <ChevronLeft className="h-4 w-4" /> Volver
              </button>
              <button
                type="button"
                onClick={() => onSelectLot(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0ede6] text-[#5c6865] hover:bg-[#e2ded6] hover:text-black transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Project Title */}
            <h3 className="font-display text-2xl font-bold tracking-tight text-[#8c9a44]">
              Moon Paracas
            </h3>

            {/* Lot identifier + Status Badge */}
            <div className="mt-2 flex items-start justify-between gap-2">
              <div>
                <h4 className="text-base font-extrabold text-[#1f2d2a]">
                  {selectedLot.typology.startsWith("parking")
                    ? `Cochera P${selectedLot.number}`
                    : `Mz. ${selectedLot.blockId} - Lote ${selectedLot.number}`}
                </h4>
                <p className="text-xs text-[#6b7b77] font-medium">Etapa 1 · Paracas, Ica</p>
              </div>
              <span
                className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: STATUS_CONFIG[selectedLot.status]?.badgeBg || "#e8f5e9",
                  color: STATUS_CONFIG[selectedLot.status]?.badgeText || "#2e7d32",
                }}
              >
                {STATUS_CONFIG[selectedLot.status]?.label || "Disponible"}
              </span>
            </div>

            {/* Financial Details Table */}
            <div className="mt-5 space-y-3 divide-y divide-[#f0ede6] text-xs">
              <div className="flex items-baseline justify-between pt-1">
                <span className="font-medium text-[#6b7b77]">Precio Financiado</span>
                <span className="text-lg font-black text-[#8c9a44]">
                  $ {selectedLot.priceLabel ? selectedLot.priceLabel : "16,800.00"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="font-medium text-[#6b7b77]">Precio Contado</span>
                <span className="font-bold text-[#1f2d2a]">10% de Dscto. (S/ 63,000)</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="font-medium text-[#6b7b77]">Área de Parcela</span>
                <span className="font-bold text-[#1f2d2a]">{selectedLot.areaM2.toFixed(2)} m²</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="font-medium text-[#6b7b77]">Dimensiones</span>
                <span className="font-bold text-[#1f2d2a]">8.00 m × 15.00 m</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="font-medium text-[#6b7b77]">Domo Compatible</span>
                <span className="font-bold text-[#2e7d32]">Ø8 m (50.00 m² base)</span>
              </div>
            </div>

            {/* WhatsApp CTA Button */}
            <div className="mt-6">
              <a
                href={whatsappHref(getLotWhatsAppMessage(selectedLot))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#00C853] py-3.5 px-4 font-display text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#00b54b] active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5 fill-current" /> Contáctanos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Case 2: Amenity Pin Selected in "Áreas Comunes" mode */}
      {selectedAmenity && (
        <div className="pointer-events-auto absolute top-4 right-4 z-40 w-full max-w-[340px] sm:max-w-[370px] animate-in fade-in slide-in-from-right duration-200">
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl border border-black/10">
            {/* Header Photo */}
            <div className="relative h-44 w-full overflow-hidden bg-stone-900">
              <img
                src={selectedAmenity.image}
                alt={selectedAmenity.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedAmenity(null)}
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-3 rounded-md bg-[#8c9a44] px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow">
                {selectedAmenity.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-display text-lg font-bold text-[#1f2d2a]">
                {selectedAmenity.name}
              </h3>
              <p className="mt-2 text-xs text-[#5c6865] leading-relaxed">
                {selectedAmenity.description}
              </p>

              {/* Features list */}
              <div className="mt-4 space-y-1.5 border-t border-[#f0ede6] pt-3">
                <span className="text-[11px] font-bold uppercase text-[#8c9a44]">Características Clave:</span>
                <ul className="grid grid-cols-1 gap-1 text-xs text-[#33423f]">
                  {selectedAmenity.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8c9a44]" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* WhatsApp CTA */}
              <div className="mt-5">
                <a
                  href={whatsappHref(`Hola, deseo conocer más detalles sobre ${selectedAmenity.name} y el masterplan de Moon Paracas.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#00C853] py-3 px-4 font-display text-xs font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <MessageCircle className="h-4 w-4 fill-current" /> Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case 3: Entorno / Menu Drawer */}
      {isMenuOpen && !selectedLot && !selectedAmenity && (
        <div className="pointer-events-auto absolute top-4 right-4 z-40 w-full max-w-[320px] animate-in fade-in slide-in-from-right duration-200">
          <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-2xl border border-black/10 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-[#8c9a44]">Moon Paracas</h3>
                <p className="text-[11px] text-[#6b7b77]">Etapas y Aldeas del Masterplan</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0ede6] text-[#5c6865] hover:bg-[#e2ded6] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sector list buttons */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => jumpToSector("A1")}
                className="flex w-full items-center justify-between rounded-xl border border-[#e8e4db] p-3 text-left transition hover:border-[#8c9a44] hover:bg-[#fbfaf8]"
              >
                <div>
                  <span className="block text-xs font-bold text-[#1f2d2a]">Aldea 1 (Oeste)</span>
                  <span className="text-[10px] text-[#6b7b77]">96 Lotes · Manzana A · $140/m²</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#8c9a44]" />
              </button>

              <button
                type="button"
                onClick={() => jumpToSector("A2")}
                className="flex w-full items-center justify-between rounded-xl border border-[#e8e4db] p-3 text-left transition hover:border-[#8c9a44] hover:bg-[#fbfaf8]"
              >
                <div>
                  <span className="block text-xs font-bold text-[#1f2d2a]">Aldea 2 (Norte)</span>
                  <span className="text-[10px] text-[#6b7b77]">96 Lotes · Manzana B · $140/m²</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#8c9a44]" />
              </button>

              <button
                type="button"
                onClick={() => jumpToSector("A3")}
                className="flex w-full items-center justify-between rounded-xl border border-[#e8e4db] p-3 text-left transition hover:border-[#8c9a44] hover:bg-[#fbfaf8]"
              >
                <div>
                  <span className="block text-xs font-bold text-[#1f2d2a]">Aldea 3 (Este)</span>
                  <span className="text-[10px] text-[#6b7b77]">96 Lotes · Manzana C · $140/m²</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#8c9a44]" />
              </button>

              <button
                type="button"
                onClick={() => jumpToSector("A4")}
                className="flex w-full items-center justify-between rounded-xl border border-[#e8e4db] p-3 text-left transition hover:border-[#8c9a44] hover:bg-[#fbfaf8]"
              >
                <div>
                  <span className="block text-xs font-bold text-[#1f2d2a]">Aldea 4 (Sur)</span>
                  <span className="text-[10px] text-[#6b7b77]">96 Lotes · Manzana D · $140/m²</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#8c9a44]" />
              </button>

              <button
                type="button"
                onClick={() => jumpToSector("OASIS")}
                className="flex w-full items-center justify-between rounded-xl border border-[#e8e4db] p-3 text-left transition hover:border-[#00acc1] hover:bg-[#fbfaf8]"
              >
                <div>
                  <span className="block text-xs font-bold text-[#1f2d2a]">Oasis Central</span>
                  <span className="text-[10px] text-[#6b7b77]">20,662 m² · Laguna, Bar & Club</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#00acc1]" />
              </button>

              <button
                type="button"
                onClick={() => jumpToSector("PARKING")}
                className="flex w-full items-center justify-between rounded-xl border border-[#e8e4db] p-3 text-left transition hover:border-[#df8a6f] hover:bg-[#fbfaf8]"
              >
                <div>
                  <span className="block text-xs font-bold text-[#1f2d2a]">Cocheras Plus</span>
                  <span className="text-[10px] text-[#6b7b77]">192 Plazas Privadas</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#df8a6f]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM LEFT BASEMAP TOGGLE (GOOGLE MAPS API INTEGRATED) ── */}
      <div className="pointer-events-auto absolute bottom-4 left-4 z-40">
        <div className="relative">
          {isBasemapMenuOpen && (
            <div className="absolute bottom-16 left-0 mb-2 flex flex-col gap-1 rounded-xl bg-white p-1.5 shadow-2xl border border-black/10 text-xs font-bold min-w-[170px]">
              <button
                type="button"
                onClick={() => {
                  setBaseMap("google-satellite");
                  setIsBasemapMenuOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                  baseMap === "google-satellite" ? "bg-[#8c9a44] text-white" : "text-[#4a5553] hover:bg-[#f0ede6]"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Google Satélite (En Vivo)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBaseMap("google-hybrid");
                  setIsBasemapMenuOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                  baseMap === "google-hybrid" ? "bg-[#8c9a44] text-white" : "text-[#4a5553] hover:bg-[#f0ede6]"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Google Maps Híbrido</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBaseMap("masterplan");
                  setIsBasemapMenuOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                  baseMap === "masterplan" ? "bg-[#8c9a44] text-white" : "text-[#4a5553] hover:bg-[#f0ede6]"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span>Plano Masterplan CAD</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsBasemapMenuOpen(!isBasemapMenuOpen)}
            className="flex flex-col items-center overflow-hidden rounded-xl bg-white p-1 shadow-xl border border-black/10 hover:scale-105 transition active:scale-95"
            title="Cambiar capa de mapa (Google Maps API / Satelital / Masterplan)"
          >
            <div
              className="h-12 w-16 rounded-lg bg-cover bg-center border border-black/10 relative overflow-hidden"
              style={{
                backgroundImage: `url(${baseMap === "masterplan" ? "/images/masterplan_bg.png" : "/images/google_satellite_basemap.jpg"})`,
              }}
            >
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Layers className="h-4 w-4 text-white drop-shadow" />
              </div>
            </div>
            <span className="pt-1 text-[9px] font-extrabold uppercase tracking-wider text-[#3d3835]">
              {baseMap === "google-satellite" ? "Google Satélite" : baseMap === "google-hybrid" ? "Híbrido" : "Masterplan"}
            </span>
          </button>
        </div>
      </div>

      {/* ── BOTTOM CENTER FLOATING DOCK (RENACER STATUS & CAPSULE BAR) ── */}
      <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
        {/* Status Legend Pill */}
        <div className="flex items-center gap-2 sm:gap-3 rounded-full bg-white/95 px-4 py-1.5 shadow-xl border border-black/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "available" ? "all" : "available")}
            className={`flex items-center gap-1 text-[11px] font-bold transition ${
              statusFilter === "available" ? "scale-105 text-[#2e7d32] font-black underline" : "text-[#2e7d32] opacity-90 hover:opacity-100"
            }`}
          >
            <span>🚩</span> <span>Disponible</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "reserved" ? "all" : "reserved")}
            className={`flex items-center gap-1 text-[11px] font-bold transition ${
              statusFilter === "reserved" ? "scale-105 text-[#e65100] font-black underline" : "text-[#e65100] opacity-90 hover:opacity-100"
            }`}
          >
            <span>🚩</span> <span>Reservado</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "sold" ? "all" : "sold")}
            className={`flex items-center gap-1 text-[11px] font-bold transition ${
              statusFilter === "sold" ? "scale-105 text-[#c62828] font-black underline" : "text-[#c62828] opacity-90 hover:opacity-100"
            }`}
          >
            <span>🚩</span> <span>Vendido</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "blocked" ? "all" : "blocked")}
            className={`flex items-center gap-1 text-[11px] font-bold transition ${
              statusFilter === "blocked" ? "scale-105 text-[#37474f] font-black underline" : "text-[#37474f] opacity-90 hover:opacity-100"
            }`}
          >
            <span>🚩</span> <span>Bloqueado</span>
          </button>
        </div>

        {/* Capsule Navigation Dock Buttons */}
        <div className="flex items-center gap-1 rounded-full bg-white/95 p-1.5 shadow-xl border border-black/10 backdrop-blur-md">
          <button onClick={handleReset} className="rounded-full p-2 text-[#3d3835] hover:bg-black/5 active:scale-95 transition" title="Inicio">
            <Home className="h-4 w-4" />
          </button>
          <button onClick={() => handlePanStep(60, 0)} className="rounded-full p-2 text-[#3d3835] hover:bg-black/5 active:scale-95 transition" title="Mover Izquierda">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button onClick={() => handlePanStep(-60, 0)} className="rounded-full p-2 text-[#3d3835] hover:bg-black/5 active:scale-95 transition" title="Mover Derecha">
            <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => handlePanStep(0, 60)} className="rounded-full p-2 text-[#3d3835] hover:bg-black/5 active:scale-95 transition" title="Mover Arriba">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button onClick={() => handlePanStep(0, -60)} className="rounded-full p-2 text-[#3d3835] hover:bg-black/5 active:scale-95 transition" title="Mover Abajo">
            <ArrowDown className="h-4 w-4" />
          </button>
          <button onClick={() => handleZoom(1.25)} className="rounded-full p-2 text-[#3d3835] hover:bg-black/5 active:scale-95 transition" title="Acercar">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={() => handleZoom(0.8)} className="rounded-full p-2 text-[#3d3835] hover:bg-black/5 active:scale-95 transition" title="Alejar">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="rounded-full p-2 text-[#3d3835] hover:bg-black/5 active:scale-95 transition" title="Pantalla Completa">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── GOOGLE MAPS API LIVE EMBEDDED LAYER OR LOCAL HIGH-RES ORTHOMOSAIC ── */}
      {isGoogleMapsReady && (baseMap === "google-satellite" || baseMap === "google-hybrid") ? (
        <div className="h-full w-full relative">
          <APIProvider apiKey={googleMapsKey}>
            <GoogleMap
              defaultCenter={MOON_PARACAS_COORDS}
              defaultZoom={17}
              mapTypeId={baseMap === "google-hybrid" ? "hybrid" : "satellite"}
              disableDefaultUI={false}
              gestureHandling="greedy"
              mapTypeControl={false}
              streetViewControl={false}
              className="h-full w-full"
            >
              <GoogleMapController selectedLot={selectedLot} selectedAmenity={selectedAmenity} />

              {/* Masterplan CAD and Lots Georeferenced on Google Maps */}
              <CustomSVGOverlay terrainSvgPoints={terrainCorners}>
                <svg
                  viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                  className="w-full h-full pointer-events-auto"
                >
                  <defs>
                    <radialGradient id="gmap-lagoon-water-grad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#4dd0e1" stopOpacity="0.95" />
                      <stop offset="60%" stopColor="#00acc1" stopOpacity="0.90" />
                      <stop offset="100%" stopColor="#00838f" stopOpacity="0.92" />
                    </radialGradient>
                  </defs>

                  {/* Central Oasis Lagoon */}
                  <circle
                    cx="400"
                    cy="360"
                    r="62"
                    fill="url(#gmap-lagoon-water-grad)"
                    stroke="#80deea"
                    strokeWidth="2.2"
                    opacity="0.95"
                  />
                  <circle cx="400" cy="360" r="18" fill="#d7ccc8" stroke="#a1887f" strokeWidth="1.2" />

                  {/* Primary Diagonal Boulevards */}
                  {scene.roads && scene.roads.map((road) => {
                    if (!road.path || road.path.length < 2) return null;
                    const d = `M ${road.path[0].x} ${road.path[0].y} ` + road.path.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
                    return (
                      <g key={`gmap-road-${road.id}`} pointerEvents="none">
                        <path
                          d={d}
                          fill="none"
                          stroke="#263238"
                          strokeWidth={road.kind === "primary" ? 7.5 : 4.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.9"
                        />
                        {road.kind === "primary" && (
                          <path
                            d={d}
                            fill="none"
                            stroke="#ffeb3b"
                            strokeWidth="0.8"
                            strokeDasharray="4 4"
                            opacity="0.8"
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Layer Switching: Lotes vs Areas Comunes */}
                  {activeTab === "lotes" && (
                    <LotsLayer
                      lots={displayedLots}
                      selectedLotId={selectedLot?.id}
                      onSelect={(lot) => {
                        onSelectLot(lot);
                        setSelectedAmenity(null);
                      }}
                      filterStatus={statusFilter}
                    />
                  )}

                  {activeTab === "areas" && (
                    <AmenitiesLayer
                      selectedAmenityId={selectedAmenity?.id}
                      onSelectAmenity={(amenity) => {
                        setSelectedAmenity(amenity);
                        onSelectLot(null);
                      }}
                    />
                  )}
                </svg>
              </CustomSVGOverlay>
            </GoogleMap>
          </APIProvider>
        </div>
      ) : (
        /* Native High-Performance SVG Canvas with High-Res Satellite Orthomosaic */
        <div
          ref={viewportRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="relative h-full w-full origin-center transition-transform duration-150 ease-out"
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            }}
          >
            <svg
              className="h-full w-full pointer-events-auto"
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="lagoon-water-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4dd0e1" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#00acc1" stopOpacity="0.90" />
                  <stop offset="100%" stopColor="#00838f" stopOpacity="0.92" />
                </radialGradient>
              </defs>

              {/* 1. Real Google Maps Satellite Background */}
              <image
                href="/images/google_satellite_basemap.jpg"
                x="0"
                y="0"
                width={SVG_W}
                height={SVG_H}
                preserveAspectRatio="xMidYMid slice"
                opacity={baseMap === "masterplan" ? 0.35 : 1.0}
              />

              {/* 2. Central Oasis Lagoon */}
              <circle
                cx="400"
                cy="360"
                r="62"
                fill="url(#lagoon-water-grad)"
                stroke="#80deea"
                strokeWidth="2.2"
                opacity="0.95"
              />
              <circle cx="400" cy="360" r="18" fill="#d7ccc8" stroke="#a1887f" strokeWidth="1.2" />

              {/* 3. Primary Diagonal Boulevards & Roads */}
              {scene.roads && scene.roads.map((road) => {
                if (!road.path || road.path.length < 2) return null;
                const d = `M ${road.path[0].x} ${road.path[0].y} ` + road.path.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
                return (
                  <g key={`road-${road.id}`} pointerEvents="none">
                    <path
                      d={d}
                      fill="none"
                      stroke="#263238"
                      strokeWidth={road.kind === "primary" ? 7.5 : 4.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                    {road.kind === "primary" && (
                      <path
                        d={d}
                        fill="none"
                        stroke="#ffeb3b"
                        strokeWidth="0.8"
                        strokeDasharray="4 4"
                        opacity="0.8"
                      />
                    )}
                  </g>
                );
              })}

              {/* 4. Layer Switching: "lotes" vs "areas" */}
              {activeTab === "lotes" && (
                <LotsLayer
                  lots={displayedLots}
                  selectedLotId={selectedLot?.id}
                  onSelect={(lot) => {
                    onSelectLot(lot);
                    setSelectedAmenity(null);
                  }}
                  filterStatus={statusFilter}
                />
              )}

              {activeTab === "areas" && (
                <AmenitiesLayer
                  selectedAmenityId={selectedAmenity?.id}
                  onSelectAmenity={(amenity) => {
                    setSelectedAmenity(amenity);
                    onSelectLot(null);
                  }}
                />
              )}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
