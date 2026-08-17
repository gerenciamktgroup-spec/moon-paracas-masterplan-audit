import React, { useState } from "react";
import { ArrowRight, CheckCircle2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Lot } from "../types/map";
import { CONTACT, whatsappHref } from "../config/project";
import { getAttribution } from "../lib/attribution";
import { trackEvent } from "../lib/analytics";

interface FooterProps {
  selectedLot?: Lot | null;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

export const Footer: React.FC<FooterProps> = ({ selectedLot }) => {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const message = String(data.get("message") || "").trim();
    const projectInterest = String(data.get("projectInterest") || "Moon Paracas");
    const inquiryType = String(data.get("inquiryType") || "availability");
    const contactWindow = String(data.get("contactWindow") || "afternoon");
    const privacyAccepted = data.get("privacyAccepted") === "on";

    if (!name || !email || !phone) {
      setStatus("error");
      setErrorMessage("Completa nombre, correo y WhatsApp para continuar.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");
    trackEvent("submit_lead", { project: projectInterest, hasSelectedLot: Boolean(selectedLot) });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          projectInterest,
          inquiryType,
          contactWindow,
          selectedLotId: selectedLot?.id || "",
          privacyAccepted,
          website: String(data.get("website") || ""),
          attribution: getAttribution(),
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "No se pudo registrar la solicitud.");
      }
      form.reset();
      setStatus("success");
      trackEvent("lead_submitted", { project: projectInterest, hasSelectedLot: Boolean(selectedLot) });
    } catch (error) {
      console.error("No se pudo registrar el lead:", error);
      setStatus("error");
      setErrorMessage("No pudimos registrar tu solicitud. Inténtalo nuevamente o escríbenos por WhatsApp.");
    }
  };

  return (
    <footer id="contacto" className="scroll-mt-24 bg-[#101a1b] text-white">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-12 lg:py-24">
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f0b08c]">Asesoría privada</p>
          <h2 className="mt-4 font-display text-5xl font-semibold leading-none text-[#f5f1e8] md:text-6xl">
            Tu lugar en Paracas empieza con una conversación.
          </h2>
          <p className="mt-6 text-sm leading-7 text-white/65">
            Déjanos tus datos y un asesor de Moon Paracas te contactará para revisar disponibilidad, paquetes y próximos pasos.
          </p>
          <div className="mt-9 space-y-4 border-t border-white/10 pt-7 text-sm text-white/70">
            <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#f0b08c]" /> Paracas, Ica, Perú</p>
            {CONTACT.phoneLabel && <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-[#f0b08c]" /> {CONTACT.phoneLabel}</p>}
            {CONTACT.email && <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#f0b08c]" /> {CONTACT.email}</p>}
            {!CONTACT.phoneLabel && !CONTACT.email && <p className="text-xs text-white/50">Atención comercial mediante el formulario seguro.</p>}
          </div>
        </div>

        <div className="rounded-md border border-white/12 bg-[#172526] p-5 sm:p-8">
          {status === "success" ? (
            <div className="flex min-h-[430px] flex-col items-center justify-center text-center" role="status">
              <CheckCircle2 className="h-12 w-12 text-[#8db386]" />
              <h3 className="mt-5 font-display text-3xl font-semibold">Solicitud recibida</h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/65">
                Gracias por acercarte a Moon Paracas. Un asesor revisará tu solicitud y se comunicará contigo.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-[#f0b08c] underline underline-offset-8"
              >
                Registrar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
              <label className="sr-only" aria-hidden="true">
                Sitio web
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
              <div className="sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Me interesa</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    ["Moon Paracas", "Moon Paracas"],
                    ["Paracas Dome", "Paracas Dome"],
                  ].map(([value, label], index) => (
                    <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-white/15 px-4 text-xs font-semibold text-white/80 has-[:checked]:border-[#f0b08c] has-[:checked]:bg-[#f0b08c]/10">
                      <input type="radio" name="projectInterest" value={value} defaultChecked={index === 0} className="accent-[#bb5638]" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                Próximo paso
                <select name="inquiryType" defaultValue="availability" className="mt-2 min-h-12 w-full rounded-md border border-white/15 bg-[#0d1718] px-4 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-[#f0b08c] focus:ring-1 focus:ring-[#f0b08c]">
                  <option value="availability">Revisar disponibilidad</option>
                  <option value="documents">Solicitar documentos</option>
                  <option value="visit">Coordinar una visita</option>
                  <option value="reservation">Evaluar una separación</option>
                </select>
              </label>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                Mejor horario
                <select name="contactWindow" defaultValue="afternoon" className="mt-2 min-h-12 w-full rounded-md border border-white/15 bg-[#0d1718] px-4 text-sm font-normal normal-case tracking-normal text-white outline-none focus:border-[#f0b08c] focus:ring-1 focus:ring-[#f0b08c]">
                  <option value="morning">Mañana · 9 a 12</option>
                  <option value="afternoon">Tarde · 12 a 18</option>
                  <option value="evening">Noche · 18 a 20</option>
                </select>
              </label>

              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                Nombre completo *
                <input
                  name="name"
                  type="text"
                  required
                  maxLength={120}
                  autoComplete="name"
                  className="mt-2 min-h-12 w-full rounded-md border border-white/15 bg-[#0d1718] px-4 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-[#f0b08c] focus:ring-1 focus:ring-[#f0b08c]"
                  placeholder="Tu nombre"
                />
              </label>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                WhatsApp *
                <input
                  name="phone"
                  type="tel"
                  required
                  maxLength={32}
                  autoComplete="tel"
                  className="mt-2 min-h-12 w-full rounded-md border border-white/15 bg-[#0d1718] px-4 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-[#f0b08c] focus:ring-1 focus:ring-[#f0b08c]"
                  placeholder="+51 999 999 999"
                />
              </label>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 sm:col-span-2">
                Correo electrónico *
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={160}
                  autoComplete="email"
                  className="mt-2 min-h-12 w-full rounded-md border border-white/15 bg-[#0d1718] px-4 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-[#f0b08c] focus:ring-1 focus:ring-[#f0b08c]"
                  placeholder="nombre@correo.com"
                />
              </label>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 sm:col-span-2">
                ¿Qué te gustaría conversar?
                <textarea
                  name="message"
                  rows={4}
                  maxLength={1000}
                  className="mt-2 w-full resize-none rounded-md border border-white/15 bg-[#0d1718] px-4 py-3 text-sm font-normal normal-case leading-6 tracking-normal text-white outline-none placeholder:text-white/25 focus:border-[#f0b08c] focus:ring-1 focus:ring-[#f0b08c]"
                  placeholder="Cuéntanos si ya tienes una tipología o paquete en mente."
                />
              </label>
              <label className="flex items-start gap-3 text-xs leading-5 text-white/55 sm:col-span-2">
                <input name="privacyAccepted" type="checkbox" required className="mt-1 accent-[#bb5638]" />
                <span>Acepto ser contactado y el tratamiento de mis datos según el <Link to="/privacidad" className="text-[#f0b08c] underline underline-offset-4">aviso de privacidad</Link>.</span>
              </label>

              {status === "error" && (
                <p className="rounded-md border border-[#d27b5f]/35 bg-[#a9472d]/15 p-3 text-xs text-[#ffd2c3] sm:col-span-2" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#bb5638] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#9e452d] disabled:cursor-wait disabled:opacity-60 sm:col-span-2"
              >
                {status === "submitting" ? "Enviando..." : "Solicitar información"}
                {status !== "submitting" && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-7 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 text-[10px] uppercase tracking-[0.12em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Moon Paracas · Ica, Perú</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/privacidad" className="hover:text-white/70">Privacidad</Link>
            <Link to="/terminos" className="hover:text-white/70">Términos</Link>
            <button type="button" onClick={() => window.dispatchEvent(new Event("moon:privacy-settings"))} className="hover:text-white/70">Preferencias de medición</button>
            <span>Arquitectura orgánica · Desarrollo progresivo</span>
          </div>
        </div>
      </div>

      <a
        href={whatsappHref("Hola, quiero más información sobre Moon Paracas.")}
        target={CONTACT.whatsapp ? "_blank" : undefined}
        rel={CONTACT.whatsapp ? "noreferrer" : undefined}
        className="fixed bottom-24 right-4 z-50 hidden h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_12px_35px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white md:bottom-7 md:right-7 md:inline-flex md:h-14 md:w-14"
        aria-label="Contactar por WhatsApp"
        title="Contactar por WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </footer>
  );
};
