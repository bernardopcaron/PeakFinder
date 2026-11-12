import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { criarClienteServidor } from "./supabase/servidor";
import type { Database } from "./supabase/tipos-banco";

export type Perfil = Database["public"]["Tables"]["perfis"]["Row"];
export type Usuario = { id: string; email: string; perfil: Perfil };

/** Usuário da sessão atual, ou null. Uma consulta por requisição. */
export const obterUsuario = cache(async (): Promise<Usuario | null> => {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: perfil } = await supabase.from("perfis").select("*").eq("id", data.user.id).maybeSingle();
  if (!perfil) return null;
  return { id: data.user.id, email: data.user.email ?? "", perfil };
});

/** Exige login; sem sessão, leva à tela de entrada e volta ao caminho informado. */
export async function exigirUsuario(retorno?: string): Promise<Usuario> {
  const usuario = await obterUsuario();
  if (!usuario) redirect(retorno ? `/entrar?retorno=${encodeURIComponent(retorno)}` : "/entrar");
  return usuario;
}

/** Exige administrador; para os demais a página não existe. */
export async function exigirAdmin(): Promise<Usuario> {
  const usuario = await obterUsuario();
  if (!usuario || usuario.perfil.papel !== "admin") notFound();
  return usuario;
}
