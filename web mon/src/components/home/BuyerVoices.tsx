const profiles = [
  {
    role: "Lima · fin de semana",
    line: "Quiero salir el viernes y dormir en mi predio. No necesito el malecón en la puerta.",
  },
  {
    role: "Patrimonio",
    line: "Pago el lote en 18 meses, sin intereses. El tren, si llega, es extra. El suelo ya está.",
  },
  {
    role: "Domo",
    line: "Founder para llegar y volver. Comfort cuando el viento deje de ser parte del plan.",
  },
];

export function BuyerVoices() {
  return (
    <section className="bg-[#FAF8F5] py-16 text-[#1C1612] md:py-20" aria-label="Perfiles de decisión">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <p className="font-display italic text-xl text-[#A84F36]">Tres maneras de decidir</p>
        <h2 className="moon-title mt-3 max-w-2xl font-semibold">
          No son reseñas. Son el tipo de conversación que llega por WhatsApp.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {profiles.map((profile) => (
            <blockquote key={profile.role} className="border-t border-[#E8E1D5] pt-6">
              <p className="font-display text-2xl leading-snug text-[#1C1612]">“{profile.line}”</p>
              <footer className="mt-5 text-sm text-[#786F66]">{profile.role}</footer>
            </blockquote>
          ))}
        </div>
        <p className="mt-8 text-[11px] leading-5 text-[#786F66]">
          Perfiles ilustrativos del comprador tipo. No son testimonios de clientes verificados de Moon Paracas.
        </p>
      </div>
    </section>
  );
}
