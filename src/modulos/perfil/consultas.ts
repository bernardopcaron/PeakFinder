import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { Perfil } from "@/lib/sessao";
import { listarAscensoesDe } from "@/modulos/escaladas/consultas";
import type { AscensaoComVia } from "@/modulos/escaladas/tipos";

export type ContribuicaoPublica = { tipo: "area" | "via"; id: string; nome: string; caminho: string };

export type PerfilPublico = Pick<Perfil, "id" | "nome" | "nome_usuario" | "bio" | "foto_caminho" | "criado_em"> & {
  ascensoes: AscensaoComVia[];
  contribuicoes: ContribuicaoPublica[];
};

/** Perfil visível a qualquer pessoa: ascensões e contribuições aprovadas. Favoritos nunca entram aqui. */
export async function obterPerfilPublico(nomeUsuario: string): Promise<PerfilPublico | null> {
  if (!/^[a-z0-9_]{3,30}$/.test(nomeUsuario)) return null;
  const supabase = await criarClienteServidor();
  const { data: perfil } = await supabase.from("perfis").select("id, nome, nome_usuario, bio, foto_caminho, criado_em").eq("nome_usuario", nomeUsuario).maybeSingle();
  if (!perfil) return null;
  const [ascensoes, areas, vias] = await Promise.all([
    listarAscensoesDe(perfil.id, 10),
    supabase.from("areas").select("id, nome, slug").eq("criado_por", perfil.id).eq("situacao", "aprovado").order("criado_em", { ascending: false }).limit(10),
    supabase.from("vias").select("id, nome").eq("criado_por", perfil.id).eq("situacao", "aprovado").order("criado_em", { ascending: false }).limit(10),
  ]);
  const contribuicoes: ContribuicaoPublica[] = [
    ...(areas.data ?? []).map((a) => ({ tipo: "area" as const, id: a.id, nome: a.nome, caminho: `/areas/${a.slug}` })),
    ...(vias.data ?? []).map((v) => ({ tipo: "via" as const, id: v.id, nome: v.nome, caminho: `/vias/${v.id}` })),
  ];
  return { ...perfil, ascensoes, contribuicoes };
}
