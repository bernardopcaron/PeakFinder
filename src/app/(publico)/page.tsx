import Link from "next/link";
import { FormBusca } from "@/componentes/FormBusca";
import { Secao } from "@/componentes/Secao";
import { CartaoArea } from "@/modulos/areas";
import { listarAreasDestaque } from "@/modulos/areas/consultas";
import { CartaoVia } from "@/modulos/vias";
import { listarViasPopulares } from "@/modulos/vias/consultas";

export default async function Explorar() {
  const [areas, vias] = await Promise.all([listarAreasDestaque(), listarViasPopulares()]);
  return (
    <>
      <div className="bg-grafite-900 text-areia-50">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 md:pb-14 md:pt-12">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">Conheça a parede antes de chegar até ela.</h1>
          <p className="mt-3 max-w-xl text-pedra-200">Áreas, setores e vias de escalada no Brasil, com mapa, ficha técnica e modelos 3D.</p>
          <div className="mt-6 max-w-xl">
            <FormBusca grande />
          </div>
          <Link href="/mapa" className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-terracota-300 underline-offset-4 hover:underline">
            Abrir o mapa <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <Secao titulo="Áreas em destaque">
          {areas.length === 0 ? (
            <p className="text-sm text-grafite-600">Nenhuma área em destaque no momento.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {areas.map((area) => (
                <CartaoArea key={area.id} area={area} />
              ))}
            </div>
          )}
        </Secao>
        <Secao titulo="Vias populares">
          {vias.length === 0 ? (
            <p className="text-sm text-grafite-600">Nenhuma via cadastrada ainda.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {vias.map((via) => (
                <CartaoVia key={via.id} via={via} />
              ))}
            </div>
          )}
        </Secao>
      </div>
    </>
  );
}
