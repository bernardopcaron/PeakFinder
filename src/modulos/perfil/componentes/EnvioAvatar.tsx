"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Avatar } from "@/componentes/Avatar";
import { enviarArquivo, validarArquivo } from "@/lib/upload";
import { ACEITA } from "@/lib/validar-arquivo";
import { definirFotoPerfil } from "../acoes";

export function EnvioAvatar({ usuarioId, nome, fotoCaminho }: { usuarioId: string; nome: string; fotoCaminho: string | null }) {
  const id = useId();
  const router = useRouter();
  const [caminho, setCaminho] = useState(fotoCaminho);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const aoEscolher = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;
    const validacao = validarArquivo(arquivo, "avatar");
    if (!validacao.ok) {
      setErro(validacao.erro);
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const envio = await enviarArquivo("avatares", arquivo, usuarioId);
      if (!envio.ok) {
        setErro(envio.erro);
        return;
      }
      const gravacao = await definirFotoPerfil(envio.dados.caminho);
      if (!gravacao.ok) {
        setErro(gravacao.erro);
        return;
      }
      setCaminho(envio.dados.caminho);
      router.refresh();
    } catch {
      setErro("Não foi possível enviar a foto. Verifique sua conexão.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar nome={nome} fotoCaminho={caminho} tamanho="g" />
      <div>
        <label htmlFor={id} className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-white px-4 text-sm font-semibold ring-1 ring-inset ring-pedra-300 hover:bg-pedra-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-terracota-600">
          {enviando ? "Enviando…" : caminho ? "Trocar foto" : "Enviar foto"}
          <input id={id} type="file" accept={ACEITA.avatar} aria-label="Foto de perfil" disabled={enviando} onChange={aoEscolher} className="sr-only" />
        </label>
        <p className="mt-1 text-xs text-grafite-600">JPEG, PNG ou WebP, até 2 MB.</p>
        {erro && (
          <p role="alert" className="mt-1 text-sm font-medium text-terracota-700">
            {erro}
          </p>
        )}
      </div>
    </div>
  );
}
