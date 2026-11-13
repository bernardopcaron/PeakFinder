import type { Origem } from "@/componentes/Selo";
import type { Situacao } from "@/modulos/areas/tipos";
import type { TipoContribuicao } from "@/modulos/comunidade/tipos";

export type Pendente = {
  tipo: TipoContribuicao;
  id: string;
  nome: string;
  contexto: string;
  detalhes: [string, string][];
  autor: string;
  criado_em: string;
};

export type Conteudo = { tipo: TipoContribuicao; id: string; nome: string; contexto: string; origem: Origem; caminho: string };

export type ReporteAdmin = {
  id: string;
  tipo: "erro" | "restricao" | "interdicao";
  descricao: string;
  situacao: "aberto" | "confirmado" | "descartado" | "resolvido";
  nota_admin: string | null;
  vigente_ate: string | null;
  criado_em: string;
  autor: string;
  alvo: string;
  caminho: string | null;
};

export type ComentarioAdmin = { id: string; texto: string; oculto: boolean; criado_em: string; autor: string; alvo: string; caminho: string | null };
export type FotoAdmin = { id: string; caminho: string; legenda: string | null; tipo: string; oculta: boolean; criado_em: string; autor: string };
export type UsuarioAdmin = { id: string; nome: string; nome_usuario: string; papel: "usuario" | "admin"; criado_em: string };
export type { Situacao };
