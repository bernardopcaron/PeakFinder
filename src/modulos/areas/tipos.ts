import type { Origem } from "@/componentes/Selo";
import type { Database } from "@/lib/supabase/tipos-banco";

type Tabelas = Database["public"]["Tables"];
export type Situacao = Database["public"]["Enums"]["situacao"];

export type Area = Tabelas["areas"]["Row"];
export type Setor = Tabelas["setores"]["Row"];
export type Foto = Tabelas["fotos"]["Row"];
export type Modelo3D = Tabelas["modelos_3d"]["Row"];

export type AreaResumo = Pick<Area, "id" | "slug" | "nome" | "municipio" | "estado" | "tipo_rocha" | "capa_caminho"> & { origem: Origem };

export type AlertaAcesso = { id: string; tipo: "restricao" | "interdicao"; descricao: string; nota_admin: string | null; vigente_ate: string | null; criado_em: string };

export type AreaDetalhe = Area & { setores: Setor[]; alertas: AlertaAcesso[]; modelo: Modelo3D | null; fotos: Foto[] };

export type SetorDetalhe = Setor & { area: Pick<Area, "id" | "slug" | "nome" | "municipio" | "estado">; alertas: AlertaAcesso[]; modelo: Modelo3D | null; fotos: Foto[] };

export type ResultadoBusca = { tipo: "area" | "via"; id: string; titulo: string; subtitulo: string; caminho: string };
