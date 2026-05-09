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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alertas: {
        Row: {
          created_at: string
          id: string
          lido: boolean
          mensagem: string
          talhao_id: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lido?: boolean
          mensagem: string
          talhao_id?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lido?: boolean
          mensagem?: string
          talhao_id?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_talhao_id_fkey"
            columns: ["talhao_id"]
            isOneToOne: false
            referencedRelation: "talhoes"
            referencedColumns: ["id"]
          },
        ]
      }
      caderno_campo: {
        Row: {
          area_aplicada: number | null
          categoria: string
          condicao_clima: string | null
          created_at: string
          custo_total: number | null
          custo_unitario: number | null
          dados_extras: Json | null
          data: string
          descricao: string | null
          dose: string | null
          fazenda_id: string | null
          fotos_urls: string[] | null
          id: string
          observacoes: string | null
          produto: string | null
          responsavel: string | null
          talhao_id: string | null
          titulo: string
          unidade_dose: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_aplicada?: number | null
          categoria: string
          condicao_clima?: string | null
          created_at?: string
          custo_total?: number | null
          custo_unitario?: number | null
          dados_extras?: Json | null
          data: string
          descricao?: string | null
          dose?: string | null
          fazenda_id?: string | null
          fotos_urls?: string[] | null
          id?: string
          observacoes?: string | null
          produto?: string | null
          responsavel?: string | null
          talhao_id?: string | null
          titulo: string
          unidade_dose?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_aplicada?: number | null
          categoria?: string
          condicao_clima?: string | null
          created_at?: string
          custo_total?: number | null
          custo_unitario?: number | null
          dados_extras?: Json | null
          data?: string
          descricao?: string | null
          dose?: string | null
          fazenda_id?: string | null
          fotos_urls?: string[] | null
          id?: string
          observacoes?: string | null
          produto?: string | null
          responsavel?: string | null
          talhao_id?: string | null
          titulo?: string
          unidade_dose?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fazendas: {
        Row: {
          area_total: number | null
          cad: number | null
          created_at: string
          estado: string | null
          fonte_agua: string | null
          id: string
          latitude: number | null
          longitude: number | null
          municipio: string | null
          nome: string
          observacoes: string | null
          tipo_solo: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_total?: number | null
          cad?: number | null
          created_at?: string
          estado?: string | null
          fonte_agua?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          municipio?: string | null
          nome: string
          observacoes?: string | null
          tipo_solo?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_total?: number | null
          cad?: number | null
          created_at?: string
          estado?: string | null
          fonte_agua?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          municipio?: string | null
          nome?: string
          observacoes?: string | null
          tipo_solo?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      registros_diarios: {
        Row: {
          arm_final: number | null
          arm_inicial: number | null
          chuva: number | null
          created_at: string
          data: string
          diagnostico: string | null
          drenagem_profunda: number | null
          et0: number | null
          etc: number | null
          id: string
          kc: number | null
          lamina_bruta: number | null
          lamina_liquida: number | null
          perc_cad: number | null
          talhao_id: string
          taxa_aplicacao: number | null
          tempo_horas: number | null
          tib: number | null
          user_id: string
        }
        Insert: {
          arm_final?: number | null
          arm_inicial?: number | null
          chuva?: number | null
          created_at?: string
          data: string
          diagnostico?: string | null
          drenagem_profunda?: number | null
          et0?: number | null
          etc?: number | null
          id?: string
          kc?: number | null
          lamina_bruta?: number | null
          lamina_liquida?: number | null
          perc_cad?: number | null
          talhao_id: string
          taxa_aplicacao?: number | null
          tempo_horas?: number | null
          tib?: number | null
          user_id: string
        }
        Update: {
          arm_final?: number | null
          arm_inicial?: number | null
          chuva?: number | null
          created_at?: string
          data?: string
          diagnostico?: string | null
          drenagem_profunda?: number | null
          et0?: number | null
          etc?: number | null
          id?: string
          kc?: number | null
          lamina_bruta?: number | null
          lamina_liquida?: number | null
          perc_cad?: number | null
          talhao_id?: string
          taxa_aplicacao?: number | null
          tempo_horas?: number | null
          tib?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_diarios_talhao_id_fkey"
            columns: ["talhao_id"]
            isOneToOne: false
            referencedRelation: "talhoes"
            referencedColumns: ["id"]
          },
        ]
      }
      talhoes: {
        Row: {
          area: number | null
          area_calculada_ha: number | null
          arm_inicial: number | null
          centroide_lat: number | null
          centroide_lon: number | null
          coordenadas_poligono: Json | null
          created_at: string
          cultura: string | null
          data_colheita: string | null
          data_plantio: string | null
          eficiencia: number | null
          espac_emissores: number | null
          espac_linhas: number | null
          estadio_fenologico: string | null
          fazenda_id: string
          id: string
          kc_atual: number | null
          nome: string
          pressao: number | null
          tipo_sistema: string | null
          updated_at: string
          user_id: string
          vazao: number | null
        }
        Insert: {
          area?: number | null
          area_calculada_ha?: number | null
          arm_inicial?: number | null
          centroide_lat?: number | null
          centroide_lon?: number | null
          coordenadas_poligono?: Json | null
          created_at?: string
          cultura?: string | null
          data_colheita?: string | null
          data_plantio?: string | null
          eficiencia?: number | null
          espac_emissores?: number | null
          espac_linhas?: number | null
          estadio_fenologico?: string | null
          fazenda_id: string
          id?: string
          kc_atual?: number | null
          nome: string
          pressao?: number | null
          tipo_sistema?: string | null
          updated_at?: string
          user_id: string
          vazao?: number | null
        }
        Update: {
          area?: number | null
          area_calculada_ha?: number | null
          arm_inicial?: number | null
          centroide_lat?: number | null
          centroide_lon?: number | null
          coordenadas_poligono?: Json | null
          created_at?: string
          cultura?: string | null
          data_colheita?: string | null
          data_plantio?: string | null
          eficiencia?: number | null
          espac_emissores?: number | null
          espac_linhas?: number | null
          estadio_fenologico?: string | null
          fazenda_id?: string
          id?: string
          kc_atual?: number | null
          nome?: string
          pressao?: number | null
          tipo_sistema?: string | null
          updated_at?: string
          user_id?: string
          vazao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "talhoes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_perfil: {
        Row: {
          crea: string | null
          created_at: string
          email: string | null
          empresa: string | null
          id: string
          logo_url: string | null
          nome: string | null
          telefone: string | null
          unidade_area: string | null
          unidade_lamina: string | null
          unidade_volume: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          crea?: string | null
          created_at?: string
          email?: string | null
          empresa?: string | null
          id?: string
          logo_url?: string | null
          nome?: string | null
          telefone?: string | null
          unidade_area?: string | null
          unidade_lamina?: string | null
          unidade_volume?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          crea?: string | null
          created_at?: string
          email?: string | null
          empresa?: string | null
          id?: string
          logo_url?: string | null
          nome?: string | null
          telefone?: string | null
          unidade_area?: string | null
          unidade_lamina?: string | null
          unidade_volume?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
