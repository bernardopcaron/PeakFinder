import { obterUsuario } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { AlvoComentario, Comentario, Contribuicao, Destino, TipoContribuicao } from "./tipos";

/** Áreas (com seus setores) que podem receber novas contribuições: aprovadas ou do próprio autor. */
export async function listarDestinos(): Promise<Destino[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("areas").select("id, nome, situacao, setores(id, nome, situacao)").neq("situacao", "rejeitado").order("nome");
  if (error) throw error;
  return data.map((area) => ({
    ...area,
    setores: area.setores.filter((s) => s.situacao !== "rejeitado").sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
  }));
}

export async function listarMinhasContribuicoes(): Promise<Contribuicao[]> {
  const usuario = await obterUsuario();
  if (!usuario) return [];
  const supabase = await criarClienteServidor();
  const comuns = "id, nome, slug, situacao, motivo_rejeicao, criado_em";
  const [areas, setores, vias] = await Promise.all([
    supabase.from("areas").select(`${comuns}, municipio, estado`).eq("criado_por", usuario.id),
    supabase.from("setores").select(`${comuns}, area:areas(nome, slug)`).eq("criado_por", usuario.id),
    supabase.from("vias").select(`${comuns}, grau, setor:setores(nome, area:areas(nome))`).eq("criado_por", usuario.id),
  ]);
  if (areas.error) throw areas.error;
  if (setores.error) throw setores.error;
  if (vias.error) throw vias.error;
  const visivel = (situacao: string) => situacao !== "rejeitado";
  const lista: Contribuicao[] = [
    ...areas.data.map((a) => ({ ...a, tipo: "area" as const, contexto: `${a.municipio} · ${a.estado}`, caminho: visivel(a.situacao) ? `/areas/${a.slug}` : null })),
    ...setores.data.map((s) => ({ ...s, tipo: "setor" as const, contexto: s.area?.nome ?? "", caminho: visivel(s.situacao) && s.area ? `/areas/${s.area.slug}/${s.slug}` : null })),
    ...vias.data.map((v) => ({ ...v, tipo: "via" as const, contexto: `${v.grau} · ${v.setor?.area?.nome ?? ""} / ${v.setor?.nome ?? ""}`, caminho: visivel(v.situacao) ? `/vias/${v.id}` : null })),
  ];
  return lista.sort((a, b) => b.criado_em.localeCompare(a.criado_em));
}

const TABELAS = { area: "areas", setor: "setores", via: "vias" } as const;

/** Registro do próprio usuário ainda em análise, para edição; null em qualquer outro caso. */
export async function obterContribuicaoParaEdicao(tipo: TipoContribuicao, id: string): Promise<Record<string, unknown> | null> {
  const usuario = await obterUsuario();
  if (!usuario) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from(TABELAS[tipo]).select("*").eq("id", id).eq("criado_por", usuario.id).eq("situacao", "pendente").maybeSingle();
  return data;
}

export async function listarComentarios(alvo: AlvoComentario): Promise<Comentario[]> {
  const supabase = await criarClienteServidor();
  const [coluna, valor] = Object.entries(alvo)[0] as ["via_id" | "area_id", string];
  const { data, error } = await supabase
    .from("comentarios")
    .select("id, texto, criado_em, usuario_id, autor:perfis!comentarios_usuario_id_fkey(nome, nome_usuario, foto_caminho)")
    .eq(coluna, valor)
    .eq("oculto", false)
    .order("criado_em", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data as unknown as Comentario[];
}
