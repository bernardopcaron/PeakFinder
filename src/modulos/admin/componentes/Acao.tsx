"use client";

import { useState, useTransition, type ReactNode } from "react";
import { classesBotao, type VarianteBotao } from "@/componentes/Botao";

type Resultado = { ok: boolean; erro?: string };

/** Botão que executa uma ação de administração e mostra o erro logo abaixo. */
export function useAcao() {
  const [enviando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const executar = (acao: () => Promise<Resultado>, aoConcluir?: () => void) =>
    iniciar(async () => {
      try {
        const resultado = await acao();
        setErro(resultado.ok ? null : (resultado.erro ?? "Não foi possível concluir."));
        if (resultado.ok) aoConcluir?.();
      } catch {
        setErro("Não foi possível concluir. Verifique sua conexão.");
      }
    });
  return { enviando, erro, executar, setErro };
}

export function BotaoAcao({ acao, children, variante = "secundario" }: { acao: () => Promise<Resultado>; children: ReactNode; variante?: VarianteBotao }) {
  const { enviando, erro, executar } = useAcao();
  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" disabled={enviando} onClick={() => executar(acao)} className={classesBotao(variante)}>
        {children}
      </button>
      {erro && (
        <span role="alert" className="text-sm font-medium text-terracota-700">
          {erro}
        </span>
      )}
    </span>
  );
}
