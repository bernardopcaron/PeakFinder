"use server";

import { revalidatePath } from "next/cache";
import { falha, falhaDeValidacao, sucesso, valoresDe, type EstadoFormulario, type ResultadoAcao } from "@/lib/acoes";
import { obterUsuario } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaPerfil } from "./esquemas";

export async function atualizarPerfil(_anterior: EstadoFormulario, form: FormData): Promise<ResultadoAcao> {
  const usuario = await obterUsuario();
  if (!usuario) return falha("Entre na sua conta para continuar.");
  const validado = esquemaPerfil.safeParse(Object.fromEntries(form.entries()));
  if (!validado.success) return falhaDeValidacao(validado.error, form);
  const { nome, nome_usuario, bio } = validado.data;

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("perfis").update({ nome, nome_usuario, bio: bio || null }).eq("id", usuario.id);
  if (error) {
    if (error.code === "23505") {
      return falha("Confira os campos destacados.", { campos: { nome_usuario: "Este nome de usuário já está em uso." }, valores: valoresDe(form) });
    }
    return falha(undefined, { valores: valoresDe(form) });
  }
  revalidatePath("/", "layout");
  return sucesso(undefined, "Perfil atualizado.");
}

/** Grava a foto já enviada ao Storage. Só aceita arquivos da pasta do próprio usuário. */
export async function definirFotoPerfil(caminho: string | null): Promise<ResultadoAcao> {
  const usuario = await obterUsuario();
  if (!usuario) return falha("Entre na sua conta para continuar.");
  if (caminho !== null && !new RegExp(`^${usuario.id}/[A-Za-z0-9-]+\\.(jpe?g|png|webp)$`, "i").test(caminho)) return falha("Arquivo inválido.");
  const supabase = await criarClienteServidor();
  const anterior = usuario.perfil.foto_caminho;
  const { error } = await supabase.from("perfis").update({ foto_caminho: caminho }).eq("id", usuario.id);
  if (error) return falha();
  if (anterior && anterior !== caminho) await supabase.storage.from("avatares").remove([anterior]);
  revalidatePath("/", "layout");
  return sucesso();
}
