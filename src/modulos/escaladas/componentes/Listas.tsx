"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { dataCurta } from "@/lib/formato";
import { definirFavorito, removerAscensao } from "../acoes";
import { ROTULOS_ESTILO, type AscensaoComVia, type FavoritoComVia } from "../tipos";

function Grau({ grau }: { grau: string }) {
  return <span className="w-14 shrink-0 text-center text-lg font-bold text-terracota-700">{grau}</span>;
}

function BotaoRemover({ rotulo, acao }: { rotulo: string; acao: () => Promise<{ ok: boolean; erro?: string }> }) {
  const [enviando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  return (
    <span className="flex shrink-0 flex-col items-end">
      <button
        type="button"
        aria-label={rotulo}
        disabled={enviando}
        onClick={() =>
          iniciar(async () => {
            const resultado = await acao();
            setErro(resultado.ok ? null : (resultado.erro ?? "Não foi possível remover."));
          })
        }
        className="min-h-11 rounded-lg px-3 text-sm font-medium text-grafite-600 hover:bg-pedra-100 hover:text-terracota-700 disabled:opacity-50"
      >
        {enviando ? "Removendo…" : "Remover"}
      </button>
      {erro && (
        <span role="alert" className="text-xs text-terracota-700">
          {erro}
        </span>
      )}
    </span>
  );
}

export function ListaAscensoes({ ascensoes, editavel = true }: { ascensoes: AscensaoComVia[]; editavel?: boolean }) {
  if (ascensoes.length === 0) {
    return <p className="rounded-lg bg-pedra-100 px-4 py-6 text-center text-sm text-grafite-700">{editavel ? "Você ainda não registrou nenhuma ascensão." : "Nenhuma ascensão registrada ainda."}</p>;
  }
  return (
    <ul className="divide-y divide-pedra-200 overflow-hidden rounded-xl bg-white ring-1 ring-pedra-200">
      {ascensoes.map((a) => (
        <li key={a.id} className="flex items-center gap-3 px-4 py-3">
          <Grau grau={a.via.grau} />
          <div className="min-w-0 flex-1">
            <Link href={`/vias/${a.via.id}`} className="font-semibold hover:text-terracota-700">
              {a.via.nome}
            </Link>
            <p className="text-sm text-grafite-600">
              {a.via.area_nome} · {dataCurta(a.data)} · <span>{ROTULOS_ESTILO[a.estilo]}</span>
              {a.grau_sugerido ? ` · sugeriu ${a.grau_sugerido}` : ""}
            </p>
            {a.notas && <p className="mt-1 whitespace-pre-line text-sm text-grafite-800">{a.notas}</p>}
          </div>
          {editavel && <BotaoRemover rotulo={`Remover ascensão de ${a.via.nome}`} acao={() => removerAscensao(a.id)} />}
        </li>
      ))}
    </ul>
  );
}

export function ListaFavoritos({ favoritos }: { favoritos: FavoritoComVia[] }) {
  if (favoritos.length === 0) {
    return <p className="rounded-lg bg-pedra-100 px-4 py-6 text-center text-sm text-grafite-700">Você ainda não favoritou nenhuma via.</p>;
  }
  return (
    <ul className="divide-y divide-pedra-200 overflow-hidden rounded-xl bg-white ring-1 ring-pedra-200">
      {favoritos.map((f) => (
        <li key={f.id} className="flex items-center gap-3 px-4 py-3">
          <Grau grau={f.via.grau} />
          <div className="min-w-0 flex-1">
            <Link href={`/vias/${f.via.id}`} className="font-semibold hover:text-terracota-700">
              {f.via.nome}
            </Link>
            <p className="text-sm text-grafite-600">{f.via.area_nome}</p>
          </div>
          <BotaoRemover rotulo={`Remover ${f.via.nome} dos favoritos`} acao={() => definirFavorito(f.via.id, false)} />
        </li>
      ))}
    </ul>
  );
}
