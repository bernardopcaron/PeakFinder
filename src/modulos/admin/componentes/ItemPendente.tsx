"use client";

import Link from "next/link";
import { useState } from "react";
import { classesBotao } from "@/componentes/Botao";
import { dataCurta } from "@/lib/formato";
import { ROTULOS_TIPO } from "@/modulos/comunidade/tipos";
import { aprovar, rejeitar } from "../acoes";
import type { Pendente } from "../tipos";
import { useAcao } from "./Acao";

export function ItemPendente({ item }: { item: Pendente }) {
  const { enviando, erro, executar, setErro } = useAcao();
  const [rejeitando, setRejeitando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const idMotivo = `motivo-${item.id}`;
  return (
    <li className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-pedra-200">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2">
            <span className="rounded bg-pedra-100 px-2 py-0.5 text-xs font-semibold uppercase text-grafite-700">{ROTULOS_TIPO[item.tipo]}</span>
            <span className="text-lg font-semibold">{item.nome}</span>
          </p>
          <p className="text-sm text-grafite-600">{item.contexto}</p>
          <p className="text-sm text-grafite-600">
            Enviado por {item.autor} em {dataCurta(item.criado_em)}
          </p>
        </div>
      </div>
      <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        {item.detalhes.map(([rotulo, valor]) => (
          <div key={rotulo} className={valor.length > 60 ? "sm:col-span-2" : ""}>
            <dt className="inline font-medium text-grafite-600">{rotulo}: </dt>
            <dd className="inline whitespace-pre-line">{valor}</dd>
          </div>
        ))}
      </dl>
      {erro && (
        <p role="alert" className="text-sm font-medium text-terracota-700">
          {erro}
        </p>
      )}
      {rejeitando ? (
        <div className="space-y-2">
          <label htmlFor={idMotivo} className="block text-sm font-medium">
            Motivo da rejeição
          </label>
          <textarea id={idMotivo} rows={2} maxLength={500} value={motivo} onChange={(e) => setMotivo(e.target.value)} className="block w-full rounded-lg border border-pedra-300 px-3 py-2 text-base" />
          <p className="text-xs text-grafite-600">O autor verá este texto em Minhas contribuições.</p>
          <div className="flex gap-2">
            <button type="button" disabled={enviando} onClick={() => executar(() => rejeitar(item.tipo, item.id, motivo))} className={classesBotao()}>
              Confirmar rejeição
            </button>
            <button
              type="button"
              onClick={() => {
                setRejeitando(false);
                setErro(null);
              }}
              className={classesBotao("fantasma")}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={enviando} onClick={() => executar(() => aprovar(item.tipo, item.id))} className={classesBotao()}>
            Aprovar
          </button>
          <Link href={`/contribuir/${item.tipo}?editar=${item.id}`} className={classesBotao("secundario")}>
            Editar
          </Link>
          <button type="button" disabled={enviando} onClick={() => setRejeitando(true)} className={classesBotao("fantasma")}>
            Rejeitar
          </button>
        </div>
      )}
    </li>
  );
}
