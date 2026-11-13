import { ROTULOS_MODALIDADE, type Modalidade } from "@/lib/graus";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { ComentarioAdmin, Conteudo, FotoAdmin, Pendente, ReporteAdmin, UsuarioAdmin } from "./tipos";

// As consultas abaixo dependem do RLS: só um administrador recebe registros pendentes, ocultos ou de outros usuários.

const nomeDe = (a: { nome: string } | null) => a?.nome ?? "Usuário removido";
const par = (rotulo: string, valor: unknown): [string, string][] => (valor == null || valor === "" ? [] : [[rotulo, String(valor)]]);

export async function listarPendentes(): Promise<Pendente[]> {
  const supabase = await criarClienteServidor();
  const [areas, setores, vias] = await Promise.all([
    supabase.from("areas").select("*, autor:perfis!areas_criado_por_fkey(nome)").eq("situacao", "pendente"),
    supabase.from("setores").select("*, area:areas(nome, situacao), autor:perfis!setores_criado_por_fkey(nome)").eq("situacao", "pendente"),
    supabase.from("vias").select("*, setor:setores(nome, situacao, area:areas(nome)), autor:perfis!vias_criado_por_fkey(nome)").eq("situacao", "pendente"),
  ]);
  if (areas.error) throw areas.error;
  if (setores.error) throw setores.error;
  if (vias.error) throw vias.error;
  const lista: Pendente[] = [
    ...areas.data.map((a) => ({
      tipo: "area" as const,
      id: a.id,
      nome: a.nome,
      contexto: `${a.municipio} · ${a.estado}`,
      detalhes: [["Coordenadas", `${a.lat}, ${a.lng}`] as [string, string], ...par("Rocha", a.tipo_rocha), ...par("Melhor época", a.melhor_epoca), ...par("Acesso", a.condicoes_acesso), ...par("Descrição", a.descricao)],
      autor: nomeDe(a.autor ),
      criado_em: a.criado_em,
    })),
    ...setores.data.map((s) => ({
      tipo: "setor" as const,
      id: s.id,
      nome: s.nome,
      contexto: `Área: ${s.area?.nome ?? "?"}${s.area?.situacao === "pendente" ? " (pendente)" : ""}`,
      detalhes: [...par("Orientação", s.orientacao), ...par("Aproximação (min)", s.tempo_aproximacao_min), ...par("Coordenadas", s.lat != null ? `${s.lat}, ${s.lng}` : null), ...par("Descrição", s.descricao)],
      autor: nomeDe(s.autor ),
      criado_em: s.criado_em,
    })),
    ...vias.data.map((v) => ({
      tipo: "via" as const,
      id: v.id,
      nome: v.nome,
      contexto: `${v.setor?.area?.nome ?? "?"} / ${v.setor?.nome ?? "?"}${v.setor?.situacao === "pendente" ? " (setor pendente)" : ""}`,
      detalhes: [
        ["Grau", v.grau] as [string, string],
        ["Modalidade", ROTULOS_MODALIDADE[v.modalidade as Modalidade]] as [string, string],
        ...par("Altura (m)", v.altura_m),
        ...par("Extensão (m)", v.extensao_m),
        ...par("Costuras", v.costuras),
        ...par("Proteção", v.protecao),
        ...par("Crux", v.crux),
        ...par("Conquistadores", v.conquistadores),
        ...par("Descrição", v.descricao),
      ],
      autor: nomeDe(v.autor ),
      criado_em: v.criado_em,
    })),
  ];
  return lista.sort((a, b) => a.criado_em.localeCompare(b.criado_em));
}

