"use client";

import { useActionState } from "react";
import { Aviso } from "@/componentes/Aviso";
import { Botao } from "@/componentes/Botao";
import { Campo, CampoTexto } from "@/componentes/Campo";
import type { Perfil } from "@/lib/sessao";
import { atualizarPerfil } from "../acoes";

export function FormPerfil({ perfil }: { perfil: Perfil }) {
  const [estado, acao, enviando] = useActionState(atualizarPerfil, null);
  const erros = estado && !estado.ok ? (estado.campos ?? {}) : {};
  const valores = estado && !estado.ok ? (estado.valores ?? {}) : {};
  return (
    <form action={acao} className="space-y-4" noValidate>
      {estado?.ok && <Aviso tom="sucesso">{estado.mensagem}</Aviso>}
      {estado && !estado.ok && !estado.campos && <Aviso tom="erro">{estado.erro}</Aviso>}
      <Campo rotulo="Nome" name="nome" autoComplete="name" required maxLength={80} defaultValue={valores.nome ?? perfil.nome} erro={erros.nome} />
      <Campo
        rotulo="Nome de usuário"
        name="nome_usuario"
        required
        autoCapitalize="none"
        spellCheck={false}
        defaultValue={valores.nome_usuario ?? perfil.nome_usuario}
        erro={erros.nome_usuario}
        ajuda="Aparece no endereço do seu perfil público."
      />
      <CampoTexto rotulo="Biografia" name="bio" maxLength={300} defaultValue={valores.bio ?? perfil.bio ?? ""} erro={erros.bio} ajuda="Até 300 caracteres." />
      <Botao type="submit" disabled={enviando}>
        {enviando ? "Salvando…" : "Salvar perfil"}
      </Botao>
    </form>
  );
}
