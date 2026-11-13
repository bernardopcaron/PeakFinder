import type { Situacao } from "@/modulos/areas/tipos";

export type TipoContribuicao = "area" | "setor" | "via";

export const ROTULOS_SITUACAO: Record<Situacao, string> = { pendente: "Em análise", aprovado: "Aprovada", rejeitado: "Rejeitada" };
export const ROTULOS_TIPO: Record<TipoContribuicao, string> = { area: "Área", setor: "Setor", via: "Via" };

export type Contribuicao = {
  tipo: TipoContribuicao;
  id: string;
  nome: string;
  contexto: string;
  situacao: Situacao;
  motivo_rejeicao: string | null;
  criado_em: string;
  caminho: string | null;
};

export type Destino = { id: string; nome: string; situacao: Situacao; setores: { id: string; nome: string; situacao: Situacao }[] };

export type Comentario = {
  id: string;
  texto: string;
  criado_em: string;
  usuario_id: string;
  autor: { nome: string; nome_usuario: string; foto_caminho: string | null };
};

export type AlvoComentario = { via_id: string } | { area_id: string };
export type AlvoFoto = { area_id: string } | { setor_id: string } | { via_id: string };
