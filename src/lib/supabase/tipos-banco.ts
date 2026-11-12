export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          atualizado_em: string
          capa_caminho: string | null
          condicoes_acesso: string | null
          criado_em: string
          criado_por: string | null
          descricao: string | null
          destaque: boolean
          estado: string
          id: string
          lat: number
          lng: number
          localizacao: unknown
          melhor_epoca: string | null
          moderado_em: string | null
          moderado_por: string | null
          motivo_rejeicao: string | null
          municipio: string
          nome: string
          origem: Database["public"]["Enums"]["origem"]
          situacao: Database["public"]["Enums"]["situacao"]
          slug: string
          tipo_rocha: string | null
        }
        Insert: {
          atualizado_em?: string
          capa_caminho?: string | null
          condicoes_acesso?: string | null
          criado_em?: string
          criado_por?: string | null
          descricao?: string | null
          destaque?: boolean
          estado: string
          id?: string
          lat: number
          lng: number
          localizacao?: unknown
          melhor_epoca?: string | null
          moderado_em?: string | null
          moderado_por?: string | null
          motivo_rejeicao?: string | null
          municipio: string
          nome: string
          origem?: Database["public"]["Enums"]["origem"]
          situacao?: Database["public"]["Enums"]["situacao"]
          slug: string
          tipo_rocha?: string | null
        }
        Update: {
          atualizado_em?: string
          capa_caminho?: string | null
          condicoes_acesso?: string | null
          criado_em?: string
          criado_por?: string | null
          descricao?: string | null
          destaque?: boolean
          estado?: string
          id?: string
          lat?: number
          lng?: number
          localizacao?: unknown
          melhor_epoca?: string | null
          moderado_em?: string | null
          moderado_por?: string | null
          motivo_rejeicao?: string | null
          municipio?: string
          nome?: string
          origem?: Database["public"]["Enums"]["origem"]
          situacao?: Database["public"]["Enums"]["situacao"]
          slug?: string
          tipo_rocha?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "areas_moderado_por_fkey"
            columns: ["moderado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      ascensoes: {
        Row: {
          atualizado_em: string
          criado_em: string
          data: string
          estilo: Database["public"]["Enums"]["estilo_ascensao"]
          grau_sugerido: string | null
          id: string
          notas: string | null
          usuario_id: string
          via_id: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          data: string
          estilo: Database["public"]["Enums"]["estilo_ascensao"]
          grau_sugerido?: string | null
          id?: string
          notas?: string | null
          usuario_id?: string
          via_id: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          data?: string
          estilo?: Database["public"]["Enums"]["estilo_ascensao"]
          grau_sugerido?: string | null
          id?: string
          notas?: string | null
          usuario_id?: string
          via_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ascensoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ascensoes_via_id_fkey"
            columns: ["via_id"]
            isOneToOne: false
            referencedRelation: "vias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ascensoes_via_id_fkey"
            columns: ["via_id"]
            isOneToOne: false
            referencedRelation: "vias_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          nota: number
          usuario_id: string
          via_id: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          nota: number
          usuario_id?: string
          via_id: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          nota?: number
          usuario_id?: string
          via_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_via_id_fkey"
            columns: ["via_id"]
            isOneToOne: false
            referencedRelation: "vias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_via_id_fkey"
            columns: ["via_id"]
            isOneToOne: false
            referencedRelation: "vias_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios: {
        Row: {
          area_id: string | null
          criado_em: string
          id: string
          ocultado_por: string | null
          oculto: boolean
          texto: string
          usuario_id: string
          via_id: string | null
        }
        Insert: {
          area_id?: string | null
          criado_em?: string
          id?: string
          ocultado_por?: string | null
          oculto?: boolean
          texto: string
          usuario_id?: string
          via_id?: string | null
        }
        Update: {
          area_id?: string | null
          criado_em?: string
          id?: string
          ocultado_por?: string | null
          oculto?: boolean
          texto?: string
          usuario_id?: string
          via_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vias_resumo"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "comentarios_ocultado_por_fkey"
            columns: ["ocultado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_via_id_fkey"
            columns: ["via_id"]
            isOneToOne: false
            referencedRelation: "vias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_via_id_fkey"
            columns: ["via_id"]
            isOneToOne: false
            referencedRelation: "vias_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          criado_em: string
          id: string
          usuario_id: string
          via_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          usuario_id?: string
          via_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          usuario_id?: string
          via_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_via_id_fkey"
            columns: ["via_id"]
            isOneToOne: false
            referencedRelation: "vias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_via_id_fkey"
            columns: ["via_id"]
            isOneToOne: false
            referencedRelation: "vias_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      fotos: {
        Row: {
          area_id: string | null
          caminho: string
          criado_em: string
          enviado_por: string | null
          id: string
          legenda: string | null
          oculta: boolean
          setor_id: string | null
          tipo: string
          via_id: string | null
        }
        Insert: {
          area_id?: string | null
          caminho: string
          criado_em?: string
          enviado_por?: string | null
          id?: string
          legenda?: string | null
          oculta?: boolean
          setor_id?: string | null
          tipo?: string
          via_id?: string | null
        }
        Update: {
          area_id?: string | null
          caminho?: string
          criado_em?: string
          enviado_por?: string | null
          id?: string
          legenda?: string | null
          oculta?: boolean
          setor_id?: string | null
          tipo?: string
          via_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fotos_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vias_resumo"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "fotos_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_via_id_fkey"
            columns: ["via_id"]
            isOneToOne: false
            referencedRelation: "vias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_via_id_fkey"
            columns: ["via_id"]
            isOneToOne: false
            referencedRelation: "vias_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      modelos_3d: {
        Row: {
          area_id: string | null
          atualizado_em: string
          caminho: string
          criado_em: string
          demonstrativo: boolean
          descricao: string | null
          id: string
          nome: string
          setor_id: string | null
        }
        Insert: {
          area_id?: string | null
          atualizado_em?: string
          caminho: string
          criado_em?: string
          demonstrativo?: boolean
          descricao?: string | null
          id?: string
          nome: string
          setor_id?: string | null
        }
        Update: {
          area_id?: string | null
          atualizado_em?: string
          caminho?: string
          criado_em?: string
          demonstrativo?: boolean
          descricao?: string | null
          id?: string
          nome?: string
          setor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modelos_3d_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modelos_3d_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vias_resumo"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "modelos_3d_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          atualizado_em: string
          bio: string | null
          criado_em: string
          foto_caminho: string | null
          id: string
          nome: string
          nome_usuario: string
          papel: Database["public"]["Enums"]["papel"]
        }
        Insert: {
          atualizado_em?: string
          bio?: string | null
          criado_em?: string
          foto_caminho?: string | null
          id: string
          nome: string
          nome_usuario: string
          papel?: Database["public"]["Enums"]["papel"]
        }
        Update: {
          atualizado_em?: string
          bio?: string | null
          criado_em?: string
          foto_caminho?: string | null
          id?: string
          nome?: string
          nome_usuario?: string
          papel?: Database["public"]["Enums"]["papel"]
        }
        Relationships: []
      }
      reportes: {
        Row: {
          area_id: string | null
          atualizado_em: string
          criado_em: string
          descricao: string
          id: string
          nota_admin: string | null
          resolvido_por: string | null
          setor_id: string | null
          situacao: Database["public"]["Enums"]["situacao_reporte"]
          tipo: Database["public"]["Enums"]["tipo_reporte"]
          usuario_id: string
          via_id: string | null
          vigente_ate: string | null
        }
        Insert: {
          area_id?: string | null
          atualizado_em?: string
          criado_em?: string
          descricao: string
          id?: string
          nota_admin?: string | null
          resolvido_por?: string | null
          setor_id?: string | null
          situacao?: Database["public"]["Enums"]["situacao_reporte"]
          tipo: Database["public"]["Enums"]["tipo_reporte"]
          usuario_id?: string
          via_id?: string | null
          vigente_ate?: string | null
        }
        Update: {
          area_id?: string | null
          atualizado_em?: string
          criado_em?: string
          descricao?: string
          id?: string
          nota_admin?: string | null
          resolvido_por?: string | null
          setor_id?: string | null
          situacao?: Database["public"]["Enums"]["situacao_reporte"]
          tipo?: Database["public"]["Enums"]["tipo_reporte"]
          usuario_id?: string
          via_id?: string | null
          vigente_ate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reportes_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vias_resumo"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "reportes_resolvido_por_fkey"
            columns: ["resolvido_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_via_id_fkey"
            columns: ["via_id"]
            isOneToOne: false
            referencedRelation: "vias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_via_id_fkey"
            columns: ["via_id"]
            isOneToOne: false
            referencedRelation: "vias_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      setores: {
        Row: {
          area_id: string
          atualizado_em: string
          criado_em: string
          criado_por: string | null
          descricao: string | null
          id: string
          lat: number | null
          lng: number | null
          localizacao: unknown
          moderado_em: string | null
          moderado_por: string | null
          motivo_rejeicao: string | null
          nome: string
          orientacao: string | null
          origem: Database["public"]["Enums"]["origem"]
          situacao: Database["public"]["Enums"]["situacao"]
          slug: string
          tempo_aproximacao_min: number | null
        }
        Insert: {
          area_id: string
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          localizacao?: unknown
          moderado_em?: string | null
          moderado_por?: string | null
          motivo_rejeicao?: string | null
          nome: string
          orientacao?: string | null
          origem?: Database["public"]["Enums"]["origem"]
          situacao?: Database["public"]["Enums"]["situacao"]
          slug: string
          tempo_aproximacao_min?: number | null
        }
        Update: {
          area_id?: string
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          localizacao?: unknown
          moderado_em?: string | null
          moderado_por?: string | null
          motivo_rejeicao?: string | null
          nome?: string
          orientacao?: string | null
          origem?: Database["public"]["Enums"]["origem"]
          situacao?: Database["public"]["Enums"]["situacao"]
          slug?: string
          tempo_aproximacao_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "setores_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setores_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vias_resumo"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "setores_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setores_moderado_por_fkey"
            columns: ["moderado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      trilhas_acesso: {
        Row: {
          area_id: string
          atualizado_em: string
          criado_em: string
          descricao: string | null
          desnivel_m: number | null
          distancia_m: number | null
          id: string
          nome: string
          setor_id: string | null
          tracado: unknown
        }
        Insert: {
          area_id: string
          atualizado_em?: string
          criado_em?: string
          descricao?: string | null
          desnivel_m?: number | null
          distancia_m?: number | null
          id?: string
          nome: string
          setor_id?: string | null
          tracado: unknown
        }
        Update: {
          area_id?: string
          atualizado_em?: string
          criado_em?: string
          descricao?: string | null
          desnivel_m?: number | null
          distancia_m?: number | null
          id?: string
          nome?: string
          setor_id?: string | null
          tracado?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "trilhas_acesso_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trilhas_acesso_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "vias_resumo"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "trilhas_acesso_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      vias: {
        Row: {
          altura_m: number | null
          ano_conquista: number | null
          atualizado_em: string
          conquistadores: string | null
          costuras: number | null
          criado_em: string
          criado_por: string | null
          crux: string | null
          descricao: string | null
          extensao_m: number | null
          grau: string
          grau_ordem: number
          id: string
          modalidade: Database["public"]["Enums"]["modalidade"]
          moderado_em: string | null
          moderado_por: string | null
          motivo_rejeicao: string | null
          nome: string
          origem: Database["public"]["Enums"]["origem"]
          protecao: string | null
          setor_id: string
          situacao: Database["public"]["Enums"]["situacao"]
          slug: string
        }
        Insert: {
          altura_m?: number | null
          ano_conquista?: number | null
          atualizado_em?: string
          conquistadores?: string | null
          costuras?: number | null
          criado_em?: string
          criado_por?: string | null
          crux?: string | null
          descricao?: string | null
          extensao_m?: number | null
          grau: string
          grau_ordem: number
          id?: string
          modalidade: Database["public"]["Enums"]["modalidade"]
          moderado_em?: string | null
          moderado_por?: string | null
          motivo_rejeicao?: string | null
          nome: string
          origem?: Database["public"]["Enums"]["origem"]
          protecao?: string | null
          setor_id: string
          situacao?: Database["public"]["Enums"]["situacao"]
          slug: string
        }
        Update: {
          altura_m?: number | null
          ano_conquista?: number | null
          atualizado_em?: string
          conquistadores?: string | null
          costuras?: number | null
          criado_em?: string
          criado_por?: string | null
          crux?: string | null
          descricao?: string | null
          extensao_m?: number | null
          grau?: string
          grau_ordem?: number
          id?: string
          modalidade?: Database["public"]["Enums"]["modalidade"]
          moderado_em?: string | null
          moderado_por?: string | null
          motivo_rejeicao?: string | null
          nome?: string
          origem?: Database["public"]["Enums"]["origem"]
          protecao?: string | null
          setor_id?: string
          situacao?: Database["public"]["Enums"]["situacao"]
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "vias_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vias_moderado_por_fkey"
            columns: ["moderado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vias_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vias_resumo: {
        Row: {
          altura_m: number | null
          ano_conquista: number | null
          area_estado: string | null
          area_id: string | null
          area_municipio: string | null
          area_nome: string | null
          area_slug: string | null
          atualizado_em: string | null
          conquistadores: string | null
          costuras: number | null
          criado_em: string | null
          criado_por: string | null
          crux: string | null
          descricao: string | null
          extensao_m: number | null
          grau: string | null
          grau_ordem: number | null
          id: string | null
          modalidade: Database["public"]["Enums"]["modalidade"] | null
          moderado_em: string | null
          moderado_por: string | null
          motivo_rejeicao: string | null
          nome: string | null
          nota_media: number | null
          origem: Database["public"]["Enums"]["origem"] | null
          protecao: string | null
          setor_id: string | null
          setor_nome: string | null
          setor_slug: string | null
          situacao: Database["public"]["Enums"]["situacao"] | null
          slug: string | null
          total_ascensoes: number | null
          total_avaliacoes: number | null
          total_favoritos: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vias_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vias_moderado_por_fkey"
            columns: ["moderado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vias_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      buscar: {
        Args: { termo: string }
        Returns: {
          caminho: string
          id: string
          subtitulo: string
          tipo: string
          titulo: string
        }[]
      }
      contar_favoritos: { Args: { via: string }; Returns: number }
      eh_admin: { Args: never; Returns: boolean }
      gerar_slug: { Args: { texto: string }; Returns: string }
      mapa_geojson: { Args: never; Returns: Json }
    }
    Enums: {
      estilo_ascensao:
        | "a_vista"
        | "flash"
        | "encadenada"
        | "trabalhada"
        | "top_rope"
      modalidade: "esportiva" | "tradicional" | "boulder" | "mista"
      origem: "comunidade" | "verificado" | "demonstrativo"
      papel: "usuario" | "admin"
      situacao: "pendente" | "aprovado" | "rejeitado"
      situacao_reporte: "aberto" | "confirmado" | "descartado" | "resolvido"
      tipo_reporte: "erro" | "restricao" | "interdicao"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estilo_ascensao: [
        "a_vista",
        "flash",
        "encadenada",
        "trabalhada",
        "top_rope",
      ],
      modalidade: ["esportiva", "tradicional", "boulder", "mista"],
      origem: ["comunidade", "verificado", "demonstrativo"],
      papel: ["usuario", "admin"],
      situacao: ["pendente", "aprovado", "rejeitado"],
      situacao_reporte: ["aberto", "confirmado", "descartado", "resolvido"],
      tipo_reporte: ["erro", "restricao", "interdicao"],
    },
  },
} as const
