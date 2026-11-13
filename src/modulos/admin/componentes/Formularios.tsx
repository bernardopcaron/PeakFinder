"use client";

import { useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { Aviso } from "@/componentes/Aviso";
import { Botao } from "@/componentes/Botao";
import { Campo, CampoSelecao, CampoTexto } from "@/componentes/Campo";
import { enviarArquivo, validarArquivo } from "@/lib/upload";
import { ACEITA } from "@/lib/validar-arquivo";
import { cadastrarModelo, cadastrarTrilha } from "../acoes";

type Opcao = { id: string; nome: string };

const ARQUIVO = "mt-1 block w-full rounded-lg border border-pedra-300 bg-white px-3 py-2.5 text-base file:mr-3 file:rounded file:border-0 file:bg-pedra-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold";

function SelecaoArea({ areas, erro, valor }: { areas: Opcao[]; erro?: string; valor?: string }) {
  return (
    <CampoSelecao rotulo="Área" name="area_id" required defaultValue={valor ?? ""} erro={erro}>
      <option value="">Selecione</option>
      {areas.map((area) => (
        <option key={area.id} value={area.id}>
          {area.nome}
        </option>
      ))}
    </CampoSelecao>
  );
}

export function FormTrilha({ areas }: { areas: Opcao[] }) {
  const [estado, acao, enviando] = useActionState(cadastrarTrilha, null);
  const erros = estado && !estado.ok ? (estado.campos ?? {}) : {};
  const valores = estado && !estado.ok ? (estado.valores ?? {}) : {};
  return (
    <form key={estado?.ok ? "salvo" : "novo"} action={acao} className="space-y-4" noValidate>
      {estado?.ok && <Aviso tom="sucesso">{estado.mensagem}</Aviso>}
      {estado && !estado.ok && !estado.campos && <Aviso tom="erro">{estado.erro}</Aviso>}
      <SelecaoArea areas={areas} erro={erros.area_id} valor={valores.area_id} />
      <Campo rotulo="Nome da trilha" name="nome" required maxLength={120} defaultValue={valores.nome} erro={erros.nome} />
      <div>
        <label htmlFor="trilha-arquivo" className="block text-sm font-medium text-grafite-800">
          Arquivo GPX ou GeoJSON
        </label>
        <input id="trilha-arquivo" name="arquivo" type="file" accept=".gpx,.geojson,.json,application/gpx+xml,application/geo+json" className={ARQUIVO} />
        {erros.arquivo && (
          <p role="alert" className="mt-1 text-sm font-medium text-terracota-700">
            {erros.arquivo}
          </p>
        )}
      </div>
      <CampoTexto rotulo="Descrição" name="descricao" rows={2} maxLength={1000} />
      <Botao type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Cadastrar trilha"}
      </Botao>
    </form>
  );
}

export function FormModelo({ areas, usuarioId }: { areas: Opcao[]; usuarioId: string }) {
  const router = useRouter();
  const formulario = useRef<HTMLFormElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const arquivo = dados.get("arquivo");
    setMensagem(null);
    if (!(arquivo instanceof File) || arquivo.size === 0) {
      setErro("Escolha um arquivo GLB ou GLTF.");
      return;
    }
    const validacao = validarArquivo(arquivo, "modelo");
    if (!validacao.ok) {
      setErro(validacao.erro);
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const envio = await enviarArquivo("modelos", arquivo, usuarioId);
      if (!envio.ok) {
        setErro(envio.erro);
        return;
      }
      const registro = await cadastrarModelo({
        area_id: String(dados.get("area_id") ?? ""),
        nome: String(dados.get("nome") ?? ""),
        caminho: envio.dados.caminho,
        demonstrativo: dados.get("demonstrativo") === "on",
        descricao: String(dados.get("descricao") ?? ""),
      });
      if (!registro.ok) {
        setErro(registro.erro);
        return;
      }
      setMensagem(registro.mensagem ?? "Modelo cadastrado.");
      formulario.current?.reset();
      router.refresh();
    } catch {
      setErro("Não foi possível enviar. Verifique sua conexão.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form ref={formulario} onSubmit={enviar} className="space-y-4" noValidate>
      {mensagem && <Aviso tom="sucesso">{mensagem}</Aviso>}
      {erro && <Aviso tom="erro">{erro}</Aviso>}
      <SelecaoArea areas={areas} />
      <Campo rotulo="Nome do modelo" name="nome" required maxLength={120} />
      <div>
        <label htmlFor="modelo-arquivo" className="block text-sm font-medium text-grafite-800">
          Arquivo GLB ou GLTF
        </label>
        <input id="modelo-arquivo" name="arquivo" type="file" accept={ACEITA.modelo} className={ARQUIVO} />
        <p className="mt-1 text-xs text-grafite-600">Até 50 MB. Prefira GLB, que traz texturas no mesmo arquivo.</p>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" name="demonstrativo" className="h-5 w-5" />
        Modelo demonstrativo (não representa a parede real)
      </label>
      <CampoTexto rotulo="Descrição" name="descricao" rows={2} maxLength={1000} />
      <Botao type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Cadastrar modelo"}
      </Botao>
    </form>
  );
}
