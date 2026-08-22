import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Menu, X, Sparkles, Map, Download, Calendar } from "lucide-react";
import { PROJECT, whatsappHref } from "../config/project";

interface HeaderProps {
  onOpenDossier?: () => void;
  onOpenShowroom?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDossier, onOpenShowroom }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 25);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Paracas Dome", href: "/paracas-dome", highlight: true },
    { name: "Masterplan 3D", href: "/simulador" },
    { name: "Experiencia", href: "/experiencia" },
    { name: "Bóveda Legal", href: "/documentos" },
  ];

  const waHeaderMsg = "Hola! Quisiera más información sobre los lotes y domos de Moon Paracas.";

  return (
    <header className="fixed top-0 inset-x-0 z-50 transition-all duration-500 py-4 sm:py-6 px-4 sm:px-8">
      <div
        className={`mx-auto max-w-[1280px] rounded-full px-5 sm:px-8 py-3.5 sm:py-4 transition-all duration-500 flex items-center justify-between ${
          isScrolled
            ? "glass-island shadow-[0_20px_50px_rgba(22,19,17,0.08)] py-3"
            : "bg-white/60 backdrop-blur-md border border-white/70 shadow-sm"
        }`}
      >
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="h-2 w-2 rounded-full bg-[#C85B3E] animate-pulse" />
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#161311]">
            MOON <span className="font-serif-italic font-normal text-[#C85B3E]">PARACAS</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-200 ${
                  isActive
                    ? "text-[#C85B3E] font-bold"
                    : "text-[#38312B] hover:text-[#C85B3E]"
                } ${link.highlight ? "flex items-center gap-1.5 text-[#A84F36]" : ""}`}
              >
                {link.highlight && <Sparkles className="h-3 w-3 text-[#C5A059]" />}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {onOpenDossier && (
            <button
              onClick={onOpenDossier}
              className="flex items-center gap-1.5 rounded-full border border-[#C5A059]/40 bg-white/90 px-3.5 py-2 text-xs font-bold text-[#A84F36] shadow-sm transition hover:bg-[#FAF7F2] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Dossier 2026</span>
            </button>
          )}

          <Link
            to="/simulador"
            className="flex items-center gap-1.5 rounded-full border border-[#E8E1D5] bg-white/90 px-4 py-2 text-xs font-bold text-[#161311] shadow-sm transition hover:bg-[#FAF7F2] hover:border-[#D9CDB8]"
          >
            <Map className="h-3.5 w-3.5 text-[#4E6646]" />
            <span>Ver Lotes</span>
          </Link>

          <a
            href={whatsappHref(waHeaderMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-[#C85B3E] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#C85B3E]/20 transition-all duration-300 hover:bg-[#A84F36] hover:shadow-lg active:scale-95"
          >
            <MessageCircle className="h-3.5 w-3.5 fill-current" />
            <span>Reservar Lote</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-full bg-white/90 border border-[#E8E1D5] text-[#161311] shadow-sm"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 mx-auto max-w-[1280px] rounded-3xl glass-card p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold uppercase tracking-wider text-[#161311] py-1.5 hover:text-[#C85B3E]"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#E8E1D5] flex flex-col gap-2.5">
            {onOpenDossier && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDossier();
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#C5A059] bg-white py-3 text-xs font-bold text-[#A84F36] shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Descargar Dossier 2026</span>
              </button>
            )}
            {onOpenShowroom && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenShowroom();
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#E8E1D5] bg-white py-3 text-xs font-bold text-[#161311] shadow-sm"
              >
                <Calendar className="h-4 w-4 text-[#4E6646]" />
                <span>Agendar Cita Showroom Lima</span>
              </button>
            )}
            <a
              href={whatsappHref(waHeaderMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#C85B3E] py-3.5 text-xs font-bold text-white shadow"
            >
              <MessageCircle className="h-4 w-4 fill-current" />
              <span>Hablar con un Asesor VIP</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

