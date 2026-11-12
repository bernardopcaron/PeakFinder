import Link from "next/link";
import { SeloSituacao } from "@/componentes/SeloSituacao";
import type { Setor } from "../tipos";

export function ListaSetores({ areaSlug, setores }: { areaSlug: string; setores: Setor[] }) {
  if (setores.length === 0) return <p className="text-sm text-grafite-600">Nenhum setor cadastrado ainda.</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {setores.map((setor) => (
        <li key={setor.id}>
          <Link
            href={`/areas/${areaSlug}/${setor.slug}`}
            className="flex min-h-16 flex-col justify-center rounded-lg bg-white px-4 py-3 ring-1 ring-pedra-200 hover:ring-terracota-400"
          >
            <span className="flex items-center gap-2 font-semibold">
              {setor.nome}
              <SeloSituacao situacao={setor.situacao} />
            </span>
            <span className="text-sm text-grafite-600">
              {[setor.orientacao && `Face ${setor.orientacao.toLowerCase()}`, setor.tempo_aproximacao_min != null && `${setor.tempo_aproximacao_min} min de aproximação`]
                .filter(Boolean)
                .join(" · ") || "Ver vias do setor"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
