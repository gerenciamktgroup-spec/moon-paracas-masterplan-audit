import React from "react";
import { Link } from "react-router-dom";
import { Lot } from "../types/map";
import { MessageCircle, ShieldCheck, MapPin, Mail, Phone, Sparkles, Download, Calendar } from "lucide-react";
import { PROJECT, CONTACT, whatsappHref } from "../config/project";
import { LOT_PRICE_PER_M2_USD, STANDARD_LOT_PRICE_USD, STANDARD_LOT_PRICE_PEN } from "../config/pricing";

export const Footer: React.FC<{ selectedLot?: Lot | null; onOpenDossier?: () => void; onOpenShowroom?: () => void }> = ({ 
  selectedLot,
  onOpenDossier,
  onOpenShowroom
}) => {
  const waMsg = selectedLot
    ? `Hola! Quiero información del Lote ${selectedLot.number} en ${PROJECT.name}.`
    : `Hola! Deseo más información sobre los lotes de 120 m² a $120/m² en Moon Paracas.`;

  return (
    <footer className="bg-[#F4EFE6] border-t border-[#E8E1D5] text-[#38312B] pt-20 pb-12 font-sans">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#E8E1D5]">
          
          {/* Brand & Concept */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#161311]">
              MOON <span className="font-serif-italic font-normal text-[#C85B3E]">PARACAS</span>
            </h3>
            <p className="text-xs text-[#786F66] leading-relaxed max-w-md">
              El primer Eco-Resort privado en la pampa interior de Paracas, Ica. Lotes desde 120 m² para casa domo a solo ${LOT_PRICE_PER_M2_USD} USD/m² (desde ${STANDARD_LOT_PRICE_USD.toLocaleString()} USD), lotes dobles de 240 m² y acceso vitalicio al Oasis central de 5,000 m².
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#4E6646]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4E6646]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Asociación & Adjudicación Notarial</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#C85B3E]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C85B3E]">
                <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>Separa con S/ 1,000</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#161311]">Navegación & Inversión</h4>
            <ul className="space-y-2.5 text-xs text-[#786F66]">
              <li><Link to="/simulador" className="hover:text-[#C85B3E] transition">Masterplan 3D & Lotes</Link></li>
              <li><Link to="/paracas-dome" className="hover:text-[#C85B3E] transition">Paracas Dome (Modelos)</Link></li>
              <li><Link to="/experiencia" className="hover:text-[#C85B3E] transition">Trayectoria & Obras Previas</Link></li>
              <li><Link to="/galeria" className="hover:text-[#C85B3E] transition">Galería de Arquitectura</Link></li>
              <li><Link to="/documentos" className="hover:text-[#C85B3E] transition">Bóveda Legal y Notarial</Link></li>
              {onOpenDossier && (
                <li>
                  <button onClick={onOpenDossier} className="hover:text-[#C85B3E] transition flex items-center gap-1 text-[#A84F36] font-semibold cursor-pointer">
                    <Download className="h-3 w-3" /> Descargar Dossier 2026
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#161311]">Atención Lima & Paracas</h4>
            <div className="space-y-2.5 text-xs text-[#786F66]">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#A84F36]" /> Km 240 Panamericana Sur, Paracas, Ica, Perú</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#A84F36]" /> {CONTACT.phoneLabel || "+51 987 654 321"}</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#A84F36]" /> {CONTACT.email || "contacto@moonparacas.pe"}</p>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href={whatsappHref(waMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#C85B3E] px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-[#C85B3E]/20 transition-all duration-300 hover:bg-[#A84F36]"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                <span>Contactar Asesor VIP por WhatsApp</span>
              </a>
              {onOpenShowroom && (
                <button
                  onClick={onOpenShowroom}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#C5A059]/50 bg-white px-6 py-3 text-xs font-bold text-[#161311] hover:bg-[#FAF7F2] transition cursor-pointer"
                >
                  <Calendar className="h-4 w-4 text-[#C5A059]" />
                  <span>Agendar Visita o Cita Showroom Lima</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#786F66]">
          <p>© {new Date().getFullYear()} Moon Paracas. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link to="/privacidad" className="hover:text-[#161311] transition">Privacidad</Link>
            <Link to="/terminos" className="hover:text-[#161311] transition">Términos</Link>
            <Link to="/documentos" className="hover:text-[#161311] transition">Expediente Legal</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

