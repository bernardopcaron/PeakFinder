"use client";

import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { removerComentario, removerFoto } from "../acoes";

function Remover({ acao, rotulo = "Remover" }: { acao: (pagina: string) => Promise<{ ok: boolean; erro?: string }>; rotulo?: string }) {
  const pagina = usePathname();
  const [enviando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        disabled={enviando}
        onClick={() =>
          iniciar(async () => {
            const resultado = await acao(pagina);
            setErro(resultado.ok ? null : (resultado.erro ?? "Não foi possível remover."));
          })
        }
        className="min-h-11 rounded-lg px-3 text-sm font-medium text-grafite-600 hover:bg-pedra-100 hover:text-terracota-700 disabled:opacity-50"
      >
        {enviando ? "Removendo…" : rotulo}
      </button>
      {erro && (
        <span role="alert" className="text-xs text-terracota-700">
          {erro}
        </span>
      )}
    </>
  );
}

export function RemoverComentario({ id }: { id: string }) {
  return <Remover acao={(pagina) => removerComentario(id, pagina)} />;
}

export function RemoverFoto({ id }: { id: string }) {
  return <Remover acao={(pagina) => removerFoto(id, pagina)} rotulo="Remover foto" />;
}
