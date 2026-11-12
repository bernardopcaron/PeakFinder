import type { Modalidade } from "@/lib/graus";
import type { Database } from "@/lib/supabase/tipos-banco";

export type EstiloAscensao = Database["public"]["Enums"]["estilo_ascensao"];

export const ROTULOS_ESTILO: Record<EstiloAscensao, string> = {
  a_vista: "À vista",
  flash: "Flash",
  encadenada: "Encadenada",
  trabalhada: "Trabalhada",
  top_rope: "Top rope",
};

export const ESTILOS = Object.keys(ROTULOS_ESTILO) as EstiloAscensao[];

export type ViaReferencia = {
  id: string;
  nome: string;
  grau: string;
  grau_ordem: number;
  modalidade: Modalidade;
  area_nome: string;
  area_slug: string;
};

export type AscensaoComVia = { id: string; data: string; estilo: EstiloAscensao; notas: string | null; grau_sugerido: string | null; via: ViaReferencia };
export type FavoritoComVia = { id: string; criado_em: string; via: ViaReferencia };
export type EstadoDaVia = { favoritada: boolean; minhaNota: number | null; ascensoes: number };
