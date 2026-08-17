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
  TrendingUp
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
    slogan: "Antecedente declarado sujeto a verificación documental",
    desc: "El equipo promotor presenta Las Bahías como un antecedente de desarrollo rural por etapas y soluciones autónomas. Antes de usarlo como respaldo de Moon Paracas, solicita la identificación del titular, planos, licencias, actas, responsables técnicos y evidencia de entrega.",
    metric: "Escala declarada · solicitar sustento",
    year: "Estado declarado desde 2018 · verificar",
    features: ["Sistemas autónomos declarados", "Paisajismo declarado", "Desarrollo por etapas"],
    ecoDesc: "Se declaran soluciones solares, biodigestores y forestación. Deben comprobarse su alcance, funcionamiento, permisos, mantenimiento y correspondencia con las imágenes publicadas.",
    infraDesc: "Se declaran vías internas, control de acceso y equipamiento común. Solicita planos, actas de entrega, registros de operación y una visita para verificar su estado actual.",
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
    slogan: "Referencia visual declarada; alcance por comprobar",
    desc: "El equipo promotor presenta Mar y Bosques como un antecedente de integración paisajística, acceso y áreas comunes. La relación contractual o técnica con Moon Paracas debe demostrarse mediante documentos y responsables identificables.",
    metric: "Escala y lotes declarados · verificar",
    year: "Culminación declarada · solicitar actas",
    features: ["Pórtico declarado", "Áreas deportivas declaradas", "Club house declarado"],
    ecoDesc: "Se declaran parámetros de altura, materiales y riego. Solicita el reglamento aplicable, autorizaciones, memoria de paisajismo y evidencia de mantenimiento actual.",
    infraDesc: "Se declaran vías, pórtico y equipamiento común. La visita y los documentos deben confirmar ubicación, alcance, entrega y estado operativo.",
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
    slogan: "Antecedente paisajístico declarado; evidencia requerida",
    desc: "El equipo promotor presenta La Raya como un antecedente agrícola y residencial con equipamiento común. Las cifras, titularidad, licencias, entrega y operación deben verificarse antes de atribuirle valor probatorio.",
    metric: "Escala declarada · solicitar documentos",
    year: "Venta y entrega declaradas · verificar",
    features: ["Plantación declarada", "Equipamiento declarado", "Saneamiento declarado"],
    ecoDesc: "Se declara una operación agrícola con bombeo, filtrado y riego. Solicita licencias, responsables, capacidad, mantenimiento y evidencia de funcionamiento.",
    infraDesc: "Se declaran control de acceso, vías y club house. Confirma su existencia, alcance y estado mediante visita, actas y documentos emitidos por sus titulares.",
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
    <article className="flex flex-col overflow-hidden rounded-md border border-white/10 bg-[#162220] shadow-[0_28px_80px_rgba(0,0,0,0.22)] transition-colors duration-300 hover:border-[#d5aa83]/30 lg:flex-row">
      
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
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55 }}
              className="absolute inset-0 w-full h-full object-cover filter brightness-[1.05] contrast-[1.02]"
            />
          </AnimatePresence>
          {/* Subtle Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/35 pointer-events-none" />
        </div>

        {/* Top Controls Overlay */}
        <div className="relative flex justify-between items-center z-10">
          <button 
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-black/50 backdrop-blur-md border border-white/10 text-white hover:text-[#E2725B] hover:border-[#E2725B]/40 transition-all rounded-full cursor-pointer"
            title={isPlaying ? "Pausar presentación" : "Iniciar presentación"}
            aria-label={isPlaying ? "Pausar presentación" : "Iniciar presentación"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
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
              className="h-1 flex-1 max-w-[40px] cursor-pointer transition-all duration-300 relative bg-white/20 overflow-hidden"
              aria-label={`Ver imagen ${idx + 1} de ${project.name}`}
            >
              <div 
                className={`h-full bg-[#E2725B] transition-all duration-300 ${
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
          <div className="flex flex-wrap items-start justify-between border-b border-white/10 pb-4 gap-4">
            <div>
              <h3 className="mb-1.5 font-display text-3xl font-medium text-white">
                {project.name}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#E2725B] font-mono">
                <MapPin className="w-3.5 h-3.5" />
                <span>{project.location}</span>
              </div>
            </div>

            <div className="flex flex-col items-end text-[9px] font-bold uppercase tracking-wider text-stone-300 bg-stone-900/40 p-2 border border-white/5 font-mono">
              <div className="flex items-center gap-1.5 text-white">
                <HardHat className="w-3.5 h-3.5 text-[#E2725B]" />
                <span>{project.metric}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-stone-400">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>{project.year}</span>
              </div>
            </div>
          </div>

          {/* Slogan */}
          <p className="text-stone-300 font-serif italic text-sm tracking-wide border-l-2 border-[#E2725B] pl-3">
            "{project.slogan}"
          </p>

          {/* Project Details Description */}
          <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
            {project.desc}
          </p>

          {/* 3-Column Technical Grid - Replaces Clunky Internal Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10 text-[11px] sm:text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1">
                <Info className="w-3.5 h-3.5 text-[#E2725B]" /> Ficha de Obra
              </h4>
              <div className="flex flex-wrap gap-1">
                {project.features.map((f, i) => (
                  <span key={i} className="bg-stone-900/50 text-[#E1D9C1] border border-white/5 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider rounded-sm">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1">
                <Trees className="w-3.5 h-3.5 text-[#E2725B]" /> Sostenibilidad
              </h4>
              <p className="text-stone-400 leading-normal font-light">
                {project.ecoDesc}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1">
                <Layers className="w-3.5 h-3.5 text-[#E2725B]" /> Habilitación
              </h4>
              <p className="text-stone-400 leading-normal font-light">
                {project.infraDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom confirmation tag */}
        <div className="flex items-center gap-2 text-[9px] font-bold text-white/90 uppercase tracking-widest border-t border-white/5 pt-4 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#E2725B]" />
          <span>Información declarada por el promotor · Solicita sustento documental</span>
        </div>
      </div>

    </article>
  );
};

export const Experience: React.FC = () => {
  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-[#111715] text-[#E1D9C1]">
      <InteriorHero
        eyebrow="Antecedentes para verificar"
        title={<>Trayectoria declarada.<br /><em className="font-normal text-[#d5aa83]">Evidencia por revisar.</em></>}
        description="El equipo promotor declara experiencia en proyectos previos. Organizamos sus referencias visuales y técnicas para que puedas pedir partidas, licencias, actas y contactos antes de atribuirlas como respaldo de Moon Paracas."
        index="Experiencia del equipo"
        aside={<p className="mt-4 font-display text-2xl leading-tight text-white/78">Identidad, documentos, obra y referencias independientes.</p>}
      />

      <div className="mx-auto max-w-[1400px] space-y-20 px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">

      {/* Corporate Metrics Ribbon (Quiet Luxury styling) */}
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-white/10 overflow-hidden rounded-md border border-white/10 bg-[#162220] font-sans md:grid-cols-4 md:divide-x md:divide-y-0" aria-label="Criterios de verificación">
        
        <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
          <div className="flex items-center justify-between text-[#E2725B] mb-4">
            <Award className="w-7 h-7" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono border border-[#E2725B]/30 px-2 py-0.5 rounded-sm">Identidad</span>
          </div>
          <div>
            <h4 className="text-3xl font-light font-display text-white mb-1">Equipo y rol</h4>
            <p className="text-[10px] uppercase font-bold text-stone-300 tracking-wider">Quién ejecutó cada proyecto</p>
            <p className="text-[10px] text-stone-400 mt-1 font-light leading-relaxed">Contrasta razón social, participación y responsables técnicos.</p>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
          <div className="flex items-center justify-between text-[#E2725B] mb-4">
            <ShieldCheck className="w-7 h-7" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono border border-[#E2725B]/30 px-2 py-0.5 rounded-sm">Legal</span>
          </div>
          <div>
            <h4 className="text-3xl font-light font-display text-white mb-1">Partidas</h4>
            <p className="text-[10px] uppercase font-bold text-stone-300 tracking-wider">Vigencia y correspondencia</p>
            <p className="text-[10px] text-stone-400 mt-1 font-light leading-relaxed">Solicita copias actuales y relación con el proyecto mostrado.</p>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
          <div className="flex items-center justify-between text-[#E2725B] mb-4">
            <Trees className="w-7 h-7" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono border border-[#E2725B]/30 px-2 py-0.5 rounded-sm">Obra</span>
          </div>
          <div>
            <h4 className="text-3xl font-light font-display text-white mb-1">Evidencia</h4>
            <p className="text-[10px] uppercase font-bold text-stone-300 tracking-wider">Fecha, lugar y alcance</p>
            <p className="text-[10px] text-stone-400 mt-1 font-light leading-relaxed">Distingue fotos propias, renders y obras de terceros.</p>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
          <div className="flex items-center justify-between text-[#E2725B] mb-4">
            <TrendingUp className="w-7 h-7" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono border border-[#E2725B]/30 px-2 py-0.5 rounded-sm">Referencias</span>
          </div>
          <div>
            <h4 className="text-3xl font-light font-display text-white mb-1">Contactos</h4>
            <p className="text-[10px] uppercase font-bold text-stone-300 tracking-wider">Clientes y proveedores</p>
            <p className="text-[10px] text-stone-400 mt-1 font-light leading-relaxed">Pide referencias independientes y autorización de contacto.</p>
          </div>
        </div>

      </section>

      {/* Title Divider */}
      <div className="max-w-[1200px] mx-auto border-t border-[rgba(225,217,193,0.15)] pt-12">
        <h2 className="mb-2 flex items-center gap-2 font-display text-3xl font-medium text-white">
          <Award className="text-[#E2725B] w-5 h-5" /> Antecedentes declarados
        </h2>
        <p className="text-stone-300 font-sans text-xs font-light">
          Explora los proyectos que el equipo declara como antecedentes. Los datos y fotografías deben validarse con su expediente y responsables:
        </p>
      </div>

      {/* Projects Timeline List */}
      <div className="max-w-[1200px] mx-auto space-y-16">
        {pastProjects.map((project) => (
          <ProjectShowcase key={project.id} project={project} />
        ))}
      </div>

      {/* Quality commitment section (Certificate style) */}
      <section className="relative mx-auto max-w-[1000px] space-y-8 rounded-md border border-[#E1D9C1]/15 bg-[#162220] p-8 font-sans text-stone-300 shadow-inner sm:p-12">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#E2725B]/5 blur-2xl rounded-full" />
        <h2 className="flex items-center justify-center gap-3 pb-3 text-center font-display text-3xl font-normal text-white">
          <ShieldCheck className="text-[#E2725B] w-6 h-6" /> El estándar que Moon debe demostrar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-light leading-relaxed text-left divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B]" /> Ingeniería Off-Grid Real
            </h5>
            <p className="text-stone-400">
              Solicita memorias, proveedores y registros de operación que demuestren el desempeño de las soluciones off-grid atribuidas a proyectos previos.
            </p>
          </div>
          <div className="space-y-3 md:pl-6">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B]" /> Reforestación Activa
            </h5>
            <p className="text-stone-400">
              Contrasta especies, fuente de agua, permisos, consumo y mantenimiento antes de trasladar una experiencia de Cieneguilla al desierto costero.
            </p>
          </div>
          <div className="space-y-3 md:pl-6">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B]" /> Transparencia Legal Registral
            </h5>
            <p className="text-stone-400">
              La formalización futura depende del título, el instrumento de compra y las aprobaciones aplicables. Moon debe documentar el estado actual y no promete una partida individual inmediata.
            </p>
          </div>
        </div>
      </section>

      {/* CTA to return to main simulation funnel */}
      <div className="max-w-2xl mx-auto text-center space-y-4 pt-4 pb-8">
        <h2 className="font-display text-3xl font-medium text-white">¿Listo para explorar tu lote en Paracas?</h2>
        <p className="text-xs text-stone-300 font-light font-sans">
          Aplica este mismo estándar constructivo, paisajístico y ecológico en tu futuro lote privado de Moon Paracas.
        </p>
        <div className="pt-2">
          <Link
            to="/simulador"
            className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_15px_rgba(226,114,91,0.18)]"
          >
            <span>Ver Masterplan e Iniciar Simulación</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};
