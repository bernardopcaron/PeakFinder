"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Aviso } from "@/componentes/Aviso";
import { Botao, classesBotao } from "@/componentes/Botao";
import { Campo, CampoSelecao, CampoTexto } from "@/componentes/Campo";
import { grausDaModalidade, type Modalidade } from "@/lib/graus";
import { registrarAscensao } from "../acoes";
import { ESTILOS, ROTULOS_ESTILO } from "../tipos";

export function FormAscensao({
  viaId,
  modalidade,
  ascensoes,
  logado,
  hoje,
}: {
  viaId: string;
  modalidade: Modalidade;
  ascensoes: number;
  logado: boolean;
  hoje: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(registrarAscensao, null);
  const erros = estado && !estado.ok ? (estado.campos ?? {}) : {};
  const valores = estado && !estado.ok ? (estado.valores ?? {}) : {};
  // Depois de salvar, o formulário é recriado vazio (a chave muda) e fica fechado até novo clique.
  const salvo = estado?.ok ? estado.dados.id : null;
  const [fechadoApos, setFechadoApos] = useState<string | null>(null);
  const mostrarFormulario = aberto && salvo === fechadoApos;

  if (!logado) {
    return (
      <Link href={`/entrar?retorno=${encodeURIComponent(`/vias/${viaId}`)}`} className={classesBotao()}>
        Registrar ascensão
      </Link>
    );
  }

  return (
    <div className="w-full space-y-3">
      {!mostrarFormulario && (
        <Botao
          type="button"
          onClick={() => {
            setFechadoApos(salvo);
            setAberto(true);
          }}
        >
          Registrar ascensão
        </Botao>
      )}
      {estado?.ok && !mostrarFormulario && <Aviso tom="sucesso">{estado.mensagem}</Aviso>}
      {ascensoes > 0 && (
        <p className="text-sm text-grafite-700">
          Você registrou {ascensoes} {ascensoes === 1 ? "ascensão" : "ascensões"} nesta via.
        </p>
      )}
      {mostrarFormulario && (
        <form key={salvo ?? "novo"} action={acao} className="space-y-4 rounded-xl bg-white p-4 ring-1 ring-pedra-200" noValidate>
          <h3 className="font-semibold">Registrar ascensão</h3>
          {estado && !estado.ok && !estado.campos && <Aviso tom="erro">{estado.erro}</Aviso>}
          <input type="hidden" name="via_id" value={viaId} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Data" name="data" type="date" max={hoje} required defaultValue={valores.data ?? hoje} erro={erros.data} />
            <CampoSelecao rotulo="Estilo" name="estilo" required defaultValue={valores.estilo ?? "encadenada"} erro={erros.estilo}>
              {ESTILOS.map((estilo) => (
                <option key={estilo} value={estilo}>
                  {ROTULOS_ESTILO[estilo]}
                </option>
              ))}
            </CampoSelecao>
          </div>
          <CampoSelecao rotulo="Grau sugerido (opcional)" name="grau_sugerido" defaultValue={valores.grau_sugerido ?? ""} erro={erros.grau_sugerido}>
            <option value="">Concordo com o grau da via</option>
            {grausDaModalidade(modalidade).map((grau) => (
              <option key={grau} value={grau}>
                {grau}
              </option>
            ))}
          </CampoSelecao>
          <CampoTexto rotulo="Notas" name="notas" maxLength={1000} defaultValue={valores.notas} erro={erros.notas} placeholder="Condições, equipamento, como foi o crux…" />
          <div className="flex gap-2">
            <Botao type="submit" disabled={enviando}>
              {enviando ? "Salvando…" : "Salvar ascensão"}
            </Botao>
            <Botao type="button" variante="fantasma" onClick={() => setAberto(false)}>
              Cancelar
            </Botao>
          </div>
        </form>
      )}
    </div>
  );
}
