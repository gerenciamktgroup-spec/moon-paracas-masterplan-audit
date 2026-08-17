import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PROJECT } from "../config/project";

const META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Moon Paracas | Refugio orgánico en Paracas",
    description: "Explora el masterplan, tipologías, financiamiento y expediente de decisión de Moon Paracas.",
  },
  "/simulador": {
    title: "Masterplan y lotes | Moon Paracas",
    description: "Compara ubicaciones, áreas, precios referenciales y disponibilidad en el masterplan interactivo.",
  },
  "/paracas-dome": {
    title: "Paracas Dome | Moon Paracas",
    description: "Conoce las configuraciones Founder y Comfort, sus alcances y alternativas de financiamiento.",
  },
  "/galeria": {
    title: "Galería del proyecto | Moon Paracas",
    description: "Distingue renders conceptuales, referencias de diseño y registros del entorno de Moon Paracas.",
  },
  "/experiencia": {
    title: "Experiencia y antecedentes | Moon Paracas",
    description: "Revisa la experiencia declarada del equipo y solicita su sustento documental antes de decidir.",
  },
  "/tecnica": {
    title: "Expediente técnico y legal | Moon Paracas",
    description: "Consulta parámetros técnicos, alcances contractuales y la lista de verificación previa a una reserva.",
  },
  "/documentos": {
    title: "Centro documental | Moon Paracas",
    description: "Revisa qué evidencia está publicada, qué debe solicitarse vigente y qué permanece pendiente antes de separar.",
  },
  "/privacidad": {
    title: "Aviso de privacidad | Moon Paracas",
    description: "Conoce cómo se tratan los datos enviados a través de Moon Paracas.",
  },
  "/terminos": {
    title: "Términos del sitio | Moon Paracas",
    description: "Consulta el alcance informativo, uso de renders y condiciones de reserva del sitio.",
  },
};

function setMeta(name: string, content: string, property = false) {
  const attribute = property ? "property" : "name";
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

export const PageMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const key = pathname.startsWith("/paracas-dome") ? "/paracas-dome" : pathname;
    const meta = META[key] || {
      title: "Página no encontrada | Moon Paracas",
      description: "La dirección solicitada no existe o fue movida.",
    };
    const canonicalPath = key === "/" ? "" : key;
    const canonical = `${PROJECT.siteUrl}${canonicalPath}`;

    document.title = meta.title;
    setMeta("description", meta.description);
    setMeta("robots", META[key] ? "index, follow, max-image-preview:large" : "noindex, follow");
    setMeta("og:title", meta.title, true);
    setMeta("og:description", meta.description, true);
    setMeta("og:url", canonical, true);

    const link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (link) link.href = canonical;
  }, [pathname]);

  return null;
};
