import React, { useEffect, useMemo } from "react";
import { APIProvider, Map as GoogleMap, useMap } from "@vis.gl/react-google-maps";
import { Compass as CompassIcon, MapPin, Download, ExternalLink, Navigation, Layers } from "lucide-react";
import { CustomSVGOverlay } from "./map/CustomSVGOverlay";
import { buildTerrainScene } from "../lib/terrainModel";
import { buildRoads } from "../lib/roadModel";
import { buildBlocks } from "../lib/blockModel";
import { buildAmenities } from "../lib/amenityModel";
import { pathFromPolygon, centroid } from "../lib/geometry";

// Extended route coords directly connecting to the welcome center rotonda
const routeCoords = [
  { lat: -13.88162932766374, lng: -76.11865069896544 },
  { lat: -13.88394229318979, lng: -76.11931311761099 },
  { lat: -13.89390180407736, lng: -76.122301354486 },
  { lat: -13.90170259329031, lng: -76.12469419435892 },
  { lat: -13.90891807855069, lng: -76.12698871531734 },
  { lat: -13.91388439977467, lng: -76.13047640467754 },
  { lat: -13.91894543464044, lng: -76.14029057239667 },
  { lat: -13.92287213593788, lng: -76.15627500591151 },
  
  // Transition and extension points directly entering the masterplan's rotonda
  { lat: -13.92485, lng: -76.16010 }, 
  { lat: -13.92503, lng: -76.16020 }, // Welcome Center Rotonda center
  { lat: -13.92520, lng: -76.16015 },
  
  { lat: -13.92342961808435, lng: -76.15622517971947 },
  { lat: -13.91953901985999, lng: -76.14003689591011 },
  { lat: -13.9140549470785, lng: -76.12991298391938 },
  { lat: -13.90887880838449, lng: -76.12639735144977 },
  { lat: -13.90161210479798, lng: -76.12425154106772 },
  { lat: -13.89391656077127, lng: -76.12188058816564 },
  { lat: -13.88392318189265, lng: -76.11896975210587 },
  { lat: -13.88179457073849, lng: -76.11833022270774 },
  { lat: -13.88162932766374, lng: -76.11865069896544 }
];

const googleMapsEnabled =
  import.meta.env.VITE_ENABLE_GOOGLE_MAPS === "true" &&
  Boolean(import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY);

const FitRouteBounds = () => {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === "undefined") return;

    // Bottom casing (black outline for a clean road vector look)
    const roadCasing = new google.maps.Polygon({
      paths: routeCoords,
      strokeColor: "#1D1714",
      strokeOpacity: 0.85,
      strokeWeight: 8,
      fillColor: "#E2725B",
      fillOpacity: 0.12,
      map: map
    });

    // Top glowing line (terracotta brand color)
    const roadCore = new google.maps.Polygon({
      paths: routeCoords,
      strokeColor: "#E2725B",
      strokeOpacity: 1.0,
      strokeWeight: 3.5,
      map: map
    });

    // Sleek vector SVG pin markers
    const pinIconStart = {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      fillColor: "#E2725B",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
      scale: 1.5,
      anchor: new google.maps.Point(12, 22)
    };

    const pinIconEnd = {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      fillColor: "#C5A059",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
      scale: 1.5,
      anchor: new google.maps.Point(12, 22)
    };

    const startMarker = new google.maps.Marker({
      position: routeCoords[0],
      map: map,
      title: "Inicio: Panamericana Sur Km 240",
      icon: pinIconStart
    });

    const endMarker = new google.maps.Marker({
      position: { lat: -13.92503, lng: -76.16020 }, // Placed directly at the entrance Rotonda
      map: map,
      title: "Destino: Pórtico de Ingreso Moon Paracas",
      icon: pinIconEnd
    });

    // Center and zoom camera to fit path perfectly
    const bounds = new google.maps.LatLngBounds();
    routeCoords.forEach(coord => bounds.extend(coord));
    map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });

    return () => {
      roadCasing.setMap(null);
      roadCore.setMap(null);
      startMarker.setMap(null);
      endMarker.setMap(null);
    };
  }, [map]);

  return null;
};

