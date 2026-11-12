"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { falha, falhaDeValidacao, sucesso, valoresDe, type EstadoFormulario, type ResultadoAcao } from "@/lib/acoes";
import { retornoSeguro } from "@/lib/retorno";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaCadastro, esquemaEntrada, esquemaNovaSenha, esquemaRecuperacao } from "./esquemas";

const dados = (form: FormData) => Object.fromEntries(form.entries());

export async function cadastrar(_anterior: EstadoFormulario, form: FormData): Promise<ResultadoAcao> {
  const validado = esquemaCadastro.safeParse(dados(form));
  if (!validado.success) return falhaDeValidacao(validado.error, form);
  const { nome, email, senha } = validado.data;

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.signUp({ email, password: senha, options: { data: { nome } } });
  if (error) {
    const repetido = error.code === "user_already_exists" || /already registered/i.test(error.message);
    return falha(repetido ? "Já existe uma conta com este e-mail." : undefined, { valores: valoresDe(form) });
  }
  // Com confirmação de e-mail ligada, o Supabase não informa se o e-mail já existia: devolve um usuário sem identidades.
  if (data.user && data.user.identities?.length === 0) {
    return falha("Já existe uma conta com este e-mail.", { valores: valoresDe(form) });
  }
  if (!data.session) {
    return sucesso(undefined, "Enviamos um link de confirmação para o seu e-mail. Abra-o para ativar a conta.");
  }
  revalidatePath("/", "layout");
  redirect(retornoSeguro(form.get("retorno") as string | null));
}

export async function entrar(_anterior: EstadoFormulario, form: FormData): Promise<ResultadoAcao> {
  const validado = esquemaEntrada.safeParse(dados(form));
  if (!validado.success) return falhaDeValidacao(validado.error, form);

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email: validado.data.email, password: validado.data.senha });
  if (error) {
    const naoConfirmado = error.code === "email_not_confirmed";
    return falha(naoConfirmado ? "Confirme seu e-mail antes de entrar." : "E-mail ou senha incorretos.", { valores: valoresDe(form) });
  }
  revalidatePath("/", "layout");
  redirect(retornoSeguro(form.get("retorno") as string | null));
}

export async function sair(): Promise<void> {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function pedirRecuperacao(_anterior: EstadoFormulario, form: FormData): Promise<ResultadoAcao> {
  const validado = esquemaRecuperacao.safeParse(dados(form));
  if (!validado.success) return falhaDeValidacao(validado.error, form);

  const cabecalhos = await headers();
  const host = cabecalhos.get("x-forwarded-host") ?? cabecalhos.get("host");
  const protocolo = cabecalhos.get("x-forwarded-proto") ?? "https";
  const supabase = await criarClienteServidor();
  await supabase.auth.resetPasswordForEmail(validado.data.email, {
    redirectTo: `${protocolo}://${host}/auth/callback?destino=/nova-senha`,
  });
  // Mesma resposta exista ou não a conta, para não revelar quais e-mails estão cadastrados.
  return sucesso(undefined, "Se houver uma conta com este e-mail, enviaremos um link para redefinir a senha.");
}

export async function definirNovaSenha(_anterior: EstadoFormulario, form: FormData): Promise<ResultadoAcao> {
  const validado = esquemaNovaSenha.safeParse(dados(form));
  if (!validado.success) return falhaDeValidacao(validado.error, form);

  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return falha("O link expirou. Peça um novo link de recuperação.");
  const { error } = await supabase.auth.updateUser({ password: validado.data.senha });
  if (error) return falha(error.code === "same_password" ? "A nova senha precisa ser diferente da atual." : undefined);
  revalidatePath("/", "layout");
  redirect("/");
}
