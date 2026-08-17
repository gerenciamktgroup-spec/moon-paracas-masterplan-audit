import React from "react";
import { ShieldAlert, Wind, Mountain, CheckCircle, Droplet, CarFront } from "lucide-react";

export const EngineeringSpecs: React.FC = () => {
  const specs = [
    {
      title: "Cimentación sujeta a estudio de suelos y cálculo estructural",
      icon: <Mountain className="h-6 w-6 text-[#E2725B]" />,
      num: "01",
      content: "La condición aparente del tablazo debe confirmarse con investigación geotécnica específica. El sistema de cimentación de cada vivienda será definido y firmado por un ingeniero estructural según suelo, cargas, norma sismorresistente y expediente aprobado."
    },
    {
      title: "Cemento Tipo V contra la Erosión y Salitre",
      icon: <ShieldAlert className="h-6 w-6 text-[#E2725B]" />,
      num: "02",
      content: "La exposición costera exige especificar durabilidad, recubrimiento del acero y resistencia a sulfatos a partir del estudio del terreno y del diseño estructural. El tipo de cemento y la dosificación final deben constar en la memoria técnica de cada obra."
    },
    {
      title: "Urbanismo Sinuoso: Mitigación del Viento Alisio",
      icon: <Wind className="h-6 w-6 text-[#E2725B]" />,
      num: "03",
      content: "El trazado curvo busca reducir recorridos visuales y crear transiciones de paisaje. Su desempeño frente al viento, el control de polvo y la solución de calzada requieren validación ambiental, de drenaje, tránsito y mantenimiento antes de su ejecución definitiva."
    },
    {
      title: "Cota referencial y gestión de riesgos naturales",
      icon: <CheckCircle className="h-6 w-6 text-[#E2725B]" />,
      num: "04",
      content: "La elevación referencial del predio es una variable favorable que debe contrastarse con levantamiento topográfico, mapas oficiales de peligro, rutas de evacuación y estudios de drenaje. Ninguna ubicación permite afirmar riesgo cero ante eventos naturales."
    },
    {
      title: "Saneamiento autónomo con operación verificable",
      icon: <Droplet className="h-6 w-6 text-[#E2725B]" />,
      num: "05",
      content: "Las soluciones autónomas de tratamiento deben dimensionarse, autorizarse y mantenerse según ocupación y normativa aplicable. La ficha final debe indicar proveedor, capacidad, calidad del efluente, destino permitido, frecuencia de mantenimiento y responsable de operación."
    },
    {
      title: "Movilidad interior de baja velocidad",
      icon: <CarFront className="h-6 w-6 text-[#E2725B]" />,
      num: "06",
      content: "La propuesta prioriza recorridos peatonales, bicicletas y movilidad eléctrica desde hubs periféricos. El reglamento definitivo debe contemplar accesibilidad, emergencias, carga, visitas, límites de velocidad y capacidad real de estacionamiento."
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-10">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <h3 className="font-display text-3xl sm:text-4xl font-bold text-white uppercase tracking-wide">
          Seguridad, Paisajismo <span className="text-[#E2725B] font-light">e Ingeniería</span>
        </h3>
        <p className="text-stone-300 max-w-2xl mx-auto text-xs sm:text-sm font-light leading-relaxed">
          Criterios preliminares para revisar con ingeniería, permisos y especificaciones firmadas antes de construir.
        </p>
      </div>

      {/* Grid structure replacing the vertical accordions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specs.map((spec, index) => (
          <div 
            key={index} 
            className="group relative border border-white/10 hover:border-[#E2725B]/40 bg-[#1D1714]/25 p-6 rounded-none flex flex-col justify-between min-h-[250px] transition-all duration-300 hover:translate-y-[-4px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[#E2725B]/5"
          >
            {/* Elegant Number overlay on top-right */}
            <span className="absolute top-4 right-6 text-6xl font-display font-black text-[#E1D9C1]/5 select-none pointer-events-none transition-colors group-hover:text-[#E2725B]/10">
              {spec.num}
            </span>

            <div className="space-y-4">
              <div className="p-3 bg-stone-900/40 border border-white/5 inline-flex items-center justify-center rounded-none text-[#E2725B] transition-colors group-hover:bg-[#E2725B]/10">
                {spec.icon}
              </div>
              <h4 className="font-display text-base font-bold text-white uppercase tracking-wide leading-tight group-hover:text-[#E2725B] transition-colors text-left">
                {spec.title}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed font-light font-sans text-left">
                {spec.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
