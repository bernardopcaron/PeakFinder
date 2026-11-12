"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SeloSituacao } from "@/componentes/SeloSituacao";
import { MODALIDADES, ROTULOS_MODALIDADE, type Modalidade } from "@/lib/graus";
import type { ViaResumo } from "../tipos";

type Ordenacao = "nome" | "grau-asc" | "grau-desc";

const CLASSES_SELECAO = "min-h-11 rounded-lg border border-pedra-300 bg-white px-3 text-sm";

// Boulder usa outra escala: ao ordenar por grau, fica depois das vias de corda.
const chaveGrau = (via: ViaResumo) => (via.modalidade === "boulder" ? 100 : 0) + via.grau_ordem;

export function TabelaVias({ vias, mostrarSetor = true }: { vias: ViaResumo[]; mostrarSetor?: boolean }) {
  const [modalidade, setModalidade] = useState<Modalidade | "todas">("todas");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("nome");

  const visiveis = useMemo(() => {
    const filtradas = modalidade === "todas" ? [...vias] : vias.filter((via) => via.modalidade === modalidade);
    return filtradas.sort((a, b) => {
      if (ordenacao === "grau-asc") return chaveGrau(a) - chaveGrau(b) || a.nome.localeCompare(b.nome, "pt-BR");
      if (ordenacao === "grau-desc") return chaveGrau(b) - chaveGrau(a) || a.nome.localeCompare(b.nome, "pt-BR");
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [vias, modalidade, ordenacao]);

  if (vias.length === 0) return <p className="text-sm text-grafite-600">Nenhuma via cadastrada ainda.</p>;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          Modalidade
          <select className={CLASSES_SELECAO} value={modalidade} onChange={(e) => setModalidade(e.target.value as Modalidade | "todas")}>
            <option value="todas">Todas</option>
            {MODALIDADES.map((m) => (
              <option key={m} value={m}>
                {ROTULOS_MODALIDADE[m]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          Ordenar por
          <select className={CLASSES_SELECAO} value={ordenacao} onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}>
            <option value="nome">Nome</option>
            <option value="grau-asc">Grau (mais fácil primeiro)</option>
            <option value="grau-desc">Grau (mais difícil primeiro)</option>
          </select>
        </label>
      </div>
      {visiveis.length === 0 ? (
        <p className="rounded-lg bg-pedra-100 px-4 py-6 text-center text-sm text-grafite-700">Nenhuma via com esse filtro.</p>
      ) : (
        <ul className="divide-y divide-pedra-200 overflow-hidden rounded-xl bg-white ring-1 ring-pedra-200">
          {visiveis.map((via) => (
            <li key={via.id} data-testid="linha-via">
              <Link href={`/vias/${via.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-areia-50">
                <span className="w-14 shrink-0 text-center text-lg font-bold text-terracota-700">{via.grau}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="truncate">{via.nome}</span>
                    <SeloSituacao situacao={via.situacao} />
                  </span>
                  <span className="block truncate text-sm text-grafite-600">
                    {[ROTULOS_MODALIDADE[via.modalidade], mostrarSetor && via.setor_nome, via.altura_m != null && `${via.altura_m} m`, via.costuras != null && `${via.costuras} costuras`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                {via.nota_media != null && (
                  <span className="shrink-0 text-sm font-medium text-grafite-700" aria-label={`Nota média ${via.nota_media} de 5`}>
                    ★ {Number(via.nota_media).toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
