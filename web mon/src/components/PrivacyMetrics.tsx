import { useEffect, useState } from "react";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Link } from "react-router-dom";
import { METRICS_PREFERENCE_KEY } from "../lib/analytics";

type MetricsPreference = "accepted" | "essential" | null;

function stripQuery(event: BeforeSendEvent): BeforeSendEvent {
  try {
    const url = new URL(event.url);
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
  } catch {
    return event;
  }
}

export function PrivacyMetrics() {
  const [preference, setPreference] = useState<MetricsPreference>(() => {
    const stored = window.localStorage.getItem(METRICS_PREFERENCE_KEY);
    return stored === "accepted" || stored === "essential" ? stored : null;
  });

  useEffect(() => {
    const reopen = () => {
      window.localStorage.removeItem(METRICS_PREFERENCE_KEY);
      setPreference(null);
    };
    window.addEventListener("moon:privacy-settings", reopen);
    return () => window.removeEventListener("moon:privacy-settings", reopen);
  }, []);

  const choose = (nextPreference: Exclude<MetricsPreference, null>) => {
    window.localStorage.setItem(METRICS_PREFERENCE_KEY, nextPreference);
    setPreference(nextPreference);
  };

  return (
    <>
      {preference === "accepted" && (
        <>
          <Analytics beforeSend={stripQuery} />
          <SpeedInsights sampleRate={0.5} />
        </>
      )}

      {preference === null && (
        <section
          className="fixed inset-x-2 bottom-2 z-[90] mx-auto max-w-3xl rounded-md border border-[#E8E1D5] bg-[#FAF8F5]/98 p-3 text-[#1C1612] shadow-[0_20px_50px_rgba(28,22,18,0.14)] backdrop-blur-xl sm:inset-x-3 sm:bottom-5 sm:p-5"
          aria-label="Preferencias de medición"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="max-w-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A84F36] sm:text-xs">Tu privacidad, primero</p>
              <p className="mt-1.5 text-[11px] leading-4 text-[#3D352E] sm:mt-2 sm:text-xs sm:leading-5">
                <span className="sm:hidden">Medimos uso y rendimiento sin datos de formularios ni parámetros de la URL. </span>
                <span className="hidden sm:inline">Podemos medir visitas y rendimiento sin enviar formularios, DNI, correo, teléfono ni parámetros de la URL. Tú decides. </span>
                Revisa el <Link to="/privacidad" className="text-[#1C1612] underline underline-offset-4">aviso de privacidad</Link>.
              </p>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => choose("essential")}
                className="min-h-10 rounded-md border border-[#E8E1D5] px-3 text-[9px] font-bold uppercase tracking-[0.08em] text-[#3D352E] hover:bg-[#F4EFE6] sm:min-h-11 sm:px-4 sm:text-[10px] sm:tracking-[0.1em]"
              >
                Solo esencial
              </button>
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="min-h-10 rounded-md bg-[#bb5638] px-3 text-[9px] font-bold uppercase tracking-[0.08em] text-white hover:bg-[#9e452d] sm:min-h-11 sm:px-4 sm:text-[10px] sm:tracking-[0.1em]"
              >
                Permitir medición
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
