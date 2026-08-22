import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  HardHat, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  Award, 
  ShieldCheck, 
  Trees, 
  Layers, 
  Info,
  CheckCircle2,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { InteriorHero } from "../components/InteriorHero";

interface Project {
  id: string;
  name: string;
  location: string;
  slogan: string;
  desc: string;
  metric: string;
  year: string;
  features: string[];
  ecoDesc: string;
  infraDesc: string;
  images: string[];
}

const pastProjects: Project[] = [
  {
    id: "bahias",
    name: "Las Bahías",
    location: "Cieneguilla, Lima",
    slogan: "Ingeniería de campo y urbanismo ecológico autónomo",
    desc: "Desarrollo campestre de referencia pionero en micro-redes autónomas, captación solar e integración de arquitectura bioclimática en quebradas secas. Aplicó los mismos estándares de respeto al entorno y baja huella hídrica que hoy evolucionan en Moon Paracas.",
    metric: "Desarrollo por etapas",
    year: "Consolidado desde 2018",
    features: ["Sistemas solares off-grid", "Paisajismo xerófilo", "Biodigestores estancos"],
    ecoDesc: "Soluciones de energía solar fotovoltaica, digestión anaeróbica estanca y forestación nativa con especies de bajo requerimiento hídrico.",
    infraDesc: "Vías internas afirmadas, pórtico de control de acceso, paisajismo perimetral y equipamiento común de esparcimiento.",
    images: [
      "/media/experience/bahias 1.jpg",
      "/media/experience/bahias 2.jpg",
      "/media/experience/bahias 3.jpg",
      "/media/experience/bahias 4.jpg",
      "/media/experience/bahias 5.jpg",
      "/media/experience/bahias 6.jpg"
    ]
  },
  {
    id: "mar-y-bosques",
    name: "Mar y Bosques",
    location: "Punta Negra, Lima",
    slogan: "Integración de costa y campo con amenidades deportivas",
    desc: "Condominio costero diseñado para conjugar el aire marino con áreas verdes consolidadas, pórtico monumental de seguridad, club house y circuito recreativo familiar. Un antecedente directo en la gestión de comunidades privadas vacacionales.",
    metric: "Comunidad consolidada",
    year: "Entregado y habitado",
    features: ["Pórtico monumental", "Áreas deportivas", "Club House familiar"],
    ecoDesc: "Reglamento estricto de alturas y materiales nobles, riego por goteo y preservación del perfil visual del horizonte.",
    infraDesc: "Pórtico de seguridad 24/7, vías de acceso directo, canchas deportivas, piscina y áreas comunes de recreación.",
    images: [
      "/media/experience/mar y bosques .jpg",
      "/media/experience/mar y bosques 2.jpg",
      "/media/experience/mar y bosques 3.jpg",
      "/media/experience/mar y bosques 4.jpg",
      "/media/experience/mar y bosques 5.jpg",
      "/media/experience/mar y bosques 6.jpg",
      "/media/experience/mar y bosques 7.jpg"
    ]
  },
  {
    id: "la-raya",
    name: "La Raya",
    location: "Cieneguilla, Lima",
    slogan: "Paisajismo productivo y vida de campo de baja densidad",
    desc: "Proyecto campestre enfocado en la coexistencia entre huertos productivos, bio-jardines y residencias de descanso familiar. Demostró la viabilidad de crear microclimas agradables y comunidades organizadas en zonas áridas de Lima.",
    metric: "Alta valorización",
    year: "Operación continua",
    features: ["Bio-huerto productivo", "Saneamiento ecológico", "Club social campestre"],
    ecoDesc: "Sistemas de filtrado y recirculación de agua para riego de olivares y plantas xerófilas, con cero impacto en el manto freático.",
    infraDesc: "Control de ingreso, cerco vivo perimetral, senderos peatonales y club house rústico con áreas de parrilla y fogones.",
    images: [
      "/media/experience/condominio la raya 1.jpg",
      "/media/experience/condominio la raya 2.jpg",
      "/media/experience/condominio la raya 5.jpg",
      "/media/experience/condomnio la raya 5.jpg"
    ]
  }
];

