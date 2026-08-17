import React, { useEffect, useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { CONTACT, whatsappHref } from "../config/project";

export const MoonLogo: React.FC<{ className?: string; size?: number; dark?: boolean }> = ({
  className = "",
  size = 42,
  dark = true,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="50" cy="50" r="44" stroke={dark ? "#F4F0E6" : "#18353B"} strokeWidth="3" />
    <path d="M 12,65 Q 32,44 54,62 T 88,58" stroke="#C96C4C" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 18,74 Q 45,58 68,70 T 84,68" stroke={dark ? "#F4F0E6" : "#18353B"} strokeWidth="2" strokeLinecap="round" />
    <path d="M 68,26 A 14,14 0 0 0 54,42" stroke="#D7B07A" strokeWidth="2" />
  </svg>
);

const navigation = [
  { label: "Masterplan", to: "/simulador" },
  { label: "Experiencia", to: "/experiencia" },
  { label: "Galería", to: "/galeria" },
  { label: "Ficha técnica", to: "/tecnica" },
  { label: "Documentos", to: "/documentos" },
];

export function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className="moon-nav-surface sticky top-0 z-50 h-[72px] border-b border-white/10 bg-[#0c1819] text-white shadow-[0_12px_40px_rgba(2,12,13,0.16)]">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label="Moon Paracas, inicio">
          <MoonLogo size={38} className="transition-transform duration-500 group-hover:rotate-[8deg]" />
          <span className="leading-none">
            <span className="block font-display text-lg font-semibold tracking-[0.1em] text-[#f5f1e8] sm:text-xl">MOON PARACAS</span>
            <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.24em] text-[#d5aa83]">Refugio orgánico</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] p-1 xl:flex" aria-label="Navegación principal">
          {navigation.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2.5 text-[9px] font-bold uppercase tracking-[0.13em] transition-all ${
                  active ? "bg-white/10 text-white shadow-sm" : "text-white/55 hover:bg-white/[0.055] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/paracas-dome"
            aria-current={location.pathname.startsWith("/paracas-dome") ? "page" : undefined}
            className={`rounded-full px-3 py-2.5 text-[9px] font-bold uppercase tracking-[0.13em] transition-colors ${
              location.pathname.startsWith("/paracas-dome") ? "bg-[#f0b08c]/12 text-[#f0b08c]" : "text-white/60 hover:bg-white/[0.055] hover:text-white"
            }`}
          >
            Paracas Dome
          </Link>
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <Link
            to="/simulador"
            className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/65 hover:text-white"
          >
            Disponibilidad
          </Link>
          <a
            href={whatsappHref("Hola, quiero reservar un lote en Moon Paracas.")}
            target={CONTACT.whatsapp ? "_blank" : undefined}
            rel={CONTACT.whatsapp ? "noreferrer" : undefined}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#bb5638] px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_25px_rgba(187,86,56,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#a64932] focus:outline-none focus:ring-2 focus:ring-[#f0b08c]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Reservar lote
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] text-white transition-colors hover:bg-white/10 xl:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? "Cerrar navegación" : "Abrir navegación"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          className="moon-nav-surface absolute inset-x-0 top-[72px] max-h-[calc(100dvh-72px)] overflow-y-auto border-b border-white/10 bg-[#101a1b] px-5 py-6 shadow-2xl xl:hidden"
          aria-label="Navegación móvil"
        >
          <div className="mx-auto flex max-w-[1400px] flex-col">
            {navigation.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between border-b border-white/10 py-4 font-display text-2xl font-semibold ${active ? "text-[#f0b08c]" : "text-white"}`}
                >
                  {item.label}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-[#bb5638]" aria-hidden="true" />}
                </Link>
              );
            })}
            <Link
              to="/paracas-dome"
              aria-current={location.pathname.startsWith("/paracas-dome") ? "page" : undefined}
              className={`border-b border-white/10 py-4 font-display text-2xl font-semibold ${location.pathname.startsWith("/paracas-dome") ? "text-[#f0b08c]" : "text-white"}`}
            >
              Paracas Dome
            </Link>
            <a
              href={whatsappHref("Hola, quiero reservar un lote en Moon Paracas.")}
              target={CONTACT.whatsapp ? "_blank" : undefined}
              rel={CONTACT.whatsapp ? "noreferrer" : undefined}
              className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#bb5638] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white"
            >
              <MessageCircle className="h-4 w-4" /> Reservar lote
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
