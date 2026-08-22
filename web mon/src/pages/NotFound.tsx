import { ArrowLeft, Map } from "lucide-react";
import { Link } from "react-router-dom";

export const NotFound = () => (
  <section className="flex min-h-[68vh] items-center bg-[#FAF8F5] px-5 py-20 text-[#1C1612] sm:px-8">
    <div className="mx-auto w-full max-w-3xl text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b55034]">Carta de silencio</p>
      <h1 className="moon-display mt-5 font-semibold">Esta ruta se perdió en la pampa.</h1>
      <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#667069]">
        La página no existe o cambió de ubicación. Puedes volver al proyecto o abrir el masterplan interactivo.
      </p>
      <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#1C1612] px-6 text-xs font-bold uppercase text-white">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
        <Link to="/simulador" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#1C1612]/25 px-6 text-xs font-bold uppercase">
          <Map className="h-4 w-4" /> Ver masterplan
        </Link>
      </div>
    </div>
  </section>
);
