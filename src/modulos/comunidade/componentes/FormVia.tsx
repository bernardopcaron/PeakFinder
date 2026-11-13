"use client";

import { useActionState, useState } from "react";
import { Aviso } from "@/componentes/Aviso";
import { Botao } from "@/componentes/Botao";
import { Campo, CampoSelecao, CampoTexto } from "@/componentes/Campo";
import { MODALIDADES, ROTULOS_MODALIDADE, grausDaModalidade, type Modalidade } from "@/lib/graus";
import { enviarVia } from "../acoes";
import type { Destino } from "../tipos";

export function FormVia({ destinos, setorInicial, inicial }: { destinos: Destino[]; setorInicial?: string; inicial?: Record<string, unknown> }) {
  const [estado, acao, enviando] = useActionState(enviarVia, null);
  const erros = estado && !estado.ok ? (estado.campos ?? {}) : {};
  const anteriores = estado && !estado.ok ? (estado.valores ?? {}) : {};
  const valor = (campo: string) => anteriores[campo] ?? (inicial?.[campo] != null ? String(inicial[campo]) : "");

  const setorDeInicio = valor("setor_id") || setorInicial || "";
  const [areaId, setAreaId] = useState(() => destinos.find((a) => a.setores.some((s) => s.id === setorDeInicio))?.id ?? "");
  const [setorId, setSetorId] = useState(setorDeInicio);
  const [modalidade, setModalidade] = useState<Modalidade>((valor("modalidade") as Modalidade) || "esportiva");
  const [grau, setGrau] = useState(valor("grau"));
  const setores = destinos.find((a) => a.id === areaId)?.setores ?? [];
  const graus = grausDaModalidade(modalidade);

  return (
    <form action={acao} className="space-y-5" noValidate>
      {estado && !estado.ok && <Aviso tom="erro">{estado.erro}</Aviso>}
      {inicial?.id != null && <input type="hidden" name="id" value={String(inicial.id)} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelecao
          rotulo="Área"
          name="area_escolhida"
          value={areaId}
          onChange={(e) => {
            setAreaId(e.target.value);
            setSetorId("");
          }}
        >
          <option value="">Selecione</option>
          {destinos.map((area) => (
            <option key={area.id} value={area.id}>
              {area.nome}
            </option>
          ))}
        </CampoSelecao>
        <CampoSelecao
          rotulo="Setor"
          name="setor_id"
          required
          value={setorId}
          onChange={(e) => setSetorId(e.target.value)}
          erro={erros.setor_id}
          ajuda={areaId && setores.length === 0 ? "Esta área ainda não tem setores. Cadastre um setor primeiro." : undefined}
        >
          <option value="">{areaId ? "Selecione" : "Escolha a área primeiro"}</option>
          {setores.map((setor) => (
            <option key={setor.id} value={setor.id}>
              {setor.nome}
            </option>
          ))}
        </CampoSelecao>
      </div>
      <Campo rotulo="Nome da via" name="nome" required maxLength={120} defaultValue={valor("nome")} erro={erros.nome} />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelecao
          rotulo="Modalidade"
          name="modalidade"
          required
          value={modalidade}
          onChange={(e) => {
            setModalidade(e.target.value as Modalidade);
            setGrau("");
          }}
          erro={erros.modalidade}
        >
          {MODALIDADES.map((m) => (
            <option key={m} value={m}>
              {ROTULOS_MODALIDADE[m]}
            </option>
          ))}
        </CampoSelecao>
        <CampoSelecao rotulo="Grau" name="grau" required value={graus.includes(grau) ? grau : ""} onChange={(e) => setGrau(e.target.value)} erro={erros.grau}>
          <option value="">Selecione</option>
          {graus.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </CampoSelecao>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Campo rotulo="Altura (m)" name="altura_m" inputMode="decimal" defaultValue={valor("altura_m")} erro={erros.altura_m} />
        <Campo rotulo="Extensão (m)" name="extensao_m" inputMode="decimal" defaultValue={valor("extensao_m")} erro={erros.extensao_m} />
        <Campo rotulo="Costuras" name="costuras" inputMode="numeric" defaultValue={valor("costuras")} erro={erros.costuras} />
      </div>
      <CampoTexto rotulo="Proteção" name="protecao" rows={2} maxLength={500} defaultValue={valor("protecao")} erro={erros.protecao} ajuda="Tipo e estado das proteções, paradas, material móvel necessário." />
      <CampoTexto rotulo="Crux" name="crux" rows={2} maxLength={500} defaultValue={valor("crux")} erro={erros.crux} />
      <CampoTexto rotulo="Descrição" name="descricao" maxLength={5000} defaultValue={valor("descricao")} erro={erros.descricao} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Campo rotulo="Conquistadores" name="conquistadores" maxLength={200} defaultValue={valor("conquistadores")} erro={erros.conquistadores} />
        </div>
        <Campo rotulo="Ano da conquista" name="ano_conquista" inputMode="numeric" defaultValue={valor("ano_conquista")} erro={erros.ano_conquista} />
      </div>
      <Botao type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : inicial ? "Salvar alterações" : "Enviar para análise"}
      </Botao>
    </form>
  );
}
