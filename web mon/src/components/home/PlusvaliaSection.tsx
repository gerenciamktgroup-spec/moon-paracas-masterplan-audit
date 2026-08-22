import { PROJECT } from "../../config/project";

const rows = [
  {
    axis: "Hoy",
    fact: `Km ${PROJECT.panamericanaKm} Panamericana Sur`,
    read: "El predio ya está en el corredor Lima–Ica, inland de Paracas.",
  },
  {
    axis: "El tren",
    fact: "Estación Paracas prevista por el MTC",
    read: "El Ferrocarril Lima–Ica lista 14 estaciones. Paracas, Pisco y el aeropuerto de Pisco figuran en el anuncio público.",
  },
  {
    axis: "El plazo",
    fact: "Obra anunciada · operación hacia 2032–2033",
    read: "Es un proyecto de Estado, no de Moon. Expediente y fechas los define el MTC, no este sitio.",
  },
  {
    axis: "La tesis",
    fact: "Más Lima en menos tiempo",
    read: "Quien compra tierra en este corredor apuesta a la conectividad. No es una rentabilidad prometida ni un porcentaje de plusvalía.",
  },
];

export function PlusvaliaSection() {
  return (
    <section id="plusvalia" className="scroll-mt-24 border-y border-[#E8E1D5] bg-[#F4EFE6] py-20 text-[#1C1612] md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <p className="font-display italic text-xl text-[#A84F36]">El corredor</p>
        <h2 className="moon-title mt-3 max-w-3xl font-semibold">
          Km {PROJECT.panamericanaKm}. Estación Paracas en el mapa del tren.
        </h2>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-[#3D352E]">
          El MTC ha publicado el Ferrocarril Lima–Ica con estación en Paracas. Eso es un hecho de infraestructura anunciada. La plusvalía no se inventa: se explica como tesis, no como garantía.
        </p>

        <div className="mt-12 overflow-hidden border border-[#E8E1D5] bg-white">
          <table className="w-full text-left">
            <caption className="sr-only">Cuadro de tesis de valor: ubicación, tren Lima–Ica y límites de lo que se puede afirmar</caption>
            <thead className="bg-[#1C1612] text-[#FAF8F5]">
              <tr>
                <th className="px-5 py-4 font-display text-xl font-medium sm:px-7">Eje</th>
                <th className="px-5 py-4 font-display text-xl font-medium sm:px-7">Dato</th>
                <th className="hidden px-5 py-4 font-display text-xl font-medium sm:table-cell sm:px-7">Cómo leerlo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.axis} className="border-t border-[#E8E1D5] align-top">
                  <td className="px-5 py-5 font-display text-2xl text-[#A84F36] sm:px-7">{row.axis}</td>
                  <td className="px-5 py-5 text-sm font-semibold sm:px-7">{row.fact}</td>
                  <td className="hidden px-5 py-5 text-sm leading-6 text-[#786F66] sm:table-cell sm:px-7">{row.read}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 max-w-3xl text-[11px] leading-5 text-[#786F66]">
          Fuentes públicas: anuncios del MTC e Infobae/La República sobre las 14 estaciones (Ica, Guadalupe, Paracas, Aeropuerto de Pisco, Pisco…). Moon Paracas no opera el tren y no promete un porcentaje de revalorización.
        </p>
      </div>
    </section>
  );
}