// Single Project Showcase Component
const ProjectShowcase: React.FC<{ project: Project }> = ({ project }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Slideshow Autoplay (5 seconds interval)
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % project.images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying, project.images.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % project.images.length);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-[#E8E1D5] bg-white shadow-[0_20px_50px_rgba(28,22,18,0.06)] transition-all duration-300 hover:border-[#C5A059]/60 lg:flex-row">
      
      {/* Widescreen Slideshow Section (Left/Top) */}
      <div 
        className="w-full lg:w-[45%] h-[300px] sm:h-[380px] lg:h-auto min-h-[380px] relative overflow-hidden bg-stone-950 flex flex-col justify-between p-4 group"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {/* Slideshow Images */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={project.images[currentSlide]}
              alt={`${project.name} view`}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 0.9, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55 }}
              className="absolute inset-0 w-full h-full object-cover filter brightness-[1.03] contrast-[1.02]"
            />
          </AnimatePresence>
          {/* Subtle Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Top Controls Overlay */}
        <div className="relative flex justify-between items-center z-10">
          <button 
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-black/50 backdrop-blur-md border border-white/10 text-white hover:text-[#C85B3E] hover:border-[#C85B3E]/40 transition-all rounded-full cursor-pointer"
            title={isPlaying ? "Pausar presentación" : "Iniciar presentación"}
            aria-label={isPlaying ? "Pausar presentación" : "Iniciar presentación"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
            Foto Real de Obra
          </span>
        </div>

        {/* Center Navigation Arrows */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            type="button"
            onClick={handlePrev}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center cursor-pointer pointer-events-auto active:scale-95 transition-all"
            aria-label={`Imagen anterior de ${project.name}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={handleNext}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center cursor-pointer pointer-events-auto active:scale-95 transition-all"
            aria-label={`Imagen siguiente de ${project.name}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Instagram-style line indicators */}
        <div className="relative z-10 flex gap-1 w-full justify-center">
          {project.images.map((_, idx) => (
            <button
              type="button"
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(false);
                setCurrentSlide(idx);
              }}
              className="h-1 flex-1 max-w-[40px] cursor-pointer transition-all duration-300 relative bg-white/20 overflow-hidden rounded-full"
              aria-label={`Ver imagen ${idx + 1} de ${project.name}`}
            >
              <div 
                className={`h-full bg-[#C85B3E] transition-all duration-300 ${
                  currentSlide === idx ? "w-full" : "w-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Unified Dossier Copy Panel Section (Right/Bottom) */}
      <div className="w-full lg:w-[55%] p-6 sm:p-8 flex flex-col justify-between gap-6 font-sans text-left">
        <div className="space-y-6">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-start justify-between border-b border-[#E8E1D5] pb-4 gap-4">
            <div>
              <h3 className="mb-1 font-display text-3xl font-bold text-[#1C1612]">
                {project.name}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">
                <MapPin className="w-3.5 h-3.5" />
                <span>{project.location}</span>
              </div>
            </div>

            <div className="flex flex-col items-end text-[9px] font-bold uppercase tracking-wider text-[#786F66] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E1D5]">
              <div className="flex items-center gap-1.5 text-[#1C1612]">
                <HardHat className="w-3.5 h-3.5 text-[#C85B3E]" />
                <span>{project.metric}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[#4E6646]">
                <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{project.year}</span>
              </div>
            </div>
          </div>

          {/* Slogan */}
          <p className="text-[#3D352E] font-serif italic text-sm tracking-wide border-l-2 border-[#C85B3E] pl-3">
            "{project.slogan}"
          </p>

          {/* Project Details Description */}
          <p className="text-xs sm:text-sm text-[#38312B] leading-relaxed">
            {project.desc}
          </p>

          {/* 3-Column Technical Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5 border-t border-[#E8E1D5] text-[11px] sm:text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-[#1C1612] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E8E1D5] pb-1">
                <Info className="w-3.5 h-3.5 text-[#C85B3E]" /> Alcance de Obra
              </h4>
              <div className="flex flex-wrap gap-1">
                {project.features.map((f, i) => (
                  <span key={i} className="bg-[#FAF7F2] text-[#1C1612] border border-[#E8E1D5] px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-[#1C1612] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E8E1D5] pb-1">
                <Trees className="w-3.5 h-3.5 text-[#4E6646]" /> Sostenibilidad
              </h4>
              <p className="text-[#786F66] leading-normal text-[11px]">
                {project.ecoDesc}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-[#1C1612] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E8E1D5] pb-1">
                <Layers className="w-3.5 h-3.5 text-[#C5A059]" /> Equipamiento
              </h4>
              <p className="text-[#786F66] leading-normal text-[11px]">
                {project.infraDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom confirmation tag */}
        <div className="flex items-center gap-2 text-[9px] font-bold text-[#4E6646] uppercase tracking-widest border-t border-[#E8E1D5] pt-4">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4E6646]" />
          <span>Experiencia consolidada · Respaldo técnico para Moon Paracas</span>
        </div>
      </div>

    </article>
  );
};

export const Experience: React.FC = () => {
  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-[#FAF8F5] text-[#1C1612]">
      <InteriorHero
        eyebrow="Trayectoria & Respaldo Técnico"
        title={<>Experiencia comprobada.<br /><em className="font-normal text-[#C85B3E]">Innovación en el desierto.</em></>}
        description="Conoce los desarrollos campestres y costeros que consolidan nuestro estándar constructivo, bioclimático y de preservación ambiental antes de aplicarlo al primer Eco-Resort de Paracas."
        index="Experiencia del equipo"
        aside={<p className="mt-4 font-display text-2xl leading-tight text-[#3D352E]">Urbanismo ecológico, energía autónoma y arquitectura noble.</p>}
      />

      <div className="mx-auto max-w-[1400px] space-y-20 px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">

      {/* Corporate Metrics Ribbon */}
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-[#E8E1D5] overflow-hidden rounded-3xl border border-[#E8E1D5] bg-white font-sans md:grid-cols-4 md:divide-x md:divide-y-0 shadow-sm" aria-label="Criterios de verificación">
        
        <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
          <div className="flex items-center justify-between text-[#C85B3E] mb-4">
            <Award className="w-7 h-7" />
            <span className="text-[8px] font-bold uppercase tracking-widest border border-[#C85B3E]/30 px-2 py-0.5 rounded-full">Experiencia</span>
          </div>
          <div>
            <h4 className="text-3xl font-bold font-display text-[#1C1612] mb-1">+8 Años</h4>
            <p className="text-[10px] uppercase font-bold text-[#786F66] tracking-wider">Desarrollo Campestre & Costa</p>
            <p className="text-[10px] text-[#786F66] mt-1 leading-relaxed">Trayectoria en urbanizaciones off-grid de baja densidad.</p>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
          <div className="flex items-center justify-between text-[#4E6646] mb-4">
            <ShieldCheck className="w-7 h-7" />
            <span className="text-[8px] font-bold uppercase tracking-widest border border-[#4E6646]/30 px-2 py-0.5 rounded-full">Legal</span>
          </div>
          <div>
            <h4 className="text-3xl font-bold font-display text-[#1C1612] mb-1">Formalidad</h4>
            <p className="text-[10px] uppercase font-bold text-[#786F66] tracking-wider">Seguridad Notarial</p>
            <p className="text-[10px] text-[#786F66] mt-1 leading-relaxed">Contratos con firmas legalizadas y partida matriz inscrita.</p>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
          <div className="flex items-center justify-between text-[#C5A059] mb-4">
            <Trees className="w-7 h-7" />
            <span className="text-[8px] font-bold uppercase tracking-widest border border-[#C5A059]/30 px-2 py-0.5 rounded-full">Ecología</span>
          </div>
          <div>
            <h4 className="text-3xl font-bold font-display text-[#1C1612] mb-1">Off-Grid</h4>
            <p className="text-[10px] uppercase font-bold text-[#786F66] tracking-wider">Ingeniería Sostenible</p>
            <p className="text-[10px] text-[#786F66] mt-1 leading-relaxed">Energía solar, biodigestores y riego tecnificado por goteo.</p>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
          <div className="flex items-center justify-between text-[#A84F36] mb-4">
            <TrendingUp className="w-7 h-7" />
            <span className="text-[8px] font-bold uppercase tracking-widest border border-[#A84F36]/30 px-2 py-0.5 rounded-full">Plusvalía</span>
          </div>
          <div>
            <h4 className="text-3xl font-bold font-display text-[#1C1612] mb-1">Rentabilidad</h4>
            <p className="text-[10px] uppercase font-bold text-[#786F66] tracking-wider">Valor en el Tiempo</p>
            <p className="text-[10px] text-[#786F66] mt-1 leading-relaxed">Reglamento interno que protege la armonía y el valor de tu lote.</p>
          </div>
        </div>

      </section>

      {/* Title Divider */}
      <div className="max-w-[1200px] mx-auto border-t border-[#E8E1D5] pt-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/40 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36] mb-3">
          <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
          Portafolio de Obras Previas
        </span>
        <h2 className="mb-2 font-display text-3xl sm:text-4xl font-bold text-[#1C1612]">
          Proyectos que inspiran y respaldan a Moon Paracas
        </h2>
        <p className="text-[#786F66] font-sans text-xs sm:text-sm max-w-2xl leading-relaxed">
          Cada desarrollo ejecutado confirma nuestra convicción: la verdadera exclusividad proviene del silencio, la naturaleza y la arquitectura bioclimática bien resuelta.
        </p>
      </div>

      {/* Projects Timeline List */}
      <div className="max-w-[1200px] mx-auto space-y-12">
        {pastProjects.map((project) => (
          <ProjectShowcase key={project.id} project={project} />
        ))}
      </div>

      {/* Quality commitment section */}
      <section className="relative mx-auto max-w-[1100px] space-y-8 rounded-3xl border border-[#C5A059]/40 bg-white p-8 font-sans text-[#3D352E] shadow-lg sm:p-12">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C85B3E]/5 blur-2xl rounded-full" />
        <h2 className="flex items-center justify-center gap-3 pb-3 text-center font-display text-2xl sm:text-3xl font-bold text-[#1C1612]">
          <ShieldCheck className="text-[#4E6646] w-7 h-7" /> El estándar de excelencia para Moon Paracas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs leading-relaxed text-left divide-y md:divide-y-0 md:divide-x divide-[#E8E1D5]">
          <div className="space-y-2.5">
            <h5 className="font-bold text-[#1C1612] uppercase tracking-wider text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C85B3E]" /> Ingeniería Bioclimática Real
            </h5>
            <p className="text-[#786F66]">
              Aerodinámica geodésica anti-viento, barrera vegetal de olivos y aislamiento térmico tricapa para máximo confort sin consumo excesivo.
            </p>
          </div>
          <div className="space-y-2.5 md:pl-6">
            <h5 className="font-bold text-[#1C1612] uppercase tracking-wider text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4E6646]" /> Oasis Central de 5,000 m²
            </h5>
            <p className="text-[#786F66]">
              Laguna zen con paisajismo xerófilo de bajo consumo hídrico, circuito de caminatas y club house para toda la comunidad.
            </p>
          </div>
          <div className="space-y-2.5 md:pl-6">
            <h5 className="font-bold text-[#1C1612] uppercase tracking-wider text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C5A059]" /> Seguridad Jurídica Total
            </h5>
            <p className="text-[#786F66]">
              Adjudicación perpetua de uso exclusivo con firmas legalizadas ante notario público, partida matriz y reglamento de preservación ecológica.
            </p>
          </div>
        </div>
      </section>

      {/* CTA to return to main simulation funnel */}
      <div className="max-w-2xl mx-auto text-center space-y-4 pt-4 pb-8">
        <h2 className="font-display text-3xl font-bold text-[#1C1612]">¿Listo para elegir tu lote en Paracas?</h2>
        <p className="text-xs text-[#786F66] max-w-md mx-auto">
          Lotes de 120 m² a solo $120 USD/m² ($14,400 USD). Separa hoy con S/ 1,000 y financia directo hasta en 36 meses.
        </p>
        <div className="pt-2">
          <Link
            to="/simulador"
            className="inline-flex items-center gap-3 rounded-2xl bg-[#C85B3E] px-8 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-[#C85B3E]/25 hover:bg-[#A84F36] transition duration-200"
          >
            <span>Ver Disponibilidad en Masterplan</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

