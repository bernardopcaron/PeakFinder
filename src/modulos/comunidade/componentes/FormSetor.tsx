"use client";

import { useActionState } from "react";
import { Aviso } from "@/componentes/Aviso";
import { Botao } from "@/componentes/Botao";
import { Campo, CampoSelecao, CampoTexto } from "@/componentes/Campo";
import { enviarSetor } from "../acoes";
import type { Destino } from "../tipos";

export function FormSetor({ destinos, areaInicial, inicial }: { destinos: Destino[]; areaInicial?: string; inicial?: Record<string, unknown> }) {
  const [estado, acao, enviando] = useActionState(enviarSetor, null);
  const erros = estado && !estado.ok ? (estado.campos ?? {}) : {};
  const anteriores = estado && !estado.ok ? (estado.valores ?? {}) : {};
  const valor = (campo: string) => anteriores[campo] ?? (inicial?.[campo] != null ? String(inicial[campo]) : "");

  return (
    <form action={acao} className="space-y-5" noValidate>
      {estado && !estado.ok && <Aviso tom="erro">{estado.erro}</Aviso>}
      {inicial?.id != null && <input type="hidden" name="id" value={String(inicial.id)} />}
      <CampoSelecao rotulo="Área" name="area_id" required defaultValue={valor("area_id") || areaInicial || ""} erro={erros.area_id}>
        <option value="">Selecione</option>
        {destinos.map((area) => (
          <option key={area.id} value={area.id}>
            {area.nome}
            {area.situacao === "pendente" ? " (em análise)" : ""}
          </option>
        ))}
      </CampoSelecao>
      <Campo rotulo="Nome do setor" name="nome" required maxLength={120} defaultValue={valor("nome")} erro={erros.nome} />
      <CampoTexto rotulo="Descrição" name="descricao" maxLength={5000} defaultValue={valor("descricao")} erro={erros.descricao} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Orientação" name="orientacao" maxLength={40} placeholder="Norte, sul, leste…" defaultValue={valor("orientacao")} erro={erros.orientacao} />
        <Campo rotulo="Aproximação (minutos)" name="tempo_aproximacao_min" inputMode="numeric" defaultValue={valor("tempo_aproximacao_min")} erro={erros.tempo_aproximacao_min} />
      </div>
      <fieldset className="grid grid-cols-2 gap-4">
        <legend className="mb-2 text-sm text-grafite-600">Localização do setor (opcional), em graus decimais</legend>
        <Campo rotulo="Latitude" name="lat" inputMode="decimal" defaultValue={valor("lat")} erro={erros.lat} />
        <Campo rotulo="Longitude" name="lng" inputMode="decimal" defaultValue={valor("lng")} erro={erros.lng} />
      </fieldset>
      <Botao type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : inicial ? "Salvar alterações" : "Enviar para análise"}
      </Botao>
    </form>
  );
}