export const AccessRoute: React.FC = () => {
  // Generate Masterplan Scene for the miniature blueprint overlay
  const scene = useMemo(() => {
    const terrainScene = buildTerrainScene();
    const roads = buildRoads(terrainScene.innerBuffer);
    const blocks = buildBlocks(terrainScene.innerBuffer);
    const amenities = buildAmenities(terrainScene.innerBuffer);

    return {
      terrain: terrainScene.terrain,
      roads,
      amenities,
      blocks
    };
  }, []);
  
  // Download KML function
  const downloadKML = () => {
    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>ruta moon.kml</name>
  <Style id="path_style">
    <LineStyle>
      <color>ff7fff00</color>
      <width>4</width>
    </LineStyle>
    <PolyStyle>
      <color>6600ff55</color>
    </PolyStyle>
  </Style>
  <Placemark>
    <name>ruta moon</name>
    <styleUrl>#path_style</styleUrl>
    <Polygon>
      <tessellate>1</tessellate>
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>
            -76.11865069896544,-13.88162932766374,0
            -76.11931311761099,-13.88394229318979,0
            -76.122301354486,-13.89390180407736,0
            -76.12469419435892,-13.90170259329031,0
            -76.12698871531734,-13.90891807855069,0
            -76.13047640467754,-13.91388439977467,0
            -76.14029057239667,-13.91894543464044,0
            -76.15627500591151,-13.92287213593788,0
            -76.15622517971947,-13.92342961808435,0
            -76.14003689591011,-13.91953901985999,0
            -76.12991298391938,-13.9140549470785,0
            -76.12639735144977,-13.90887880838449,0
            -76.12425154106772,-13.90161210479798,0
            -76.12188058816564,-13.89391656077127,0
            -76.11896975210587,-13.88392318189265,0
            -76.11833022270774,-13.88179457073849,0
            -76.11865069896544,-13.88162932766374,0 
          </coordinates>
        </LinearRing>
      </outerBoundaryIs>
    </Polygon>
  </Placemark>
</Document>
</kml>`;
    const blob = new Blob([kmlContent], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ruta_acceso_moon_paracas.kml";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=-13.881629,-76.118650&destination=-13.92503,-76.16020&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto text-left font-sans">
      
      {/* Column 1: Info and Storytelling */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-6 bg-[#1D1714]/60 border border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="space-y-4">
          <div className="inline-flex p-3 bg-[#E2725B]/10 border border-[#E2725B]/20 text-[#E2725B] rounded-xl">
            <Navigation className="w-5 h-5" />
          </div>
          <h4 className="font-display text-2xl font-bold uppercase text-white tracking-wide">
            Conectividad Inmediata
          </h4>
          <p className="text-xs text-stone-300 leading-relaxed font-light">
            El acceso propuesto a <strong>Moon Paracas</strong> debe validarse mediante visita, levantamiento de ruta, derecho de paso y plan de mantenimiento estacional.
          </p>

          <div className="space-y-3.5 pt-2">
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-[#E2725B] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">Km 240 Panamericana Sur</h5>
                <p className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">
                  Punto de partida referencial. El acceso, derecho de paso, tiempos y conexión vial deben validarse mediante visita y documentación vigente.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-[#E2725B] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">Paso Solimar y Geodésico</h5>
                <p className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">
                  Atraviesa la meseta del tablazo por una vía de afirmado compactada, rodeando hitos geológicos de alta estabilidad.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CompassIcon className="w-4 h-4 text-[#E2725B] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">Distancia de Acceso</h5>
                <p className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">
                  Un recorrido directo de <strong>6.5 km</strong> apto para todo tipo de vehículos que asciende suavemente a la meseta del condominio (108 m s.n.m).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5 font-sans">
          <button
            onClick={downloadKML}
            className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[#E1D9C1] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#E2725B]" /> Descargar KML
          </button>
          
          <button
            onClick={openGoogleMaps}
            className="flex-1 bg-[#E2725B] hover:bg-[#d85e45] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#E2725B]/10"
          >
            <ExternalLink className="w-4 h-4" /> Cómo Llegar
          </button>
        </div>
      </div>

      {/* Column 2: Optional external map with a provider-free local fallback */}
      <div className="lg:col-span-7 h-[400px] lg:h-auto min-h-[350px] relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {googleMapsEnabled ? (
          <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || ""}>
            <GoogleMap
              defaultCenter={{ lat: -13.902, lng: -76.137 }}
              defaultZoom={13}
              mapTypeId="satellite"
              disableDefaultUI={false}
              gestureHandling="greedy"
              mapTypeControl={false}
              streetViewControl={false}
            >
              <FitRouteBounds />

              {/* Miniature Masterplan Blueprint overlaid on the exact location of the project */}
              <CustomSVGOverlay terrainSvgPoints={scene.terrain}>
                <svg viewBox="0 0 730 820" className="w-full h-full pointer-events-none opacity-95 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {/* 1. Terrain Boundary - Dark mask to dim the satellite sand texture underneath */}
                <path d={pathFromPolygon(scene.terrain)} fill="rgba(20, 16, 14, 0.72)" stroke="#E2725B" strokeWidth={3.5} />
                
                {/* 2. Inner blocks representation */}
                {scene.blocks.map((block) => (
                  <path key={`mini-block-${block.id}`} d={pathFromPolygon(block.polygon)} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.22)" strokeWidth={0.8} />
                ))}

                {/* 3. Roads (Golden corridors - Highly visible) */}
                {scene.roads.map((road) => {
                  const d = `M ${road.path[0].x} ${road.path[0].y} ` + road.path.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
                  return (
                    <path key={`mini-road-${road.id}`} d={d} fill="none" stroke={road.kind === "primary" ? "#E2725B" : "#C5A059"} strokeWidth={road.kind === "primary" ? 12 : 6} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
                  );
                })}

                {/* 4. Amenities (Pools and Social spaces - Pop color details) */}
                {scene.amenities.map((a) => {
                  let fill = "rgba(255,255,255,0.12)";
                  if (a.kind === "pool" || a.kind === "water-mirror") fill = "#00E5FF"; // Bright cyan pool
                  if (a.kind === "clubhouse" || a.kind === "welcome-center") fill = "#E2725B"; // Terracotta club
                  if (a.kind === "sand-plaza" || a.kind === "palm-forest") fill = "#8FA88B"; // Sage green oasis
                  
                  return (
                    <path key={`mini-amenity-${a.id}`} d={pathFromPolygon(a.polygon)} fill={fill} stroke="rgba(255,255,255,0.3)" strokeWidth={0.6} opacity={0.95} />
                  );
                })}
                </svg>
              </CustomSVGOverlay>
            </GoogleMap>
          </APIProvider>
        ) : (
          <div data-testid="access-route-fallback" className="relative h-full min-h-[350px] overflow-hidden bg-[#e6e0d3]">
            <img
              src="/images/masterplan-v4-commercial.png"
              alt="Masterplan V4 de cuatro aldeas de Moon Paracas"
              className="h-full w-full object-contain p-4"
              decoding="async"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#102022] via-[#102022]/88 to-transparent px-5 pb-5 pt-20 text-white">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f0b08c]">Referencia local disponible</p>
              <p className="mt-2 max-w-md text-xs leading-5 text-white/75">El plano permanece disponible sin consumir una API externa. Usa “Cómo llegar” para abrir la ruta directamente en Google Maps.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
