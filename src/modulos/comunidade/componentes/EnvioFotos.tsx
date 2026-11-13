"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Botao } from "@/componentes/Botao";
import { enviarArquivo, validarArquivo } from "@/lib/upload";
import { ACEITA } from "@/lib/validar-arquivo";
import { adicionarFoto } from "../acoes";
import type { AlvoFoto } from "../tipos";

const CLASSES = "mt-1 block w-full rounded-lg border border-pedra-300 bg-white px-3 py-2.5 text-base";

export function EnvioFotos({ alvo, usuarioId }: { alvo: AlvoFoto; usuarioId: string | null }) {
  const pagina = usePathname();
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [legenda, setLegenda] = useState("");
  const [tipo, setTipo] = useState("foto");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!usuarioId) {
    return (
      <p className="text-sm">
        <Link href={`/entrar?retorno=${encodeURIComponent(pagina)}`} className="font-semibold text-terracota-700 underline-offset-2 hover:underline">
          Entre para enviar fotos e croquis
        </Link>
      </p>
    );
  }

  const escolher = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const escolhido = evento.target.files?.[0] ?? null;
    if (escolhido) {
      const validacao = validarArquivo(escolhido, "foto");
      if (!validacao.ok) {
        setErro(validacao.erro);
        setArquivo(null);
        evento.target.value = "";
        return;
      }
    }
    setErro(null);
    setArquivo(escolhido);
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!arquivo) {
      setErro("Escolha um arquivo.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const envio = await enviarArquivo("fotos", arquivo, usuarioId);
      if (!envio.ok) {
        setErro(envio.erro);
        return;
      }
      const gravacao = await adicionarFoto({ alvo, caminho: envio.dados.caminho, legenda, tipo, pagina });
      if (!gravacao.ok) {
        setErro(gravacao.erro);
        return;
      }
      setArquivo(null);
      setLegenda("");
      if (entrada.current) entrada.current.value = "";
      router.refresh();
    } catch {
      setErro("Não foi possível enviar. Verifique sua conexão.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-pedra-200">
      <h3 className="font-semibold">Enviar foto ou croqui</h3>
      <div>
        <label htmlFor="envio-foto-arquivo" className="block text-sm font-medium text-grafite-800">
          Arquivo da foto
        </label>
        <input id="envio-foto-arquivo" ref={entrada} type="file" accept={ACEITA.foto} onChange={escolher} disabled={enviando} className={`${CLASSES} file:mr-3 file:rounded file:border-0 file:bg-pedra-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold`} />
        <p className="mt-1 text-xs text-grafite-600">JPEG, PNG ou WebP, até 5 MB.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="envio-foto-legenda" className="block text-sm font-medium text-grafite-800">
            Legenda
          </label>
          <input id="envio-foto-legenda" value={legenda} onChange={(e) => setLegenda(e.target.value)} maxLength={300} disabled={enviando} className={CLASSES} />
        </div>
        <div>
          <label htmlFor="envio-foto-tipo" className="block text-sm font-medium text-grafite-800">
            Tipo de imagem
          </label>
          <select id="envio-foto-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={enviando} className={CLASSES}>
            <option value="foto">Foto</option>
            <option value="croqui">Croqui</option>
          </select>
        </div>
      </div>
      {erro && (
        <p role="alert" className="text-sm font-medium text-terracota-700">
          {erro}
        </p>
      )}
      <Botao type="submit" variante="secundario" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar foto"}
      </Botao>
    </form>
  );
}
