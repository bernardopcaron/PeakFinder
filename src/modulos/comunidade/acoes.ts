"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodType } from "zod";
import { falha, falhaDeValidacao, sucesso, valoresDe, type EstadoFormulario, type ResultadoAcao } from "@/lib/acoes";
import { ehUuid } from "@/lib/formato";
import { retornoSeguro } from "@/lib/retorno";
import { obterUsuario } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaArea, esquemaComentario, esquemaFoto, esquemaSetor, esquemaVia } from "./esquemas";
import type { TipoContribuicao } from "./tipos";

const SEM_LOGIN = "Entre na sua conta para continuar.";
const TABELAS = { area: "areas", setor: "setores", via: "vias" } as const;

/** Campos opcionais vazios são gravados como null, para limpar valores numa edição. */
function comNulos<T extends Record<string, unknown>>(dados: T, opcionais: string[]): Record<string, unknown> {
  const linha: Record<string, unknown> = { ...dados };
  for (const campo of opcionais) if (linha[campo] === undefined) linha[campo] = null;
  return linha;
}

async function gravarContribuicao(tipo: TipoContribuicao, esquema: ZodType<Record<string, unknown>>, opcionais: string[], form: FormData): Promise<ResultadoAcao<{ id: string }>> {
  const usuario = await obterUsuario();
  if (!usuario) return falha(SEM_LOGIN, { valores: valoresDe(form) });
  const validado = esquema.safeParse(Object.fromEntries(form.entries()));
  if (!validado.success) return falhaDeValidacao(validado.error, form);
  const linha = comNulos(validado.data, opcionais);
  const supabase = await criarClienteServidor();
  const id = form.get("id");

  if (typeof id === "string" && id) {
    if (!ehUuid(id)) return falha("Contribuição inválida.");
    const admin = usuario.perfil.papel === "admin";
    // Autores só alteram registros próprios e ainda em análise; administradores editam qualquer um (o RLS confirma).
    let alteracao = supabase.from(TABELAS[tipo]).update(linha as never).eq("id", id);
    if (!admin) alteracao = alteracao.eq("criado_por", usuario.id).eq("situacao", "pendente");
    const { data, error } = await alteracao.select("id, criado_por");
    if (error) return falha(undefined, { valores: valoresDe(form) });
    if (data.length === 0) return falha("Esta contribuição já foi analisada e não pode mais ser editada.", { valores: valoresDe(form) });
    revalidatePath("/minhas-escaladas");
    revalidatePath("/admin", "layout");
    redirect(admin && (data[0] as { criado_por: string | null }).criado_por !== usuario.id ? "/admin/pendentes" : "/minhas-escaladas?enviado=edicao");
  }

  const { error } = await supabase.from(TABELAS[tipo]).insert(linha as never);
  if (error) {
    const semPermissao = error.code === "42501";
    return falha(semPermissao ? "Não é possível adicionar a este local. Escolha uma área ou setor aprovado, ou enviado por você." : undefined, { valores: valoresDe(form) });
  }
  revalidatePath("/minhas-escaladas");
  redirect(`/minhas-escaladas?enviado=${tipo}`);
}

export async function enviarArea(_anterior: EstadoFormulario<{ id: string }>, form: FormData) {
  return gravarContribuicao("area", esquemaArea as never, ["descricao", "tipo_rocha", "melhor_epoca", "condicoes_acesso"], form);
}

export async function enviarSetor(_anterior: EstadoFormulario<{ id: string }>, form: FormData) {
  return gravarContribuicao("setor", esquemaSetor as never, ["descricao", "orientacao", "tempo_aproximacao_min", "lat", "lng"], form);
}

export async function enviarVia(_anterior: EstadoFormulario<{ id: string }>, form: FormData) {
  return gravarContribuicao("via", esquemaVia as never, ["altura_m", "extensao_m", "costuras", "protecao", "crux", "descricao", "conquistadores", "ano_conquista"], form);
}

function revalidarOrigem(form: FormData | string | null) {
  const caminho = retornoSeguro(typeof form === "string" || form === null ? form : (form.get("caminho") as string | null));
  if (caminho !== "/") revalidatePath(caminho);
}

export async function comentar(_anterior: EstadoFormulario<{ id: string }>, form: FormData): Promise<ResultadoAcao<{ id: string }>> {
  const usuario = await obterUsuario();
  if (!usuario) return falha(SEM_LOGIN, { valores: valoresDe(form) });
  const validado = esquemaComentario.safeParse(Object.fromEntries(form.entries()));
  if (!validado.success) return falhaDeValidacao(validado.error, form);
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("comentarios")
    .insert({ usuario_id: usuario.id, via_id: validado.data.via_id ?? null, area_id: validado.data.area_id ?? null, texto: validado.data.texto })
    .select("id")
    .single();
  if (error) return falha(undefined, { valores: valoresDe(form) });
  revalidarOrigem(form);
  return sucesso({ id: data.id });
}

export async function removerComentario(id: string, caminho: string): Promise<ResultadoAcao> {
  const usuario = await obterUsuario();
  if (!usuario) return falha(SEM_LOGIN);
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("comentarios").delete().eq("id", id).eq("usuario_id", usuario.id);
  if (error) return falha();
  revalidarOrigem(caminho);
  return sucesso();
}

export async function adicionarFoto(dados: { alvo: Record<string, string>; caminho: string; legenda: string; tipo: string; pagina: string }): Promise<ResultadoAcao> {
  const usuario = await obterUsuario();
  if (!usuario) return falha(SEM_LOGIN);
  const validado = esquemaFoto.safeParse({ ...dados.alvo, caminho: dados.caminho, legenda: dados.legenda, tipo: dados.tipo });
  if (!validado.success) return falha(validado.error.issues[0]?.message ?? "Foto inválida.");
  // Só aceita arquivos que o próprio usuário enviou para a sua pasta.
  if (!new RegExp(`^${usuario.id}/[A-Za-z0-9-]+\\.(jpe?g|png|webp)$`, "i").test(validado.data.caminho)) return falha("Arquivo inválido.");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("fotos").insert({
    area_id: validado.data.area_id ?? null,
    setor_id: validado.data.setor_id ?? null,
    via_id: validado.data.via_id ?? null,
    caminho: validado.data.caminho,
    legenda: validado.data.legenda ?? null,
    tipo: validado.data.tipo,
    enviado_por: usuario.id,
  });
  if (error) {
    await supabase.storage.from("fotos").remove([validado.data.caminho]);
    return falha();
  }
  revalidarOrigem(dados.pagina);
  return sucesso();
}

export async function removerFoto(id: string, pagina: string): Promise<ResultadoAcao> {
  const usuario = await obterUsuario();
  if (!usuario) return falha(SEM_LOGIN);
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("fotos").delete().eq("id", id).eq("enviado_por", usuario.id).select("caminho");
  if (error) return falha();
  if (data[0]) await supabase.storage.from("fotos").remove([data[0].caminho]);
  revalidarOrigem(pagina);
  return sucesso();
}
