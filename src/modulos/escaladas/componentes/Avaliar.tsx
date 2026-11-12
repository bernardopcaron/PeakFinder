"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { avaliarVia } from "../acoes";

export function Avaliar({
  viaId,
  minhaNota,
  media,
  total,
  logado,
}: {
  viaId: string;
  minhaNota: number | null;
  media: number | null;
  total: number;
  logado: boolean;
}) {
  const [nota, setNota] = useState(minhaNota);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  const escolher = (valor: number) => {
    const anterior = nota;
    setNota(valor);
    setErro(null);
    iniciar(async () => {
      const resultado = await avaliarVia(viaId, valor);
      if (!resultado.ok) {
        setNota(anterior);
        setErro(resultado.erro);
      }
    });
  };

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-pedra-200">
      <p data-testid="nota-media" className="text-sm text-grafite-700">
        {media == null ? (
          "Ainda sem avaliações"
        ) : (
          <>
            <span className="text-xl font-bold text-grafite-900">★ {Number(media).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>{" "}
            de 5 · {total} {total === 1 ? "avaliação" : "avaliações"}
          </>
        )}
      </p>
      {logado ? (
        <fieldset className="mt-3" disabled={enviando}>
          <legend className="text-sm font-medium">Sua avaliação</legend>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((valor) => (
              <label key={valor} className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-lg text-2xl hover:bg-areia-100 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-terracota-600">
                <input
                  type="radio"
                  name={`nota-${viaId}`}
                  value={valor}
                  checked={nota === valor}
                  onChange={() => escolher(valor)}
                  aria-label={`${valor} ${valor === 1 ? "estrela" : "estrelas"}`}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <span aria-hidden="true" className={nota != null && valor <= nota ? "text-terracota-600" : "text-pedra-300"}>
                  ★
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="mt-2 text-sm">
          <Link href={`/entrar?retorno=${encodeURIComponent(`/vias/${viaId}`)}`} className="font-semibold text-terracota-700 underline-offset-2 hover:underline">
            Entre para avaliar
          </Link>
        </p>
      )}
      {erro && (
        <p role="alert" className="mt-2 text-sm text-terracota-700">
          {erro}
        </p>
      )}
    </div>
  );
}
