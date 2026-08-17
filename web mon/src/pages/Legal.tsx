import { AlertTriangle, FileCheck2, LockKeyhole } from "lucide-react";
import { LEGAL, isLegalIdentityConfigured } from "../config/project";

type LegalPageProps = { type: "privacy" | "terms" };

export const LegalPage = ({ type }: LegalPageProps) => {
  const privacy = type === "privacy";
  const contents = privacy
    ? [
        { id: "responsable", label: "Responsable y finalidad" },
        { id: "datos", label: "Datos y conservación" },
        { id: "medicion", label: "Medición opcional" },
        { id: "derechos", label: "Tus derechos" },
      ]
    : [
        { id: "alcance", label: "Alcance informativo" },
        { id: "imagenes", label: "Imágenes y proyecciones" },
        { id: "reservas", label: "Reservas" },
      ];

  return (
    <div className="min-h-[90vh] bg-[#eeebe2] text-[#18353b]">
      <header className="border-b border-[#18353b]/12 bg-[#f5f1e8]">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_280px] lg:px-12 lg:py-24">
          <div>
            <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b55034]">
              {privacy ? <LockKeyhole className="h-4 w-4" /> : <FileCheck2 className="h-4 w-4" />}
              Información al usuario
            </p>
            <h1 className="mt-7 max-w-4xl font-display text-[clamp(3.5rem,7vw,7rem)] font-medium leading-[0.9] tracking-[-0.045em]">
              {privacy ? "Aviso de privacidad" : "Términos del sitio"}
            </h1>
          </div>
          <div className="self-end border-t border-[#18353b]/15 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#718079]">Documento vigente</p>
            <p className="mt-3 font-display text-2xl">15 de julio de 2026</p>
            <p className="mt-2 text-xs leading-5 text-[#718079]">Lee esta información antes de compartir datos o iniciar una reserva.</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-12">
        <aside>
          <nav className="sticky top-28 border-l border-[#18353b]/15 pl-5" aria-label="Contenido del documento">
            <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#b55034]">En esta página</p>
            <ul className="space-y-4">
              {contents.map((item, index) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="group flex gap-3 text-xs leading-5 text-[#5f6963] transition-colors hover:text-[#18353b]">
                    <span className="font-display text-base text-[#b55034]">0{index + 1}</span>{item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="min-w-0">
          {!isLegalIdentityConfigured && (
            <div className="mb-10 flex gap-4 rounded-md border border-[#b55034]/25 bg-[#fff5ec] p-5 text-sm leading-6">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#b55034]" />
              <p>
                La identidad legal del responsable todavía no fue configurada. Este aviso debe completarse con razón social,
                RUC, domicilio y canal de derechos antes de habilitar la captación de datos o publicar el sitio.
              </p>
            </div>
          )}

          <div className="space-y-0 text-sm leading-8 text-[#5f6963]">
            {privacy ? (
              <>
                <section id="responsable" className="scroll-mt-28 border-t border-[#18353b]/15 py-9 first:border-t-0 first:pt-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b55034]">01 · Identidad y uso</p>
                  <h2 className="mt-2 font-display text-4xl font-medium text-[#18353b]">Responsable y finalidad</h2>
                  <p className="mt-5">
                    {isLegalIdentityConfigured ? `${LEGAL.entityName}, RUC ${LEGAL.ruc}, con domicilio en ${LEGAL.address},` : "El responsable identificado en este aviso"} tratará los datos enviados para responder consultas, coordinar visitas, preparar cotizaciones y dar seguimiento a una solicitud de reserva.
                  </p>
                </section>
                <section id="datos" className="scroll-mt-28 border-t border-[#18353b]/15 py-9">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b55034]">02 · Ciclo de información</p>
                  <h2 className="mt-2 font-display text-4xl font-medium text-[#18353b]">Datos, conservación y destinatarios</h2>
                  <p className="mt-5">
                    Se recopilan nombre, correo, teléfono, mensaje, lote de interés y atribución comercial limitada —fuente, medio, campaña, página de llegada y dominio de referencia—. No se solicitan datos de tarjeta en nuestros formularios: el pago se procesa en la interfaz segura del proveedor. La información se conserva durante el tiempo necesario para atender la solicitud y cumplir obligaciones legales, con acceso limitado al equipo comercial autorizado, el CRM configurado y proveedores indispensables.
                  </p>
                </section>
                <section id="medicion" className="scroll-mt-28 border-t border-[#18353b]/15 py-9">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b55034]">03 · Preferencia de navegador</p>
                  <h2 className="mt-2 font-display text-4xl font-medium text-[#18353b]">Medición opcional</h2>
                  <p className="mt-5">
                    Web Analytics y Speed Insights solo se cargan cuando eliges “Permitir medición”. Antes de enviarse, la URL se limpia para excluir búsquedas, favoritos y parámetros de campaña. La preferencia se guarda localmente en tu navegador y puede revocarse desde “Preferencias de medición” en el pie de página.
                  </p>
                </section>
                <section id="derechos" className="scroll-mt-28 border-y border-[#18353b]/15 py-9">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b55034]">04 · Control del usuario</p>
                  <h2 className="mt-2 font-display text-4xl font-medium text-[#18353b]">Tus derechos</h2>
                  <p className="mt-5">
                    Puedes solicitar acceso, rectificación, cancelación u oposición, así como revocar tu consentimiento, escribiendo a {LEGAL.privacyEmail || "la dirección de privacidad que deberá publicarse aquí"}. La solicitud deberá permitir verificar tu identidad.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section id="alcance" className="scroll-mt-28 pb-9">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b55034]">01 · Naturaleza del sitio</p>
                  <h2 className="mt-2 font-display text-4xl font-medium text-[#18353b]">Alcance informativo</h2>
                  <p className="mt-5">
                    El contenido del sitio facilita la comparación del proyecto, pero no sustituye la ficha técnica, la documentación registral, el contrato ni sus anexos. Precios, disponibilidad, cronogramas y financiamiento deben confirmarse antes de pagar o firmar.
                  </p>
                </section>
                <section id="imagenes" className="scroll-mt-28 border-t border-[#18353b]/15 py-9">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b55034]">02 · Representación visual</p>
                  <h2 className="mt-2 font-display text-4xl font-medium text-[#18353b]">Imágenes y proyecciones</h2>
                  <p className="mt-5">
                    Los renders y ambientaciones son referenciales. No se garantiza rentabilidad, valorización, independización inmediata ni ausencia absoluta de riesgos naturales. Los alcances exigibles serán exclusivamente los establecidos en documentos suscritos por las partes.
                  </p>
                </section>
                <section id="reservas" className="scroll-mt-28 border-y border-[#18353b]/15 py-9">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b55034]">03 · Disponibilidad</p>
                  <h2 className="mt-2 font-display text-4xl font-medium text-[#18353b]">Reservas</h2>
                  <p className="mt-5">
                    Una unidad queda separada únicamente después de que el proveedor de pago confirma la operación y el servidor concilia el inventario. Los estados mostrados antes de esa confirmación son informativos y pueden cambiar por concurrencia.
                  </p>
                </section>
              </>
            )}
          </div>
          <p className="mt-10 text-[9px] font-bold uppercase tracking-[0.16em] text-[#718079]">Moon Paracas · Versión 2026.07</p>
        </article>
      </div>
    </div>
  );
};