export async function listarConteudo(termo: string): Promise<Conteudo[]> {
  const supabase = await criarClienteServidor();
  const filtro = termo.trim().replace(/[%_,()]/g, " ").slice(0, 60);
  const base = <T extends { ilike: (c: string, p: string) => T }>(q: T) => (filtro ? q.ilike("nome", `%${filtro}%`) : q);
  const [areas, setores, vias] = await Promise.all([
    base(supabase.from("areas").select("id, nome, slug, origem, municipio, estado").eq("situacao", "aprovado")).order("criado_em", { ascending: false }).limit(60),
    base(supabase.from("setores").select("id, nome, slug, origem, area:areas(nome, slug)").eq("situacao", "aprovado")).order("criado_em", { ascending: false }).limit(60),
    base(supabase.from("vias").select("id, nome, origem, grau, setor:setores(nome, area:areas(nome))").eq("situacao", "aprovado")).order("criado_em", { ascending: false }).limit(60),
  ]);
  if (areas.error) throw areas.error;
  if (setores.error) throw setores.error;
  if (vias.error) throw vias.error;
  return [
    ...areas.data.map((a) => ({ tipo: "area" as const, id: a.id, nome: a.nome, origem: a.origem, contexto: `${a.municipio} · ${a.estado}`, caminho: `/areas/${a.slug}` })),
    ...setores.data.map((s) => ({ tipo: "setor" as const, id: s.id, nome: s.nome, origem: s.origem, contexto: s.area?.nome ?? "", caminho: `/areas/${s.area?.slug}/${s.slug}` })),
    ...vias.data.map((v) => ({ tipo: "via" as const, id: v.id, nome: v.nome, origem: v.origem, contexto: `${v.grau} · ${v.setor?.area?.nome ?? ""} / ${v.setor?.nome ?? ""}`, caminho: `/vias/${v.id}` })),
  ];
}

export async function listarReportes(): Promise<ReporteAdmin[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("reportes")
    .select("id, tipo, descricao, situacao, nota_admin, vigente_ate, criado_em, via_id, autor:perfis!reportes_usuario_id_fkey(nome), area:areas(nome, slug), setor:setores(nome, slug, area:areas(nome, slug)), via:vias(nome)")
    .order("criado_em", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data.map((r) => ({
    id: r.id,
    tipo: r.tipo,
    descricao: r.descricao,
    situacao: r.situacao,
    nota_admin: r.nota_admin,
    vigente_ate: r.vigente_ate,
    criado_em: r.criado_em,
    autor: nomeDe(r.autor),
    alvo: r.area ? `Área: ${r.area.nome}` : r.setor ? `Setor: ${r.setor.nome} (${r.setor.area?.nome ?? ""})` : `Via: ${r.via?.nome ?? "?"}`,
    caminho: r.area ? `/areas/${r.area.slug}` : r.setor?.area ? `/areas/${r.setor.area.slug}/${r.setor.slug}` : r.via_id ? `/vias/${r.via_id}` : null,
  }));
}

export async function listarComentariosAdmin(): Promise<ComentarioAdmin[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("comentarios")
    .select("id, texto, oculto, criado_em, via_id, autor:perfis!comentarios_usuario_id_fkey(nome), area:areas(nome, slug), via:vias(nome)")
    .order("criado_em", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data.map((c) => ({
    id: c.id,
    texto: c.texto,
    oculto: c.oculto,
    criado_em: c.criado_em,
    autor: nomeDe(c.autor),
    alvo: c.area ? `Área: ${c.area.nome}` : `Via: ${c.via?.nome ?? "?"}`,
    caminho: c.area ? `/areas/${c.area.slug}` : c.via_id ? `/vias/${c.via_id}` : null,
  }));
}

export async function listarFotosAdmin(): Promise<FotoAdmin[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("fotos")
    .select("id, caminho, legenda, tipo, oculta, criado_em, autor:perfis!fotos_enviado_por_fkey(nome)")
    .order("criado_em", { ascending: false })
    .limit(120);
  if (error) throw error;
  return data.map((f) => ({ ...f, autor: nomeDe(f.autor) }));
}

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("perfis").select("id, nome, nome_usuario, papel, criado_em").order("criado_em", { ascending: false }).limit(500);
  if (error) throw error;
  return data;
}

export async function contarFila(): Promise<{ pendentes: number; reportes: number }> {
  const supabase = await criarClienteServidor();
  const contar = (tabela: "areas" | "setores" | "vias") => supabase.from(tabela).select("id", { count: "exact", head: true }).eq("situacao", "pendente");
  const [a, s, v, r] = await Promise.all([contar("areas"), contar("setores"), contar("vias"), supabase.from("reportes").select("id", { count: "exact", head: true }).eq("situacao", "aberto")]);
  return { pendentes: (a.count ?? 0) + (s.count ?? 0) + (v.count ?? 0), reportes: r.count ?? 0 };
}
