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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_usage_events: {
        Row: {
          analysis_id: string | null
          completion_tokens: number
          created_at: string
          credits_estimated: number
          document_id: string | null
          file_extension: string | null
          file_name: string | null
          file_size_bytes: number | null
          id: string
          model: string
          note: string | null
          ocr_used: boolean
          operation: string
          pages_estimated: number
          prompt_tokens: number
          total_tokens: number
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          completion_tokens?: number
          created_at?: string
          credits_estimated?: number
          document_id?: string | null
          file_extension?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          model?: string
          note?: string | null
          ocr_used?: boolean
          operation?: string
          pages_estimated?: number
          prompt_tokens?: number
          total_tokens?: number
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          completion_tokens?: number
          created_at?: string
          credits_estimated?: number
          document_id?: string | null
          file_extension?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          model?: string
          note?: string | null
          ocr_used?: boolean
          operation?: string
          pages_estimated?: number
          prompt_tokens?: number
          total_tokens?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_events_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_events_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      analyses: {
        Row: {
          closed_at: string | null
          created_at: string
          created_by: string
          id: string
          objective: string
          responsible_user_id: string | null
          status: Database["public"]["Enums"]["analysis_status"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          objective?: string
          responsible_user_id?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          objective?: string
          responsible_user_id?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      comparisons: {
        Row: {
          analysis_id: string
          classification:
            | Database["public"]["Enums"]["result_classification"]
            | null
          comparison_type: Database["public"]["Enums"]["comparison_type"]
          created_at: string
          created_by: string
          document_a_id: string | null
          document_b_id: string | null
          id: string
          metrics: Json
          status: Database["public"]["Enums"]["comparison_status"]
          summary: string | null
          tolerances: Json
          updated_at: string
        }
        Insert: {
          analysis_id: string
          classification?:
            | Database["public"]["Enums"]["result_classification"]
            | null
          comparison_type?: Database["public"]["Enums"]["comparison_type"]
          created_at?: string
          created_by: string
          document_a_id?: string | null
          document_b_id?: string | null
          id?: string
          metrics?: Json
          status?: Database["public"]["Enums"]["comparison_status"]
          summary?: string | null
          tolerances?: Json
          updated_at?: string
        }
        Update: {
          analysis_id?: string
          classification?:
            | Database["public"]["Enums"]["result_classification"]
            | null
          comparison_type?: Database["public"]["Enums"]["comparison_type"]
          created_at?: string
          created_by?: string
          document_a_id?: string | null
          document_b_id?: string | null
          id?: string
          metrics?: Json
          status?: Database["public"]["Enums"]["comparison_status"]
          summary?: string | null
          tolerances?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparisons_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparisons_document_a_id_fkey"
            columns: ["document_a_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparisons_document_b_id_fkey"
            columns: ["document_b_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          analysis_id: string
          created_at: string
          created_by: string
          document_category: Database["public"]["Enums"]["document_category"]
          error_message: string | null
          extracted_text: string | null
          file_extension: string | null
          file_name: string | null
          file_size_bytes: number | null
          id: string
          language_code: string
          mime_type: string | null
          original_text: string | null
          source_type: Database["public"]["Enums"]["document_source_type"]
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          analysis_id: string
          created_at?: string
          created_by: string
          document_category?: Database["public"]["Enums"]["document_category"]
          error_message?: string | null
          extracted_text?: string | null
          file_extension?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          language_code?: string
          mime_type?: string | null
          original_text?: string | null
          source_type?: Database["public"]["Enums"]["document_source_type"]
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          analysis_id?: string
          created_at?: string
          created_by?: string
          document_category?: Database["public"]["Enums"]["document_category"]
          error_message?: string | null
          extracted_text?: string | null
          file_extension?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          language_code?: string
          mime_type?: string | null
          original_text?: string | null
          source_type?: Database["public"]["Enums"]["document_source_type"]
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      findings: {
        Row: {
          analysis_id: string
          code: string
          comparison_id: string
          created_at: string
          description: string
          evidence: Json
          id: string
          reviewed: boolean
          reviewer_note: string | null
          severity: Database["public"]["Enums"]["finding_severity"]
          title: string
        }
        Insert: {
          analysis_id: string
          code: string
          comparison_id: string
          created_at?: string
          description?: string
          evidence?: Json
          id?: string
          reviewed?: boolean
          reviewer_note?: string | null
          severity?: Database["public"]["Enums"]["finding_severity"]
          title: string
        }
        Update: {
          analysis_id?: string
          code?: string
          comparison_id?: string
          created_at?: string
          description?: string
          evidence?: Json
          id?: string
          reviewed?: boolean
          reviewer_note?: string | null
          severity?: Database["public"]["Enums"]["finding_severity"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "findings_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "comparisons"
            referencedColumns: ["id"]
          },
        ]
      }
      norm_chunks: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          norm_id: string
          seq: number
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          norm_id: string
          seq: number
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          norm_id?: string
          seq?: number
        }
        Relationships: [
          {
            foreignKeyName: "norm_chunks_norm_id_fkey"
            columns: ["norm_id"]
            isOneToOne: false
            referencedRelation: "norms"
            referencedColumns: ["id"]
          },
        ]
      }
      norms: {
        Row: {
          chunk_count: number
          created_at: string
          created_by: string
          effective_from: string | null
          effective_to: string | null
          embedding_model: string
          ementa: string
          full_text: string
          hierarchy: number
          id: string
          issuer: string
          jurisdiction: string
          norm_type: Database["public"]["Enums"]["norm_type"]
          number: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["norm_status"]
          tags: string[]
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          chunk_count?: number
          created_at?: string
          created_by: string
          effective_from?: string | null
          effective_to?: string | null
          embedding_model?: string
          ementa?: string
          full_text?: string
          hierarchy?: number
          id?: string
          issuer?: string
          jurisdiction?: string
          norm_type?: Database["public"]["Enums"]["norm_type"]
          number?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["norm_status"]
          tags?: string[]
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          chunk_count?: number
          created_at?: string
          created_by?: string
          effective_from?: string | null
          effective_to?: string | null
          embedding_model?: string
          ementa?: string
          full_text?: string
          hierarchy?: number
          id?: string
          issuer?: string
          jurisdiction?: string
          norm_type?: Database["public"]["Enums"]["norm_type"]
          number?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["norm_status"]
          tags?: string[]
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      parcels: {
        Row: {
          altitude_max_m: number | null
          altitude_mean_m: number | null
          altitude_min_m: number | null
          analysis_id: string
          area_m2: number | null
          computed_perimeter_m: number | null
          confrontantes: string[]
          created_at: string
          declared_perimeter_m: number | null
          document_id: string
          id: string
          label: string | null
          raw_extraction: Json
          vertex_count: number
        }
        Insert: {
          altitude_max_m?: number | null
          altitude_mean_m?: number | null
          altitude_min_m?: number | null
          analysis_id: string
          area_m2?: number | null
          computed_perimeter_m?: number | null
          confrontantes?: string[]
          created_at?: string
          declared_perimeter_m?: number | null
          document_id: string
          id?: string
          label?: string | null
          raw_extraction?: Json
          vertex_count?: number
        }
        Update: {
          altitude_max_m?: number | null
          altitude_mean_m?: number | null
          altitude_min_m?: number | null
          analysis_id?: string
          area_m2?: number | null
          computed_perimeter_m?: number | null
          confrontantes?: string[]
          created_at?: string
          declared_perimeter_m?: number | null
          document_id?: string
          id?: string
          label?: string | null
          raw_extraction?: Json
          vertex_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcels_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      segments: {
        Row: {
          altitude_from_m: number | null
          altitude_to_m: number | null
          analysis_id: string
          azimuth_deg: number | null
          bearing_text: string | null
          confrontante: string | null
          created_at: string
          distance_m: number | null
          from_vertex: string | null
          id: string
          parcel_id: string
          raw_text: string | null
          seq: number
          to_vertex: string | null
        }
        Insert: {
          altitude_from_m?: number | null
          altitude_to_m?: number | null
          analysis_id: string
          azimuth_deg?: number | null
          bearing_text?: string | null
          confrontante?: string | null
          created_at?: string
          distance_m?: number | null
          from_vertex?: string | null
          id?: string
          parcel_id: string
          raw_text?: string | null
          seq: number
          to_vertex?: string | null
        }
        Update: {
          altitude_from_m?: number | null
          altitude_to_m?: number | null
          analysis_id?: string
          azimuth_deg?: number | null
          bearing_text?: string | null
          confrontante?: string | null
          created_at?: string
          distance_m?: number | null
          from_vertex?: string | null
          id?: string
          parcel_id?: string
          raw_text?: string | null
          seq?: number
          to_vertex?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "segments_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "segments_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar_normas_semantico: {
        Args: {
          filtro_status?: Database["public"]["Enums"]["norm_status"]
          match_count?: number
          query_embedding: string
        }
        Returns: {
          chunk_id: string
          content: string
          effective_from: string
          effective_to: string
          ementa: string
          issuer: string
          norm_id: string
          norm_type: Database["public"]["Enums"]["norm_type"]
          number: string
          seq: number
          similarity: number
          source_url: string
          status: Database["public"]["Enums"]["norm_status"]
          title: string
          year: number
        }[]
      }
      can_access_analysis: {
        Args: { _analysis_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      analysis_status:
        | "draft"
        | "processing"
        | "ready"
        | "review_pending"
        | "completed"
        | "archived"
        | "error"
      app_role: "admin" | "official" | "operator" | "reviewer" | "read_only"
      comparison_status:
        | "pending"
        | "running"
        | "completed"
        | "failed"
        | "review_pending"
      comparison_type:
        | "memorial_to_memorial"
        | "boundary_to_boundary"
        | "memorial_to_registry"
        | "custom"
      document_category:
        | "memorial"
        | "matricula"
        | "escritura"
        | "planta"
        | "norma"
        | "tabela_tecnica"
        | "imagem_tecnica"
        | "documento_complementar"
        | "nao_classificado"
      document_source_type: "upload" | "pasted_text" | "imported"
      document_status: "uploaded" | "parsed" | "failed" | "archived"
      finding_severity: "critical" | "moderate" | "informative" | "inconclusive"
      norm_status: "vigente" | "revogada" | "suspensa" | "em_consulta"
      norm_type:
        | "lei"
        | "decreto"
        | "provimento"
        | "resolucao"
        | "normas_servico"
        | "parecer"
        | "decisao_administrativa"
        | "sumula"
        | "enunciado"
        | "outro"
      result_classification:
        | "compatible"
        | "compatible_with_remarks"
        | "incompatible"
        | "inconclusive"
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
    Enums: {
      analysis_status: [
        "draft",
        "processing",
        "ready",
        "review_pending",
        "completed",
        "archived",
        "error",
      ],
      app_role: ["admin", "official", "operator", "reviewer", "read_only"],
      comparison_status: [
        "pending",
        "running",
        "completed",
        "failed",
        "review_pending",
      ],
      comparison_type: [
        "memorial_to_memorial",
        "boundary_to_boundary",
        "memorial_to_registry",
        "custom",
      ],
      document_category: [
        "memorial",
        "matricula",
        "escritura",
        "planta",
        "norma",
        "tabela_tecnica",
        "imagem_tecnica",
        "documento_complementar",
        "nao_classificado",
      ],
      document_source_type: ["upload", "pasted_text", "imported"],
      document_status: ["uploaded", "parsed", "failed", "archived"],
      finding_severity: ["critical", "moderate", "informative", "inconclusive"],
      norm_status: ["vigente", "revogada", "suspensa", "em_consulta"],
      norm_type: [
        "lei",
        "decreto",
        "provimento",
        "resolucao",
        "normas_servico",
        "parecer",
        "decisao_administrativa",
        "sumula",
        "enunciado",
        "outro",
      ],
      result_classification: [
        "compatible",
        "compatible_with_remarks",
        "incompatible",
        "inconclusive",
      ],
    },
  },
} as const
