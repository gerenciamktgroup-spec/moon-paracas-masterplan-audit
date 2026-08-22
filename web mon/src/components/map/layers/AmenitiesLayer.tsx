import React from "react";
import { XY } from "../../../types/map";

export interface AmenityPin {
  id: string;
  name: string;
  category: string;
  center: XY;
  image: string;
  description: string;
  features: string[];
}

export const MOON_PARACAS_AMENITIES: AmenityPin[] = [
  {
    id: "amenity-oasis",
    name: "Oasis Central & Laguna Natural",
    category: "Área Acuática y Recreación",
    center: { x: 400, y: 360 },
    image: "/images/experience-lagoon.jpg",
    description: "Espejo de agua cristalina de 20,662 m² con vegetación xerófita, palmeras del desierto y tratamiento ecológico.",
    features: ["Laguna Natural 20,662 m²", "Muelle de relajación", "Tratamiento ecológico del agua", "Borde de arena fina"],
  },
  {
    id: "amenity-bar",
    name: "Bar & Lounge Oasis",
    category: "Social y Gastronomía",
    center: { x: 400, y: 290 },
    image: "/images/gallery-social.jpg",
    description: "Zona lounge y coctelería orgánica con vista panorámica 360° al Oasis Central y el cielo estrellado de Paracas.",
    features: ["Coctelería botánica", "Mobiliario orgánico en madera", "Terrazas sombreadas", "Vista directa a la laguna"],
  },
  {
    id: "amenity-hamacas",
    name: "Zona Chill & Hamacas",
    category: "Bienestar y Descanso",
    center: { x: 330, y: 360 },
    image: "/images/hero-lagoon.png",
    description: "Espacio de desconexión total equipado con hamacas de algodón natural bajo sombra de palmeras.",
    features: ["Hamacas suspendidas", "Pérgolas bioclimáticas", "Sombra natural de palmeras", "Música ambiental suave"],
  },
  {
    id: "amenity-fogatas",
    name: "Fogatas Zen & Reloj Lunar",
    category: "Experiencia Nocturna",
    center: { x: 470, y: 360 },
    image: "/images/experience-astronomy.jpg",
    description: "Fogateros de piedra tallada y graderías circulares para reuniones nocturnas bajo las constelaciones.",
    features: ["Fogateros de piedra volcánica", "Asientos perimetrales", "Observación astronómica", "Leña ecológica"],
  },
  {
    id: "amenity-yoga",
    name: "Yoga & Meditation Deck",
    category: "Salud y Mindfulness",
    center: { x: 360, y: 430 },
    image: "/images/paracas-dome-gallery-1.jpg",
    description: "Plataforma de madera pulida orientada hacia la salida del sol para prácticas matutinas de yoga y meditación.",
    features: ["Deck de madera teca", "Orientación solar este", "Alineación energética", "Vistas al agua"],
  },
  {
    id: "amenity-juegos",
    name: "Canchas & Juegos Infantiles",
    category: "Deporte y Familia",
    center: { x: 440, y: 430 },
    image: "/images/experience-sports.jpg",
    description: "Área multideportiva y juegos eco-amigables diseñados con maderas tratadas para todas las edades.",
    features: ["Juegos de madera", "Cancha multideportiva", "Piso blando de seguridad", "Bancas de sombra"],
  },
  {
    id: "amenity-portico",
    name: "Pórtico de Acceso con Reloj Solar",
    category: "Control y Recepción",
    center: { x: 400, y: 720 },
    image: "/images/masterplan_render.png",
    description: "Ingreso monumental con garita de seguridad 24/7, control biométrico y un hito arquitectónico con reloj solar.",
    features: ["Vigilancia 24/7 con CCTV", "Control de accesos automatizado", "Reloj solar monumental", "Vía de doble carril"],
  },
  {
    id: "amenity-welcome",
    name: "Welcome Center & Visitor Lobby",
    category: "Atención al Propietario",
    center: { x: 260, y: 720 },
    image: "/images/paracas-dome-gallery-2.jpg",
    description: "Centro de bienvenida para propietarios y visitantes, con sala de ventas, maquetas interactivas y café boutique.",
    features: ["Sala de atención personalizada", "Cafetería orgánica", "Estacionamiento de visitas", "WiFi satelital de alta velocidad"],
  },
];

export function AmenitiesLayer({
  selectedAmenityId,
  onSelectAmenity,
}: {
  selectedAmenityId?: string;
  onSelectAmenity: (amenity: AmenityPin) => void;
}) {
  return (
    <g id="amenities-photo-pins-layer">
      {MOON_PARACAS_AMENITIES.map((item) => {
        const isSelected = selectedAmenityId === item.id;
        const radius = isSelected ? 15 : 12;

        return (
          <g
            key={item.id}
            className="cursor-pointer transition-transform duration-200 hover:scale-110"
            transform={`translate(${item.center.x}, ${item.center.y})`}
            onClick={() => onSelectAmenity(item)}
          >
            {/* Soft shadow */}
            <circle
              cx={0}
              cy={2}
              r={radius + 1.5}
              fill="rgba(0,0,0,0.35)"
            />

            {/* Solid white border pill matching Renacer common area pins */}
            <circle
              cx={0}
              cy={0}
              r={radius + 1.2}
              fill={isSelected ? "#8c9a44" : "#ffffff"}
              stroke={isSelected ? "#ffffff" : "#8c9a44"}
              strokeWidth={isSelected ? "1.8" : "1.2"}
            />

            {/* Pattern definition for circular image */}
            <defs>
              <pattern
                id={`pin-img-${item.id}`}
                patternUnits="userSpaceOnUse"
                width={radius * 2}
                height={radius * 2}
                x={-radius}
                y={-radius}
              >
                <image
                  href={item.image}
                  x={0}
                  y={0}
                  width={radius * 2}
                  height={radius * 2}
                  preserveAspectRatio="xMidYMid slice"
                />
              </pattern>
            </defs>

            {/* Circular Photo */}
            <circle
              cx={0}
              cy={0}
              r={radius}
              fill={`url(#pin-img-${item.id})`}
            />

            {/* Glowing ring if selected */}
            {isSelected && (
              <circle
                cx={0}
                cy={0}
                r={radius + 3}
                fill="none"
                stroke="#8c9a44"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
            )}

            {/* Label below pin */}
            <rect
              x={-35}
              y={radius + 3}
              width={70}
              height={11}
              rx={5.5}
              fill="#ffffff"
              stroke="#8c9a44"
              strokeWidth="0.8"
              opacity="0.95"
            />
            <text
              x={0}
              y={radius + 10}
              textAnchor="middle"
              fontSize="3.8"
              fontWeight="800"
              fontFamily="'Montserrat', 'Outfit', sans-serif"
              fill="#263238"
            >
              {item.name.length > 20 ? item.name.slice(0, 18) + "…" : item.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}
