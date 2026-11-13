"use client";

import { useActionState, useState } from "react";
import { Aviso } from "@/componentes/Aviso";
import { Botao } from "@/componentes/Botao";
import { Campo, CampoSelecao, CampoTexto } from "@/componentes/Campo";
import { UFS } from "@/lib/ufs";
import { SeletorPonto } from "@/modulos/mapa";
import { enviarArea } from "../acoes";

const numero = (texto: string) => Number(texto.trim().replace(",", "."));

export function FormArea({ inicial }: { inicial?: Record<string, unknown> }) {
  const [estado, acao, enviando] = useActionState(enviarArea, null);
  const erros = estado && !estado.ok ? (estado.campos ?? {}) : {};
  const anteriores = estado && !estado.ok ? (estado.valores ?? {}) : {};
  const valor = (campo: string) => anteriores[campo] ?? (inicial?.[campo] != null ? String(inicial[campo]) : "");
  const [lat, setLat] = useState(() => valor("lat"));
  const [lng, setLng] = useState(() => valor("lng"));
  const ponto = lat.trim() && lng.trim() && !Number.isNaN(numero(lat)) && !Number.isNaN(numero(lng)) ? { lat: numero(lat), lng: numero(lng) } : null;

  return (
    <form action={acao} className="space-y-5" noValidate>
      {estado && !estado.ok && <Aviso tom="erro">{estado.erro}</Aviso>}
      {inicial?.id != null && <input type="hidden" name="id" value={String(inicial.id)} />}
      <Campo rotulo="Nome da área" name="nome" required maxLength={120} defaultValue={valor("nome")} erro={erros.nome} />
      <div className="grid gap-4 sm:grid-cols-3">
        <CampoSelecao rotulo="Estado" name="estado" required defaultValue={valor("estado")} erro={erros.estado}>
          <option value="">Selecione</option>
          {UFS.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </CampoSelecao>
        <div className="sm:col-span-2">
          <Campo rotulo="Município" name="municipio" required maxLength={120} defaultValue={valor("municipio")} erro={erros.municipio} />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-grafite-800">Localização</legend>
        <p className="text-sm text-grafite-600">Toque no mapa para marcar o ponto, ou digite as coordenadas em graus decimais.</p>
        <SeletorPonto
          valor={ponto}
          onChange={(p) => {
            setLat(String(p.lat));
            setLng(String(p.lng));
          }}
        />
        <div className="grid grid-cols-2 gap-4">
          <Campo rotulo="Latitude" name="lat" inputMode="decimal" required placeholder="-22.6847" value={lat} onChange={(e) => setLat(e.target.value)} erro={erros.lat} />
          <Campo rotulo="Longitude" name="lng" inputMode="decimal" required placeholder="-45.6417" value={lng} onChange={(e) => setLng(e.target.value)} erro={erros.lng} />
        </div>
      </fieldset>

      <CampoTexto rotulo="Descrição" name="descricao" maxLength={5000} defaultValue={valor("descricao")} erro={erros.descricao} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Tipo de rocha" name="tipo_rocha" maxLength={80} defaultValue={valor("tipo_rocha")} erro={erros.tipo_rocha} />
        <Campo rotulo="Melhor época" name="melhor_epoca" maxLength={120} defaultValue={valor("melhor_epoca")} erro={erros.melhor_epoca} />
      </div>
      <CampoTexto
        rotulo="Condições de acesso"
        name="condicoes_acesso"
        maxLength={2000}
        defaultValue={valor("condicoes_acesso")}
        erro={erros.condicoes_acesso}
        ajuda="Estacionamento, autorização, horários, regras do local."
      />
      <Botao type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : inicial ? "Salvar alterações" : "Enviar para análise"}
      </Botao>
    </form>
  );
}
