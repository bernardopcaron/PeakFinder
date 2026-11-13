"use client";

import Link from "next/link";
import { useState } from "react";
import { urlPublica } from "@/lib/arquivos";
import { dataCurta } from "@/lib/formato";
import { ROTULOS_TIPO } from "@/modulos/comunidade/tipos";
import { ROTULOS_REPORTE } from "@/modulos/moderacao/esquemas";
import { definirOrigem, definirPapel, ocultarComentario, ocultarFoto, removerModelo, removerTrilha, tratarReporte } from "../acoes";
import type { ComentarioAdmin, Conteudo, FotoAdmin, ReporteAdmin, UsuarioAdmin } from "../tipos";
import { BotaoAcao, useAcao } from "./Acao";

const CARTAO = "rounded-xl bg-white p-4 ring-1 ring-pedra-200";
const Marca = ({ children, tom = "neutro" }: { children: React.ReactNode; tom?: "neutro" | "alerta" | "ok" }) => (
  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tom === "alerta" ? "bg-terracota-100 text-terracota-800" : tom === "ok" ? "bg-mata-100 text-mata-800" : "bg-pedra-100 text-grafite-700"}`}>{children}</span>
);

export function ItemConteudo({ item }: { item: Conteudo }) {
  const { enviando, erro, executar } = useAcao();
  const [origem, setOrigem] = useState(item.origem);
  const [salvo, setSalvo] = useState(false);
  return (
    <li className={`${CARTAO} flex flex-wrap items-center gap-3`}>
      <span className="w-14 shrink-0 rounded bg-pedra-100 py-1 text-center text-xs font-semibold uppercase text-grafite-700">{ROTULOS_TIPO[item.tipo]}</span>
      <div className="min-w-0 flex-1">
        <Link href={item.caminho} className="font-semibold hover:text-terracota-700">
          {item.nome}
        </Link>
        <p className="text-sm text-grafite-600">{item.contexto}</p>
      </div>
      {origem === "demonstrativo" ? (
        <Marca>Dados demonstrativos</Marca>
      ) : (
        <span className="flex items-center gap-2">
          <select
            aria-label={`Origem de ${item.nome}`}
            value={origem}
            disabled={enviando}
            onChange={(e) => {
              const nova = e.target.value as "comunidade" | "verificado";
              setSalvo(false);
              executar(
                () => definirOrigem(item.tipo, item.id, nova),
                () => {
                  setOrigem(nova);
                  setSalvo(true);
                },
              );
            }}
            className="min-h-11 rounded-lg border border-pedra-300 bg-white px-3 text-sm"
          >
            <option value="comunidade">Comunidade</option>
            <option value="verificado">Verificado</option>
          </select>
          {salvo && <span className="text-sm font-medium text-mata-700">Salvo</span>}
        </span>
      )}
      {erro && (
        <p role="alert" className="w-full text-sm font-medium text-terracota-700">
          {erro}
        </p>
      )}
    </li>
  );
}

const SITUACOES_REPORTE = { aberto: "Aberto", confirmado: "Confirmado", descartado: "Descartado", resolvido: "Resolvido" };

export function ItemReporte({ item }: { item: ReporteAdmin }) {
  const [nota, setNota] = useState(item.nota_admin ?? "");
  const [vigencia, setVigencia] = useState(item.vigente_ate ?? "");
  const publico = item.tipo !== "erro";
  return (
    <li className={`${CARTAO} space-y-3`}>
      <div className="flex flex-wrap items-center gap-2">
        <Marca tom={item.tipo === "interdicao" ? "alerta" : "neutro"}>{ROTULOS_REPORTE[item.tipo]}</Marca>
        <Marca tom={item.situacao === "confirmado" ? "alerta" : item.situacao === "resolvido" ? "ok" : "neutro"}>{SITUACOES_REPORTE[item.situacao]}</Marca>
        {item.caminho ? (
          <Link href={item.caminho} className="font-semibold hover:text-terracota-700">
            {item.alvo}
          </Link>
        ) : (
          <span className="font-semibold">{item.alvo}</span>
        )}
      </div>
      <p className="whitespace-pre-line">{item.descricao}</p>
      <p className="text-sm text-grafite-600">
        Reportado por {item.autor} em {dataCurta(item.criado_em)}
      </p>
      {(item.situacao === "aberto" || item.situacao === "confirmado") && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-medium sm:col-span-2">
            Texto público do alerta (opcional)
            <input value={nota} onChange={(e) => setNota(e.target.value)} maxLength={1000} className="mt-1 block w-full rounded-lg border border-pedra-300 px-3 py-2 text-base font-normal" />
          </label>
          <label className="text-sm font-medium">
            Vigente até (opcional)
            <input type="date" value={vigencia} onChange={(e) => setVigencia(e.target.value)} className="mt-1 block w-full rounded-lg border border-pedra-300 px-3 py-2 text-base font-normal" />
          </label>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {item.situacao === "aberto" && (
          <>
            <BotaoAcao variante="primario" acao={() => tratarReporte(item.id, "confirmado", nota, vigencia)}>
              Confirmar
            </BotaoAcao>
            <BotaoAcao variante="fantasma" acao={() => tratarReporte(item.id, "descartado", nota)}>
              Descartar
            </BotaoAcao>
          </>
        )}
        {item.situacao === "confirmado" && (
          <>
            <BotaoAcao variante="primario" acao={() => tratarReporte(item.id, "resolvido", nota)}>
              Marcar como resolvido
            </BotaoAcao>
            <BotaoAcao acao={() => tratarReporte(item.id, "confirmado", nota, vigencia)}>Salvar texto e vigência</BotaoAcao>
          </>
        )}
      </div>
      {publico && item.situacao === "aberto" && <p className="text-xs text-grafite-600">Ao confirmar, o alerta aparece no topo da página da área para todos.</p>}
    </li>
  );
}

export function ItemComentario({ item }: { item: ComentarioAdmin }) {
  return (
    <li className={`${CARTAO} flex flex-wrap items-start gap-3`}>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-sm text-grafite-600">
          {item.oculto && <Marca tom="alerta">Oculto</Marca>}
          <span>
            {item.autor} · {dataCurta(item.criado_em)} ·{" "}
            {item.caminho ? (
              <Link href={item.caminho} className="font-medium text-terracota-700 hover:underline">
                {item.alvo}
              </Link>
            ) : (
              item.alvo
            )}
          </span>
        </p>
        <p className="mt-1 whitespace-pre-line break-words">{item.texto}</p>
      </div>
      <BotaoAcao acao={() => ocultarComentario(item.id, !item.oculto)}>{item.oculto ? "Restaurar" : "Ocultar"}</BotaoAcao>
    </li>
  );
}

export function ItemFoto({ item }: { item: FotoAdmin }) {
  return (
    <li className={`${CARTAO} space-y-2`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={urlPublica("fotos", item.caminho)} alt={item.legenda || "Foto enviada"} loading="lazy" className={`aspect-square w-full rounded object-cover ${item.oculta ? "opacity-40" : ""}`} />
      <p className="truncate text-sm">
        {item.oculta && <Marca tom="alerta">Oculta</Marca>} {item.legenda || (item.tipo === "croqui" ? "Croqui" : "Sem legenda")}
      </p>
      <p className="text-xs text-grafite-600">
        {item.autor} · {dataCurta(item.criado_em)}
      </p>
      <BotaoAcao acao={() => ocultarFoto(item.id, !item.oculta)}>{item.oculta ? "Restaurar" : "Ocultar"}</BotaoAcao>
    </li>
  );
}

export function ItemUsuario({ item, euMesmo }: { item: UsuarioAdmin; euMesmo: boolean }) {
  return (
    <li className={`${CARTAO} flex flex-wrap items-center gap-3`}>
      <div className="min-w-0 flex-1" data-usuario={item.id}>
        <p className="flex flex-wrap items-center gap-2">
          <Link href={`/u/${item.nome_usuario}`} className="font-semibold hover:text-terracota-700">
            {item.nome}
          </Link>
          {item.papel === "admin" && <Marca tom="ok">Administrador</Marca>}
          {euMesmo && <Marca>Você</Marca>}
        </p>
        <p className="text-sm text-grafite-600">
          @{item.nome_usuario} · desde {dataCurta(item.criado_em)}
        </p>
      </div>
      {!euMesmo &&
        (item.papel === "admin" ? (
          <BotaoAcao acao={() => definirPapel(item.id, "usuario")}>Remover administrador</BotaoAcao>
        ) : (
          <BotaoAcao acao={() => definirPapel(item.id, "admin")}>Tornar administrador</BotaoAcao>
        ))}
    </li>
  );
}

export function RemoverTrilha({ id }: { id: string }) {
  return (
    <BotaoAcao variante="fantasma" acao={() => removerTrilha(id)}>
      Remover
    </BotaoAcao>
  );
}

export function RemoverModelo({ id }: { id: string }) {
  return (
    <BotaoAcao variante="fantasma" acao={() => removerModelo(id)}>
      Remover
    </BotaoAcao>
  );
}
