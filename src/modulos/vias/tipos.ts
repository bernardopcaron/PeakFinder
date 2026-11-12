import type { Origem } from "@/componentes/Selo";
import type { Modalidade } from "@/lib/graus";
import type { Foto, Situacao } from "@/modulos/areas/tipos";

export type ViaResumo = {
  id: string;
  nome: string;
  modalidade: Modalidade;
  grau: string;
  grau_ordem: number;
  altura_m: number | null;
  costuras: number | null;
  situacao: Situacao;
  origem: Origem;
  setor_nome: string;
  setor_slug: string;
  area_nome: string;
  area_slug: string;
  nota_media: number | null;
  total_avaliacoes: number;
  total_ascensoes: number;
  total_favoritos: number;
};

export type ViaDetalhe = ViaResumo & {
  setor_id: string;
  area_id: string;
  area_municipio: string;
  area_estado: string;
  extensao_m: number | null;
  protecao: string | null;
  crux: string | null;
  descricao: string | null;
  conquistadores: string | null;
  ano_conquista: number | null;
  criado_por: string | null;
  fotos: Foto[];
};
