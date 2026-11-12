import type { Modalidade } from "@/lib/graus";

export type ViaNoMapa = { m: Modalidade; o: number };

export type PropsArea = {
  tipo: "area";
  id: string;
  slug: string;
  nome: string;
  municipio: string;
  estado: string;
  origem: string;
  total_vias: number;
  vias: ViaNoMapa[];
};
export type PropsSetor = { tipo: "setor"; id: string; slug: string; nome: string; area_slug: string; area_nome: string };
export type PropsTrilha = { tipo: "trilha"; id: string; nome: string; area_slug: string; distancia_m: number | null };

export type FeatureMapa =
  | { type: "Feature"; geometry: { type: "Point"; coordinates: [number, number] }; properties: PropsArea }
  | { type: "Feature"; geometry: { type: "Point"; coordinates: [number, number] }; properties: PropsSetor }
  | { type: "Feature"; geometry: { type: "LineString"; coordinates: [number, number][] }; properties: PropsTrilha };

export type ColecaoMapa = { type: "FeatureCollection"; features: FeatureMapa[] };

export type FiltrosMapa = { modalidades: Modalidade[]; faixas: string[] };

export const SEM_FILTROS: FiltrosMapa = { modalidades: [], faixas: [] };
