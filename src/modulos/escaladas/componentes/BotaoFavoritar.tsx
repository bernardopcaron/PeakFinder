"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { classesBotao } from "@/componentes/Botao";
import { definirFavorito } from "../acoes";

function Coracao({ cheio }: { cheio: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={cheio ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.600-7 10-7 10Z" strokeLinejoin="round" />
    </svg>
  );
}

export function BotaoFavoritar({ viaId, favoritada: inicial, logado }: { viaId: string; favoritada: boolean; logado: boolean }) {
  const [favoritada, setFavoritada] = useState(inicial);
  const [erro, setErro] = useState<string | null>(null);
  const [pendentes, setPendentes] = useState(0);
  // Cliques em sequência são enfileirados: cada um grava o estado desejado, na ordem em que ocorreu.
  const fila = useRef<Promise<void>>(Promise.resolve());

  if (!logado) {
    return (
      <Link href={`/entrar?retorno=${encodeURIComponent(`/vias/${viaId}`)}`} className={classesBotao("secundario")}>
        <Coracao cheio={false} />
        Favoritar
      </Link>
    );
  }

  const alternar = () => {
    const desejado = !favoritada;
    setFavoritada(desejado);
    setErro(null);
    setPendentes((n) => n + 1);
    fila.current = fila.current.then(async () => {
      try {
        const resultado = await definirFavorito(viaId, desejado);
        if (!resultado.ok) {
          setFavoritada(!desejado);
          setErro(resultado.erro);
        }
      } catch {
        setFavoritada(!desejado);
        setErro("Não foi possível salvar. Verifique sua conexão.");
      } finally {
        setPendentes((n) => n - 1);
      }
    });
  };

  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" onClick={alternar} aria-pressed={favoritada} aria-busy={pendentes > 0} className={`${classesBotao("secundario")} ${favoritada ? "text-terracota-700 ring-terracota-300" : ""}`}>
        <Coracao cheio={favoritada} />
        {favoritada ? "Favoritada" : "Favoritar"}
      </button>
      {erro && (
        <span role="alert" className="text-sm text-terracota-700">
          {erro}
        </span>
      )}
    </span>
  );
}
