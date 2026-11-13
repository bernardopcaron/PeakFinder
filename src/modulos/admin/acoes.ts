"use server";

import { revalidatePath } from "next/cache";
import { falha, sucesso, type EstadoFormulario, type ResultadoAcao } from "@/lib/acoes";
import { ehUuid } from "@/lib/formato";
import { obterUsuario, type Usuario } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { TipoContribuicao } from "@/modulos/comunidade/tipos";
import { geojsonParaLinha, gpxParaLinha, linhaParaWkt, type Linha } from "./gpx";

const TABELAS = { area: "areas", setor: "setores", via: "vias" } as const;
const NEGADO = "Ação restrita a administradores.";

/** Toda ação confere o papel aqui; o RLS do banco confere de novo. */
async function admin(): Promise<Usuario | null> {
  const usuario = await obterUsuario();
  return usuario?.perfil.papel === "admin" ? usuario : null;
}

function atualizarTudo() {
  revalidatePath("/", "layout");
}

export async function aprovar(tipo: TipoContribuicao, id: string): Promise<ResultadoAcao> {
  const usuario = await admin();
  if (!usuario) return falha(NEGADO);
  const supabase = await criarClienteServidor();
  if (tipo === "setor") {
    const { data } = await supabase.from("setores").select("area:areas(situacao)").eq("id", id).maybeSingle();
    if (data?.area?.situacao !== "aprovado") return falha("Aprove primeiro a área deste setor.");
  }
  if (tipo === "via") {
    const { data } = await supabase.from("vias").select("setor:setores(situacao)").eq("id", id).maybeSingle();
    if (data?.setor?.situacao !== "aprovado") return falha("Aprove primeiro o setor desta via.");
  }
  const { data, error } = await supabase
    .from(TABELAS[tipo])
    .update({ situacao: "aprovado", moderado_por: usuario.id, moderado_em: new Date().toISOString(), motivo_rejeicao: null })
    .eq("id", id)
    .select("id");
  if (error || data.length === 0) return falha();
  atualizarTudo();
  return sucesso();
}

export async function rejeitar(tipo: TipoContribuicao, id: string, motivo: string): Promise<ResultadoAcao> {
  const usuario = await admin();
  if (!usuario) return falha(NEGADO);
  const texto = motivo.trim();
  if (texto.length < 5) return falha("Explique o motivo (mínimo de 5 caracteres).");
  if (texto.length > 500) return falha("O motivo pode ter no máximo 500 caracteres.");
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from(TABELAS[tipo])
    .update({ situacao: "rejeitado", moderado_por: usuario.id, moderado_em: new Date().toISOString(), motivo_rejeicao: texto })
    .eq("id", id)
    .select("id");
  if (error || data.length === 0) return falha();
  atualizarTudo();
  return sucesso();
}

export async function definirOrigem(tipo: TipoContribuicao, id: string, origem: string): Promise<ResultadoAcao> {
  const usuario = await admin();
  if (!usuario) return falha(NEGADO);
  if (origem !== "comunidade" && origem !== "verificado") return falha("Origem inválida.");
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from(TABELAS[tipo]).update({ origem, moderado_por: usuario.id, moderado_em: new Date().toISOString() }).eq("id", id).select("id");
  if (error || data.length === 0) return falha();
  atualizarTudo();
  return sucesso();
}

export async function definirDestaque(id: string, destaque: boolean): Promise<ResultadoAcao> {
  if (!(await admin())) return falha(NEGADO);
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("areas").update({ destaque }).eq("id", id);
  if (error) return falha();
  atualizarTudo();
  return sucesso();
}

export async function ocultarComentario(id: string, oculto: boolean): Promise<ResultadoAcao> {
  const usuario = await admin();
  if (!usuario) return falha(NEGADO);
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("comentarios").update({ oculto, ocultado_por: oculto ? usuario.id : null }).eq("id", id);
  if (error) return falha();
  atualizarTudo();
  return sucesso();
}

export async function ocultarFoto(id: string, oculta: boolean): Promise<ResultadoAcao> {
  if (!(await admin())) return falha(NEGADO);
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("fotos").update({ oculta }).eq("id", id);
  if (error) return falha();
  atualizarTudo();
  return sucesso();
}

export async function tratarReporte(id: string, situacao: "confirmado" | "descartado" | "resolvido", nota?: string, vigenteAte?: string): Promise<ResultadoAcao> {
  const usuario = await admin();
  if (!usuario) return falha(NEGADO);
  if (!["confirmado", "descartado", "resolvido"].includes(situacao)) return falha("Situação inválida.");
  if (vigenteAte && !/^\d{4}-\d{2}-\d{2}$/.test(vigenteAte)) return falha("Data de vigência inválida.");
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("reportes")
    .update({ situacao, resolvido_por: usuario.id, nota_admin: nota?.trim().slice(0, 1000) || null, vigente_ate: vigenteAte || null })
    .eq("id", id);
  if (error) return falha();
  atualizarTudo();
  return sucesso();
}

