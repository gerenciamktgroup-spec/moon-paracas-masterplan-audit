import React, { useState } from "react";
import { X, FileText, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Download, MessageCircle } from "lucide-react";
import { CONTACT, whatsappHref } from "../../config/project";
import { trackEvent } from "../../lib/analytics";

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    district: "Surco",
    intent: "Segunda Vivienda & Escape",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    trackEvent("download_dossier", {
      district: formData.district,
      intent: formData.intent,
    });

    // Generar mensaje de WhatsApp con los datos del lead para el equipo comercial
    const leadMsg = `Hola! Acabo de solicitar el Dossier de Inversión 2026 de Moon Paracas.\n\n*Mis Datos:*\n- Nombre: ${formData.name}\n- WhatsApp: ${formData.whatsapp}\n- Email: ${formData.email}\n- Distrito en Lima: ${formData.district}\n- Interés: ${formData.intent}\n\nPor favor, envíenme también la lista de lotes disponibles actualizados.`;

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Abrir PDF en nueva pestaña
      const pdfUrl = "/documents/Moon_Paracas_Brochure_Comercial_V2.2_2026.pdf";
      window.open(pdfUrl, "_blank");

      // Redirigir suavemente o preparar WhatsApp
      if (CONTACT.whatsapp) {
        setTimeout(() => {
          window.open(whatsappHref(leadMsg), "_blank");
        }, 1200);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#FAF7F2] border border-[#C5A059]/40 p-6 sm:p-9 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow decorativo de fondo */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C85B3E]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#C5A059]/10 blur-3xl" />

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/80 border border-[#E8E1D5] text-[#161311] hover:bg-[#161311] hover:text-white transition"
          aria-label="Cerrar modal"
        >
          <X className="h-4 w-4" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header del Modal */}
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36] mb-2">
              <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
              Acceso Exclusivo · Inversionistas Lima
            </div>
            
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#161311] leading-tight">
              Descarga el Dossier Ejecutivo & Masterplan 2026
            </h3>
            
            <p className="mt-2 text-xs text-[#786F66] leading-relaxed">
              Incluye plano detallado de las 4 aldeas, desglose de cotizaciones desde $14,400 USD ($120/m²), memorias técnicas del domo y proyecciones de rentabilidad Airbnb.
            </p>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2.5 text-xs text-[#161311] placeholder-[#A0988E] focus:border-[#C85B3E] focus:outline-none focus:ring-1 focus:ring-[#C85B3E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                    WhatsApp / Teléfono
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+51 987 654 321"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2.5 text-xs text-[#161311] placeholder-[#A0988E] focus:border-[#C85B3E] focus:outline-none focus:ring-1 focus:ring-[#C85B3E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2.5 text-xs text-[#161311] placeholder-[#A0988E] focus:border-[#C85B3E] focus:outline-none focus:ring-1 focus:ring-[#C85B3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                    Distrito en Lima
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2.5 text-xs text-[#161311] focus:border-[#C85B3E] focus:outline-none"
                  >
                    <option value="Santiago de Surco">Santiago de Surco</option>
                    <option value="San Isidro">San Isidro</option>
                    <option value="Miraflores">Miraflores</option>
                    <option value="La Molina">La Molina</option>
                    <option value="San Borja">San Borja</option>
                    <option value="Magdalena / San Miguel">Magdalena / San Miguel</option>
                    <option value="Barranco">Barranco</option>
                    <option value="Otros Distritos / Provincias">Otros / Extranjero</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                    Principal Interés
                  </label>
                  <select
                    value={formData.intent}
                    onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                    className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2.5 text-xs text-[#161311] focus:border-[#C85B3E] focus:outline-none"
                  >
                    <option value="Segunda Vivienda & Escape">Segunda Vivienda & Escape</option>
                    <option value="Inversión y Renta Airbnb">Inversión y Renta Airbnb</option>
                    <option value="Plusvalía Patrimonial">Plusvalía Patrimonial</option>
                    <option value="Lote Doble Familiar (240 m²)">Lote Doble Familiar (240 m²)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#C85B3E] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#C85B3E]/25 hover:bg-[#A84F36] transition duration-200 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{isSubmitting ? "Generando Acceso..." : "Descargar Dossier PDF Gratuito"}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#786F66] pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#4E6646]" />
                <span>Tus datos son 100% confidenciales. Cero spam.</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4E6646]/10 text-[#4E6646]">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            
            <h3 className="font-display text-2xl font-bold text-[#161311]">
              ¡Dossier Listo y Enviado!
            </h3>
            
            <p className="text-xs text-[#786F66] max-w-sm mx-auto leading-relaxed">
              El documento oficial se ha abierto en tu navegador. También te hemos conectado con nuestro <strong>Concierge VIP</strong> por WhatsApp para responder cualquier duda técnica o separar tu lote con S/ 1,000.
            </p>

            <div className="pt-4 flex flex-col gap-2.5">
              <a
                href="/documents/Moon_Paracas_Brochure_Comercial_V2.2_2026.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#161311] py-3.5 text-xs font-bold text-white hover:bg-[#C85B3E] transition"
              >
                <Download className="h-4 w-4" />
                <span>Volver a Abrir PDF</span>
              </a>
              <button
                onClick={onClose}
                className="text-xs font-bold text-[#786F66] hover:text-[#161311] py-2 cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
