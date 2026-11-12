import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { ViaDetalhe, ViaResumo } from "./tipos";

const COLUNAS_RESUMO =
  "id, nome, modalidade, grau, grau_ordem, altura_m, costuras, situacao, origem, setor_nome, setor_slug, area_nome, area_slug, nota_media, total_avaliacoes, total_ascensoes, total_favoritos";

// A view devolve todas as colunas como anuláveis; as de vias, setores e áreas nunca são nulas na prática.
const comoResumo = (linhas: unknown[]) => linhas as ViaResumo[];

export async function listarViasPopulares(limite = 8): Promise<ViaResumo[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("vias_resumo").select(COLUNAS_RESUMO).eq("situacao", "aprovado");
  if (error) throw error;
  return comoResumo(data)
    .sort((a, b) => b.total_ascensoes + b.total_favoritos - (a.total_ascensoes + a.total_favoritos) || (b.nota_media ?? 0) - (a.nota_media ?? 0) || a.nome.localeCompare(b.nome, "pt-BR"))
    .slice(0, limite);
}

export async function listarViasDaArea(areaId: string): Promise<ViaResumo[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("vias_resumo").select(COLUNAS_RESUMO).eq("area_id", areaId).neq("situacao", "rejeitado").order("nome");
  if (error) throw error;
  return comoResumo(data);
}

export async function listarViasDoSetor(setorId: string): Promise<ViaResumo[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("vias_resumo").select(COLUNAS_RESUMO).eq("setor_id", setorId).neq("situacao", "rejeitado").order("nome");
  if (error) throw error;
  return comoResumo(data);
}

export async function obterVia(id: string): Promise<ViaDetalhe | null> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("vias_resumo").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: fotos } = await supabase.from("fotos").select("*").eq("via_id", id).eq("oculta", false).order("criado_em", { ascending: false });
  return { ...(data as unknown as Omit<ViaDetalhe, "fotos">), fotos: fotos ?? [] };
}
