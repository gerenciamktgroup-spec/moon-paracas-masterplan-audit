import React from "react";
import { ShieldCheck, FileCheck2, ScrollText, CheckCircle2, Trees, Scale, Sparkles, MessageCircle } from "lucide-react";
import { whatsappHref } from "../../config/project";

export const LegalAssociationSection: React.FC = () => {
  const waLegalMsg = "Hola! Quisiera revisar el modelo de contrato de adjudicación y el reglamento interno del condominio Moon Paracas.";

  const deliverables = [
    {
      num: "01",
      title: "Certificado de Asociación & Copropiedad",
      desc: "Acreditación formal como miembro de la Asociación Sin Fines de Lucro dueña del predio matriz, con tus Acciones y Derechos correspondientes.",
    },
    {
      num: "02",
      title: "Contrato de Adjudicación de Uso Exclusivo",
      desc: "Contrato privado con firmas legalizadas notarialmente que asigna de forma perpetua e individual tu parcela (Lote de 120 m² o Doble de 240 m²).",
    },
    {
      num: "03",
      title: "Plano Perimétrico con Coordenadas UTM WGS84",
      desc: "Levantamiento topográfico georreferenciado con los linderos exactos de tu lote, firmado por ingeniero colegiado.",
    },
    {
      num: "04",
      title: "Reglamento Interno de Arquitectura y Convivencia",
      desc: "Normativa obligatoria de construcción ecológica (materiales nobles, alturas máximas, paleta desértica) que protege tu plusvalía.",
    },
    {
      num: "05",
      title: "Membresía Vitalicia a Moon Club (Oasis 5,000 m²)",
      desc: "Acceso garantizado a las áreas comunes, laguna central, senderos peatonales y áreas de esparcimiento del condominio.",
    },
  ];

  return (
    <section className="bg-white py-20 md:py-28 text-[#161311] border-b border-[#E8E1D5]">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        
        {/* Encabezado */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-[#E8E1D5] pb-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#4E6646]/30 bg-[#4E6646]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4E6646]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Estructura Jurídica & Preservación del Valor
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#161311]">
              Reglas claras para un patrimonio<br />
              <span className="font-serif-italic font-normal text-[#C85B3E]">que crece y perdura en el tiempo.</span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#786F66] max-w-2xl">
              Moon Paracas se organiza bajo una Asociación Sin Fines de Lucro titular de la matriz. Cada comprador adquiere Acciones y Derechos con adjudicación notarial de su parcela exclusiva y el respaldo de un reglamento ecológico riguroso.
            </p>
          </div>

          <a
            href={whatsappHref(waLegalMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-2xl bg-[#161311] px-6 py-3.5 text-xs font-bold text-white shadow transition hover:bg-[#C85B3E]"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366] fill-current" />
            <span>Consultar con Asesor Legal</span>
          </a>
        </div>

        {/* El Valor del Reglamento Ecológico */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-5 rounded-[2rem] border border-[#C5A059]/35 bg-gradient-to-b from-[#FAF7F2] to-[#F4EFE6] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-2xl bg-white border border-[#E8E1D5] text-[#C5A059] w-fit mb-5">
                <Trees className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#161311]">¿Por qué un Reglamento Estricto es tu mejor garantía?</h3>
              <p className="mt-3 text-xs sm:text-sm text-[#786F66] leading-relaxed">
                En muchos proyectos de campo, la falta de reglas genera desorden: construcciones de concreto invasivas, ruido desmedido y deterioro del entorno.
              </p>
              <p className="mt-3 text-xs sm:text-sm text-[#786F66] leading-relaxed">
                En Moon Paracas, el <strong>Reglamento Interno de Condominio Ecológico</strong> exige:
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-[#38312B] font-medium">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-[#4E6646]" /> Tipología de Domos y construcciones bioclimáticas de baja densidad.</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-[#4E6646]" /> Paleta cromática del desierto (tonos arena, piedra, madera y adobe).</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-[#4E6646]" /> Manejo estricto de agua, energía solar y biodigestores estancos.</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-[#4E6646]" /> Cero contaminación sonora y lumínica para proteger las noches estrelladas.</li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8E1D5] text-[11px] font-bold text-[#A84F36]">
              🛡️ Tu inversión protegida contra la degradación del paisaje.
            </div>
          </div>

          {/* Los 5 Entregables Formales */}
          <div className="lg:col-span-7 rounded-[2rem] border border-[#E8E1D5] bg-[#FAF7F2] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A84F36]">Seguridad Documental</span>
              <h3 className="mt-1 font-display text-2xl font-bold text-[#161311]">Lo que recibes al momento de comprar</h3>
              <p className="mt-1 text-xs text-[#786F66]">Cada paso está bancarizado y respaldado con formalidad legal.</p>

              <div className="mt-6 space-y-4">
                {deliverables.map((item) => (
                  <div key={item.num} className="p-4 rounded-2xl bg-white border border-[#E8E1D5] flex items-start gap-4">
                    <span className="font-display text-lg font-bold text-[#C5A059] shrink-0">{item.num}</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#161311]">{item.title}</h4>
                      <p className="text-[11px] text-[#786F66] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
