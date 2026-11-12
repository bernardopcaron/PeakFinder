"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Aviso } from "@/componentes/Aviso";
import { Botao } from "@/componentes/Botao";
import { Campo } from "@/componentes/Campo";
import type { EstadoFormulario } from "@/lib/acoes";
import { cadastrar, definirNovaSenha, entrar, pedirRecuperacao } from "../acoes-auth";

function Mensagens({ estado }: { estado: EstadoFormulario }) {
  if (!estado) return null;
  if (estado.ok) return estado.mensagem ? <Aviso tom="sucesso">{estado.mensagem}</Aviso> : null;
  return estado.campos ? null : <Aviso tom="erro">{estado.erro}</Aviso>;
}

const valores = (estado: EstadoFormulario) => (estado && !estado.ok ? (estado.valores ?? {}) : {});
const campos = (estado: EstadoFormulario) => (estado && !estado.ok ? (estado.campos ?? {}) : {});

export function FormEntrar({ retorno }: { retorno: string }) {
  const [estado, acao, enviando] = useActionState(entrar, null);
  return (
    <form action={acao} className="space-y-4" noValidate>
      <Mensagens estado={estado} />
      <input type="hidden" name="retorno" value={retorno} />
      <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" required defaultValue={valores(estado).email} erro={campos(estado).email} />
      <Campo rotulo="Senha" name="senha" type="password" autoComplete="current-password" required erro={campos(estado).senha} />
      <Botao type="submit" disabled={enviando} className="w-full">
        {enviando ? "Entrando…" : "Entrar"}
      </Botao>
      <p className="text-center text-sm">
        <Link href="/recuperar-senha" className="font-medium text-terracota-700 underline-offset-2 hover:underline">
          Esqueci minha senha
        </Link>
      </p>
    </form>
  );
}

export function FormCadastrar({ retorno }: { retorno: string }) {
  const [estado, acao, enviando] = useActionState(cadastrar, null);
  return (
    <form action={acao} className="space-y-4" noValidate>
      <Mensagens estado={estado} />
      <input type="hidden" name="retorno" value={retorno} />
      <Campo rotulo="Nome" name="nome" autoComplete="name" required defaultValue={valores(estado).nome} erro={campos(estado).nome} />
      <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" required defaultValue={valores(estado).email} erro={campos(estado).email} />
      <Campo
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="new-password"
        required
        ajuda="Mínimo de 8 caracteres."
        erro={campos(estado).senha}
      />
      <Botao type="submit" disabled={enviando} className="w-full">
        {enviando ? "Criando conta…" : "Criar conta"}
      </Botao>
    </form>
  );
}

export function FormRecuperar() {
  const [estado, acao, enviando] = useActionState(pedirRecuperacao, null);
  return (
    <form action={acao} className="space-y-4" noValidate>
      <Mensagens estado={estado} />
      <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" required defaultValue={valores(estado).email} erro={campos(estado).email} />
      <Botao type="submit" disabled={enviando} className="w-full">
        {enviando ? "Enviando…" : "Enviar link"}
      </Botao>
    </form>
  );
}

export function FormNovaSenha() {
  const [estado, acao, enviando] = useActionState(definirNovaSenha, null);
  return (
    <form action={acao} className="space-y-4" noValidate>
      <Mensagens estado={estado} />
      <Campo
        rotulo="Nova senha"
        name="senha"
        type="password"
        autoComplete="new-password"
        required
        ajuda="Mínimo de 8 caracteres."
        erro={campos(estado).senha}
      />
      <Botao type="submit" disabled={enviando} className="w-full">
        {enviando ? "Salvando…" : "Salvar nova senha"}
      </Botao>
    </form>
  );
}
