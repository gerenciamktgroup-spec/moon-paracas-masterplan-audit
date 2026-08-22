import React, { useState } from "react";
import { X, Calendar, MapPin, Sparkles, MessageCircle, ShieldCheck, CheckCircle2, Clock, Car, Coffee, Video } from "lucide-react";
import { CONTACT, whatsappHref } from "../../config/project";
import { trackEvent } from "../../lib/analytics";

interface ShowroomVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShowroomVisitModal: React.FC<ShowroomVisitModalProps> = ({ isOpen, onClose }) => {
  const [experienceType, setExperienceType] = useState<"paracas" | "lima" | "zoom">("paracas");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    preferredDay: "Sábado próximo",
    partySize: "2 personas",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    trackEvent("schedule_visit", {
      type: experienceType,
      day: formData.preferredDay,
    });

    const expTitles = {
      paracas: "Visita Guiada al Predio en Paracas (Km 240)",
      lima: "Reunión Privada en Showroom / Café Ejecutivo en Lima",
      zoom: "Videollamada 1 a 1 por Google Meet / Zoom",
    };

    const leadMsg = `Hola! Deseo agendar una *${expTitles[experienceType]}* para conocer Moon Paracas.\n\n*Mis Datos:*\n- Nombre: ${formData.name}\n- Teléfono: ${formData.phone}\n- Correo: ${formData.email}\n- Fecha estimada: ${formData.preferredDay}\n- Asistentes: ${formData.partySize}\n\nPor favor, confirmemos el horario disponible.`;

    setIsSubmitted(true);

    if (CONTACT.whatsapp) {
      setTimeout(() => {
        window.open(whatsappHref(leadMsg), "_blank");
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-[#FAF7F2] border border-[#C5A059]/40 p-6 sm:p-9 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#4E6646]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#C85B3E]/10 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/80 border border-[#E8E1D5] text-[#161311] hover:bg-[#161311] hover:text-white transition cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="h-4 w-4" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4E6646] mb-2">
              <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
              Experiencia Personalizada · Atención VIP
            </div>
            
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#161311]">
              Coordina tu Visita o Cita Privada
            </h3>
            
            <p className="mt-1.5 text-xs text-[#786F66] leading-relaxed">
              Elige cómo deseas conocer Moon Paracas: en el predio frente al Oasis, en Lima o de forma virtual.
            </p>

            {/* Selector de Tipo de Experiencia */}
            <div className="mt-6 grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setExperienceType("paracas")}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  experienceType === "paracas"
                    ? "border-[#C85B3E] bg-white shadow-md ring-1 ring-[#C85B3E]"
                    : "border-[#E8E1D5] bg-[#FAF7F2] hover:bg-white text-[#786F66]"
                }`}
              >
                <Car className={`h-5 w-5 mb-2 ${experienceType === "paracas" ? "text-[#C85B3E]" : "text-[#786F66]"}`} />
                <div>
                  <span className="block text-[11px] font-bold text-[#161311]">Visita Predio</span>
                  <span className="text-[9px] text-[#786F66]">Paracas (Km 240)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExperienceType("lima")}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  experienceType === "lima"
                    ? "border-[#C5A059] bg-white shadow-md ring-1 ring-[#C5A059]"
                    : "border-[#E8E1D5] bg-[#FAF8F5] hover:bg-white text-[#786F66]"
                }`}
              >
                <Coffee className={`h-5 w-5 mb-2 ${experienceType === "lima" ? "text-[#C5A059]" : "text-[#786F66]"}`} />
                <div>
                  <span className="block text-[11px] font-bold text-[#161311]">Showroom Lima</span>
                  <span className="text-[9px] text-[#786F66]">San Isidro / Surco</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExperienceType("zoom")}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  experienceType === "zoom"
                    ? "border-[#4E6646] bg-white shadow-md ring-1 ring-[#4E6646]"
                    : "border-[#E8E1D5] bg-[#FAF7F2] hover:bg-white text-[#786F66]"
                }`}
              >
                <Video className={`h-5 w-5 mb-2 ${experienceType === "zoom" ? "text-[#4E6646]" : "text-[#786F66]"}`} />
                <div>
                  <span className="block text-[11px] font-bold text-[#161311]">Videollamada</span>
                  <span className="text-[9px] text-[#786F66]">Zoom / Meet 1 a 1</span>
                </div>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Valeria Quiroz"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2.5 text-xs text-[#161311] placeholder-[#A0988E] focus:border-[#C85B3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                    WhatsApp de Contacto
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+51 987 654 321"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2.5 text-xs text-[#161311] placeholder-[#A0988E] focus:border-[#C85B3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                    Fecha o Día Preferido
                  </label>
                  <select
                    value={formData.preferredDay}
                    onChange={(e) => setFormData({ ...formData, preferredDay: e.target.value })}
                    className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2.5 text-xs text-[#161311] focus:border-[#C85B3E] focus:outline-none"
                  >
                    <option value="Este Sábado">Este Sábado (Salida Paracas)</option>
                    <option value="Este Domingo">Este Domingo (Salida Paracas)</option>
                    <option value="Próxima Semana (Lunes a Viernes)">Lunes a Viernes en Lima</option>
                    <option value="Fin de Semana Siguiente">Fin de Semana Siguiente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                    Acompañantes
                  </label>
                  <select
                    value={formData.partySize}
                    onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                    className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2.5 text-xs text-[#161311] focus:border-[#C85B3E] focus:outline-none"
                  >
                    <option value="1 persona">Solo yo</option>
                    <option value="2 personas (Pareja)">2 personas (Pareja)</option>
                    <option value="Familia (3 a 4 personas)">Familia (3 a 4 personas)</option>
                    <option value="Grupo de Inversionistas">Grupo de Inversionistas</option>
                  </select>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#161311] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-[#C85B3E] transition duration-200 cursor-pointer"
                >
                  <Calendar className="h-4 w-4 text-[#C5A059]" />
                  <span>Confirmar y Agendar con Asesor VIP</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#786F66] pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#4E6646]" />
                <span>Atención ejecutiva sin compromiso. Reserva tu espacio exclusivo.</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4E6646]/10 text-[#4E6646]">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            
            <h3 className="font-display text-2xl font-bold text-[#161311]">
              ¡Solicitud de Cita Registrada!
            </h3>
            
            <p className="text-xs text-[#786F66] max-w-sm mx-auto leading-relaxed">
              Un asesor senior de Moon Paracas se pondrá en contacto contigo vía WhatsApp o llamada para confirmar los detalles de tu visita o reunión.
            </p>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#161311] text-white text-xs font-bold hover:bg-[#C85B3E] transition cursor-pointer"
              >
                Listo, volver al sitio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