export async function definirPapel(usuarioId: string, papel: "usuario" | "admin"): Promise<ResultadoAcao> {
  const usuario = await admin();
  if (!usuario) return falha(NEGADO);
  if (papel !== "usuario" && papel !== "admin") return falha("Papel inválido.");
  const supabase = await criarClienteServidor();
  if (papel === "usuario") {
    if (usuarioId === usuario.id) return falha("Você não pode remover o seu próprio acesso de administrador.");
    const { count } = await supabase.from("perfis").select("id", { count: "exact", head: true }).eq("papel", "admin");
    if ((count ?? 0) <= 1) return falha("É preciso manter ao menos um administrador.");
  }
  const { data, error } = await supabase.from("perfis").update({ papel }).eq("id", usuarioId).select("id");
  if (error || data.length === 0) return falha();
  atualizarTudo();
  return sucesso();
}

export async function cadastrarTrilha(_anterior: EstadoFormulario, form: FormData): Promise<ResultadoAcao> {
  if (!(await admin())) return falha(NEGADO);
  const areaId = String(form.get("area_id") ?? "");
  const nome = String(form.get("nome") ?? "").trim();
  const arquivo = form.get("arquivo");
  const campos: Record<string, string> = {};
  if (!ehUuid(areaId)) campos.area_id = "Escolha a área.";
  if (nome.length < 2 || nome.length > 120) campos.nome = "Informe o nome da trilha.";
  if (!(arquivo instanceof File) || arquivo.size === 0) campos.arquivo = "Escolha um arquivo GPX ou GeoJSON.";
  else if (arquivo.size > 5 * 1024 * 1024) campos.arquivo = "Arquivo muito grande (máx. 5 MB).";
  if (Object.keys(campos).length > 0) return falha("Confira os campos destacados.", { campos, valores: { area_id: areaId, nome } });

  let linha: Linha;
  try {
    const conteudo = await (arquivo as File).text();
    linha = /\.(geo)?json$/i.test((arquivo as File).name) || conteudo.trimStart().startsWith("{") ? geojsonParaLinha(conteudo) : gpxParaLinha(conteudo);
  } catch (erro) {
    return falha("Confira os campos destacados.", { campos: { arquivo: erro instanceof Error ? erro.message : "Arquivo inválido." }, valores: { area_id: areaId, nome } });
  }
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("trilhas_acesso").insert({
    area_id: areaId,
    nome,
    tracado: linhaParaWkt(linha.coordenadas),
    distancia_m: linha.distancia_m,
    descricao: String(form.get("descricao") ?? "").trim().slice(0, 1000) || null,
  });
  if (error) return falha(undefined, { valores: { area_id: areaId, nome } });
  atualizarTudo();
  return sucesso(undefined, "Trilha cadastrada.");
}

/** Registra um modelo já enviado ao bucket `modelos` pelo navegador do administrador. */
export async function cadastrarModelo(dados: { area_id: string; nome: string; caminho: string; demonstrativo: boolean; descricao: string }): Promise<ResultadoAcao> {
  const usuario = await admin();
  if (!usuario) return falha(NEGADO);
  if (!ehUuid(dados.area_id)) return falha("Escolha a área.");
  const nome = dados.nome.trim();
  if (nome.length < 2 || nome.length > 120) return falha("Informe o nome do modelo.");
  if (!new RegExp(`^${usuario.id}/[A-Za-z0-9-]+\\.(glb|gltf)$`, "i").test(dados.caminho)) return falha("Arquivo inválido.");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("modelos_3d").insert({
    area_id: dados.area_id,
    nome,
    caminho: dados.caminho,
    demonstrativo: dados.demonstrativo,
    descricao: dados.descricao.trim().slice(0, 1000) || null,
  });
  if (error) {
    await supabase.storage.from("modelos").remove([dados.caminho]);
    return falha();
  }
  atualizarTudo();
  return sucesso(undefined, "Modelo cadastrado.");
}

export async function removerTrilha(id: string): Promise<ResultadoAcao> {
  if (!(await admin())) return falha(NEGADO);
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("trilhas_acesso").delete().eq("id", id);
  if (error) return falha();
  atualizarTudo();
  return sucesso();
}

export async function removerModelo(id: string): Promise<ResultadoAcao> {
  if (!(await admin())) return falha(NEGADO);
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("modelos_3d").delete().eq("id", id).select("caminho");
  if (error) return falha();
  // Os arquivos demonstrativos do seed são compartilhados entre áreas e ficam no bucket.
  if (data[0] && !data[0].caminho.startsWith("demonstrativo/")) await supabase.storage.from("modelos").remove([data[0].caminho]);
  atualizarTudo();
  return sucesso();
}
