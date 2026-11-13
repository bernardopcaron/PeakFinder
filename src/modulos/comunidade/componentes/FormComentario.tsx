"use client";

import { usePathname } from "next/navigation";
import { useActionState } from "react";
import { Aviso } from "@/componentes/Aviso";
import { Botao } from "@/componentes/Botao";
import { CampoTexto } from "@/componentes/Campo";
import { comentar } from "../acoes";
import type { AlvoComentario } from "../tipos";

export function FormComentario({ alvo }: { alvo: AlvoComentario }) {
  const pagina = usePathname();
  const [estado, acao, enviando] = useActionState(comentar, null);
  const erros = estado && !estado.ok ? (estado.campos ?? {}) : {};
  const valores = estado && !estado.ok ? (estado.valores ?? {}) : {};
  return (
    // A chave muda a cada comentário salvo, o que limpa o campo.
    <form key={estado?.ok ? estado.dados.id : "novo"} action={acao} className="space-y-3" noValidate>
      {estado && !estado.ok && !estado.campos && <Aviso tom="erro">{estado.erro}</Aviso>}
      {Object.entries(alvo).map(([campo, valor]) => (
        <input key={campo} type="hidden" name={campo} value={valor} />
      ))}
      <input type="hidden" name="caminho" value={pagina} />
      <CampoTexto rotulo="Seu comentário" name="texto" rows={3} maxLength={2000} required defaultValue={valores.texto} erro={erros.texto} placeholder="Condições, dicas, como estava a via…" />
      <Botao type="submit" variante="secundario" disabled={enviando}>
        {enviando ? "Enviando…" : "Comentar"}
      </Botao>
    </form>
  );
}
