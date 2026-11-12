import { obterUsuario } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { AscensaoComVia, EstadoDaVia, FavoritoComVia, ViaReferencia } from "./tipos";

const VIA = "via:vias(id, nome, grau, grau_ordem, modalidade, setor:setores(area:areas(nome, slug)))";

type ViaBruta = Omit<ViaReferencia, "area_nome" | "area_slug"> & { setor: { area: { nome: string; slug: string } } };

function referencia(via: ViaBruta): ViaReferencia {
  const { setor, ...resto } = via;
  return { ...resto, area_nome: setor.area.nome, area_slug: setor.area.slug };
}

export async function listarAscensoesDe(usuarioId: string, limite = 200): Promise<AscensaoComVia[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("ascensoes")
    .select(`id, data, estilo, notas, grau_sugerido, ${VIA}`)
    .eq("usuario_id", usuarioId)
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false })
    .limit(limite);
  if (error) throw error;
  // Vias que o leitor não pode ver (pendentes de outro autor) vêm nulas e são omitidas.
  return (data as unknown as (Omit<AscensaoComVia, "via"> & { via: ViaBruta | null })[])
    .filter((a) => a.via)
    .map((a) => ({ ...a, via: referencia(a.via!) }));
}

export async function listarMinhasAscensoes(): Promise<AscensaoComVia[]> {
  const usuario = await obterUsuario();
  return usuario ? listarAscensoesDe(usuario.id) : [];
}

export async function listarMeusFavoritos(): Promise<FavoritoComVia[]> {
  const usuario = await obterUsuario();
  if (!usuario) return [];
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("favoritos")
    .select(`id, criado_em, ${VIA}`)
    .eq("usuario_id", usuario.id)
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return (data as unknown as (Omit<FavoritoComVia, "via"> & { via: ViaBruta | null })[])
    .filter((f) => f.via)
    .map((f) => ({ ...f, via: referencia(f.via!) }));
}

export async function estadoDaViaParaUsuario(viaId: string): Promise<EstadoDaVia> {
  const usuario = await obterUsuario();
  if (!usuario) return { favoritada: false, minhaNota: null, ascensoes: 0 };
  const supabase = await criarClienteServidor();
  const [favorito, avaliacao, ascensoes] = await Promise.all([
    supabase.from("favoritos").select("id").eq("usuario_id", usuario.id).eq("via_id", viaId).maybeSingle(),
    supabase.from("avaliacoes").select("nota").eq("usuario_id", usuario.id).eq("via_id", viaId).maybeSingle(),
    supabase.from("ascensoes").select("id", { count: "exact", head: true }).eq("usuario_id", usuario.id).eq("via_id", viaId),
  ]);
  return { favoritada: Boolean(favorito.data), minhaNota: avaliacao.data?.nota ?? null, ascensoes: ascensoes.count ?? 0 };
}
