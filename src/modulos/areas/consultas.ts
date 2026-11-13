import { hojeNoBrasil } from "@/lib/datas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { AlertaAcesso, AreaDetalhe, AreaResumo, ResultadoBusca, SetorDetalhe } from "./tipos";

const COLUNAS_RESUMO = "id, slug, nome, municipio, estado, tipo_rocha, capa_caminho, origem";

export async function listarAreasDestaque(): Promise<AreaResumo[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("areas").select(COLUNAS_RESUMO).eq("situacao", "aprovado").eq("destaque", true).order("nome");
  if (error) throw error;
  return data;
}

export async function listarAreas(): Promise<AreaResumo[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("areas").select(COLUNAS_RESUMO).eq("situacao", "aprovado").order("nome");
  if (error) throw error;
  return data;
}

/**
 * Restrições e interdições confirmadas e vigentes de uma área, incluindo as reportadas
 * em qualquer setor ou via dela.
 */
export async function listarAlertasDaArea(areaId: string): Promise<AlertaAcesso[]> {
  const supabase = await criarClienteServidor();
  const { data: setores } = await supabase.from("setores").select("id, vias(id)").eq("area_id", areaId);
  const idsSetores = (setores ?? []).map((s) => s.id);
  const idsVias = (setores ?? []).flatMap((s) => s.vias.map((v) => v.id));
  // Os ids vêm do banco (uuid), então podem compor o filtro com segurança.
  const alvos = [`area_id.eq.${areaId}`];
  if (idsSetores.length) alvos.push(`setor_id.in.(${idsSetores.join(",")})`);
  if (idsVias.length) alvos.push(`via_id.in.(${idsVias.join(",")})`);
  const { data, error } = await supabase
    .from("reportes")
    .select("id, tipo, descricao, nota_admin, vigente_ate, criado_em")
    .eq("situacao", "confirmado")
    .in("tipo", ["restricao", "interdicao"])
    .or(alvos.join(","))
    .or(`vigente_ate.is.null,vigente_ate.gte.${hojeNoBrasil()}`)
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data as AlertaAcesso[];
}

/** Área com setores, alertas vigentes, modelo 3D e fotos. O RLS esconde registros pendentes de quem não é autor nem admin. */
export async function obterAreaPorSlug(slug: string): Promise<AreaDetalhe | null> {
  const supabase = await criarClienteServidor();
  const { data: area, error } = await supabase.from("areas").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!area) return null;
  const [setores, alertas, modelo, fotos] = await Promise.all([
    supabase.from("setores").select("*").eq("area_id", area.id).neq("situacao", "rejeitado").order("nome"),
    listarAlertasDaArea(area.id),
    supabase.from("modelos_3d").select("*").eq("area_id", area.id).order("criado_em").limit(1).maybeSingle(),
    supabase.from("fotos").select("*").eq("area_id", area.id).eq("oculta", false).order("criado_em", { ascending: false }),
  ]);
  if (setores.error) throw setores.error;
  return { ...area, setores: setores.data, alertas, modelo: modelo.data ?? null, fotos: fotos.data ?? [] };
}

export async function obterSetor(areaSlug: string, setorSlug: string): Promise<SetorDetalhe | null> {
  const supabase = await criarClienteServidor();
  const { data: area } = await supabase.from("areas").select("id, slug, nome, municipio, estado").eq("slug", areaSlug).maybeSingle();
  if (!area) return null;
  const { data: setor, error } = await supabase.from("setores").select("*").eq("area_id", area.id).eq("slug", setorSlug).maybeSingle();
  if (error) throw error;
  if (!setor) return null;
  const [modelo, fotos] = await Promise.all([
    supabase.from("modelos_3d").select("*").eq("setor_id", setor.id).order("criado_em").limit(1).maybeSingle(),
    supabase.from("fotos").select("*").eq("setor_id", setor.id).eq("oculta", false).order("criado_em", { ascending: false }),
  ]);
  return { ...setor, area, alertas: await listarAlertasDaArea(area.id), modelo: modelo.data ?? null, fotos: fotos.data ?? [] };
}

export async function buscarTudo(termo: string): Promise<ResultadoBusca[]> {
  const limpo = termo.trim().slice(0, 100);
  if (limpo.length < 2) return [];
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.rpc("buscar", { termo: limpo });
  if (error) throw error;
  return data as ResultadoBusca[];
}
