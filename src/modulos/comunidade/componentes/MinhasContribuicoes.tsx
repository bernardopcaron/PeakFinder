import Link from "next/link";
import { SeloSituacao } from "@/componentes/SeloSituacao";
import { dataCurta } from "@/lib/formato";
import { ROTULOS_TIPO, type Contribuicao } from "../tipos";

export function MinhasContribuicoes({ contribuicoes }: { contribuicoes: Contribuicao[] }) {
  if (contribuicoes.length === 0) {
    return (
      <p className="rounded-lg bg-pedra-100 px-4 py-6 text-center text-sm text-grafite-700">
        Você ainda não enviou nenhuma contribuição.{" "}
        <Link href="/contribuir" className="font-semibold text-terracota-700 underline-offset-2 hover:underline">
          Contribuir
        </Link>
      </p>
    );
  }
  return (
    <ul className="divide-y divide-pedra-200 overflow-hidden rounded-xl bg-white ring-1 ring-pedra-200">
      {contribuicoes.map((c) => (
        <li key={`${c.tipo}-${c.id}`} className="flex items-center gap-3 px-4 py-3">
          <span className="w-14 shrink-0 rounded bg-pedra-100 py-1 text-center text-xs font-semibold uppercase text-grafite-700">{ROTULOS_TIPO[c.tipo]}</span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2">
              {c.caminho ? (
                <Link href={c.caminho} className="font-semibold hover:text-terracota-700">
                  {c.nome}
                </Link>
              ) : (
                <span className="font-semibold">{c.nome}</span>
              )}
              <SeloSituacao situacao={c.situacao} sempre />
            </p>
            <p className="text-sm text-grafite-600">
              {c.contexto} · enviado em {dataCurta(c.criado_em)}
            </p>
            {c.situacao === "rejeitado" && c.motivo_rejeicao && <p className="mt-1 text-sm text-terracota-800">Motivo: {c.motivo_rejeicao}</p>}
          </div>
          {c.situacao === "pendente" && (
            <Link href={`/contribuir/${c.tipo}?editar=${c.id}`} className="flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-semibold text-terracota-700 hover:bg-areia-100">
              Editar
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
