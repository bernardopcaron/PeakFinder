"use server";

import { revalidatePath } from "next/cache";
import { falha, falhaDeValidacao, sucesso, valoresDe, type EstadoFormulario, type ResultadoAcao } from "@/lib/acoes";
import { grauParaOrdem, type Modalidade } from "@/lib/graus";
import { obterUsuario } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaAscensao, esquemaAvaliacao } from "./esquemas";

const SEM_LOGIN = "Entre na sua conta para continuar.";

function atualizar(viaId: string) {
  revalidatePath(`/vias/${viaId}`);
  revalidatePath("/minhas-escaladas");
}

/** Liga ou desliga o favorito. Cliques repetidos não geram erro: a operação parte sempre do estado gravado. */
export async function alternarFavorito(viaId: string): Promise<ResultadoAcao<{ favoritada: boolean }>> {
  const usuario = await obterUsuario();
  if (!usuario) return falha(SEM_LOGIN);
  const supabase = await criarClienteServidor();
  const { data: removidos, error: erroRemocao } = await supabase.from("favoritos").delete().eq("usuario_id", usuario.id).eq("via_id", viaId).select("id");
  if (erroRemocao) return falha();
  if (removidos.length > 0) {
    atualizar(viaId);
    return sucesso({ favoritada: false });
  }
  const { error } = await supabase.from("favoritos").upsert({ usuario_id: usuario.id, via_id: viaId }, { onConflict: "usuario_id,via_id", ignoreDuplicates: true });
  if (error) return falha(error.code === "23503" ? "Esta via não existe mais." : undefined);
  atualizar(viaId);
  return sucesso({ favoritada: true });
}

export async function definirFavorito(viaId: string, favoritada: boolean): Promise<ResultadoAcao<{ favoritada: boolean }>> {
  const usuario = await obterUsuario();
  if (!usuario) return falha(SEM_LOGIN);
  const supabase = await criarClienteServidor();
  const { error } = favoritada
    ? await supabase.from("favoritos").upsert({ usuario_id: usuario.id, via_id: viaId }, { onConflict: "usuario_id,via_id", ignoreDuplicates: true })
    : await supabase.from("favoritos").delete().eq("usuario_id", usuario.id).eq("via_id", viaId);
  if (error) return falha(error.code === "23503" ? "Esta via não existe mais." : undefined);
  atualizar(viaId);
  return sucesso({ favoritada });
}

export async function registrarAscensao(_anterior: EstadoFormulario<{ id: string }>, form: FormData): Promise<ResultadoAcao<{ id: string }>> {
  const usuario = await obterUsuario();
  if (!usuario) return falha(SEM_LOGIN, { valores: valoresDe(form) });
  const validado = esquemaAscensao.safeParse(Object.fromEntries(form.entries()));
  if (!validado.success) return falhaDeValidacao(validado.error, form);
  const { via_id, data, estilo, notas, grau_sugerido } = validado.data;

  const supabase = await criarClienteServidor();
  const { data: via } = await supabase.from("vias").select("modalidade").eq("id", via_id).maybeSingle();
  if (!via) return falha("Esta via não existe mais.", { valores: valoresDe(form) });
  if (grau_sugerido && grauParaOrdem(grau_sugerido, via.modalidade as Modalidade) === null) {
    return falha("Confira os campos destacados.", { campos: { grau_sugerido: "Grau inválido para esta modalidade." }, valores: valoresDe(form) });
  }
  const { data: nova, error } = await supabase
    .from("ascensoes")
    .insert({ usuario_id: usuario.id, via_id, data, estilo, notas: notas || null, grau_sugerido: grau_sugerido || null })
    .select("id")
    .single();
  if (error) return falha(undefined, { valores: valoresDe(form) });
  atualizar(via_id);
  return sucesso({ id: nova.id }, "Ascensão registrada.");
}

export async function removerAscensao(id: string): Promise<ResultadoAcao> {
  const usuario = await obterUsuario();
  if (!usuario) return falha(SEM_LOGIN);
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("ascensoes").delete().eq("id", id).eq("usuario_id", usuario.id).select("via_id");
  if (error) return falha();
  if (data[0]) atualizar(data[0].via_id);
  return sucesso();
}

export async function avaliarVia(viaId: string, nota: number): Promise<ResultadoAcao> {
  const usuario = await obterUsuario();
  if (!usuario) return falha(SEM_LOGIN);
  const validado = esquemaAvaliacao.safeParse({ via_id: viaId, nota });
  if (!validado.success) return falha("Nota inválida.");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("avaliacoes").upsert({ usuario_id: usuario.id, via_id: viaId, nota }, { onConflict: "usuario_id,via_id" });
  if (error) return falha(error.code === "23503" ? "Esta via não existe mais." : undefined);
  atualizar(viaId);
  return sucesso();
}
