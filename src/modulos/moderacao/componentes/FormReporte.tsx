"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Aviso } from "@/componentes/Aviso";
import { Botao, classesBotao } from "@/componentes/Botao";
import { CampoSelecao, CampoTexto } from "@/componentes/Campo";
import { reportar } from "../acoes";
import { ROTULOS_REPORTE, TIPOS_REPORTE } from "../esquemas";

export function FormReporte({ alvo, logado, retorno }: { alvo: Record<string, string>; logado: boolean; retorno: string }) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(reportar, null);
  const erros = estado && !estado.ok ? (estado.campos ?? {}) : {};
  const valores = estado && !estado.ok ? (estado.valores ?? {}) : {};

  if (!logado) {
    return (
      <Link href={`/entrar?retorno=${encodeURIComponent(retorno)}`} className={classesBotao("fantasma")}>
        Reportar erro ou restrição
      </Link>
    );
  }
  if (estado?.ok) return <Aviso tom="sucesso">{estado.mensagem}</Aviso>;
  if (!aberto) {
    return (
      <Botao type="button" variante="fantasma" onClick={() => setAberto(true)}>
        Reportar erro ou restrição
      </Botao>
    );
  }
  return (
    <form action={acao} className="space-y-4 rounded-xl bg-white p-4 ring-1 ring-pedra-200" noValidate>
      <h3 className="font-semibold">Reportar erro ou restrição</h3>
      <p className="text-sm text-grafite-600">Avise sobre informações erradas, restrições ou interdições de acesso. Um administrador analisa antes de publicar.</p>
      {estado && !estado.ok && !estado.campos && <Aviso tom="erro">{estado.erro}</Aviso>}
      {Object.entries(alvo).map(([campo, valor]) => (
        <input key={campo} type="hidden" name={campo} value={valor} />
      ))}
      <CampoSelecao rotulo="Tipo" name="tipo" defaultValue={valores.tipo ?? "erro"} erro={erros.tipo}>
        {TIPOS_REPORTE.map((tipo) => (
          <option key={tipo} value={tipo}>
            {ROTULOS_REPORTE[tipo]}
          </option>
        ))}
      </CampoSelecao>
      <CampoTexto rotulo="O que aconteceu?" name="descricao" required maxLength={2000} defaultValue={valores.descricao} erro={erros.descricao} />
      <div className="flex gap-2">
        <Botao type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar reporte"}
        </Botao>
        <Botao type="button" variante="fantasma" onClick={() => setAberto(false)}>
          Cancelar
        </Botao>
      </div>
    </form>
  );
}
