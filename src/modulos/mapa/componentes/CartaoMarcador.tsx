import Link from "next/link";
import { classesBotao } from "@/componentes/Botao";
import { Selo, type Origem } from "@/componentes/Selo";
import { plural } from "@/lib/formato";
import type { PropsArea } from "../tipos";

export function CartaoMarcador({ area, aoFechar }: { area: PropsArea; aoFechar: () => void }) {
  return (
    <div data-testid="cartao-marcador" className="rounded-xl bg-white p-4 shadow-lg ring-1 ring-pedra-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold tracking-tight">{area.nome}</h2>
          <p className="text-sm text-grafite-600">
            {area.municipio} · {area.estado}
          </p>
        </div>
        <button type="button" onClick={aoFechar} aria-label="Fechar" className="-mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl text-grafite-600 hover:bg-pedra-100">
          ×
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <Selo origem={area.origem as Origem} />
        <span className="text-grafite-700">{plural(area.total_vias, "via", "vias")}</span>
      </div>
      <Link href={`/areas/${area.slug}`} className={`${classesBotao()} mt-3 w-full`}>
        Ver área
      </Link>
    </div>
  );
}
