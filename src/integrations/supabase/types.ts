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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      dids: {
        Row: {
          created_at: string
          did_document: Json
          did_identifier: string
          id: string
          private_key_encrypted: string
          public_key: string
          service_endpoints: Json | null
          status: Database["public"]["Enums"]["did_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          did_document: Json
          did_identifier: string
          id?: string
          private_key_encrypted: string
          public_key: string
          service_endpoints?: Json | null
          status?: Database["public"]["Enums"]["did_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          did_document?: Json
          did_identifier?: string
          id?: string
          private_key_encrypted?: string
          public_key?: string
          service_endpoints?: Json | null
          status?: Database["public"]["Enums"]["did_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ion_operations: {
        Row: {
          block_height: number | null
          created_at: string
          did_id: string
          id: string
          operation_data: Json
          operation_type: Database["public"]["Enums"]["operation_type"]
          status: Database["public"]["Enums"]["did_status"]
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          block_height?: number | null
          created_at?: string
          did_id: string
          id?: string
          operation_data: Json
          operation_type: Database["public"]["Enums"]["operation_type"]
          status?: Database["public"]["Enums"]["did_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          block_height?: number | null
          created_at?: string
          did_id?: string
          id?: string
          operation_data?: Json
          operation_type?: Database["public"]["Enums"]["operation_type"]
          status?: Database["public"]["Enums"]["did_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ion_operations_did_id_fkey"
            columns: ["did_id"]
            isOneToOne: false
            referencedRelation: "dids"
            referencedColumns: ["id"]
          },
        ]
      }
      ipfs_pins: {
        Row: {
          content: Json
          created_at: string
          did_id: string
          gateway_url: string | null
          id: string
          ipfs_hash: string
          pin_status: string | null
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          did_id: string
          gateway_url?: string | null
          id?: string
          ipfs_hash: string
          pin_status?: string | null
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          did_id?: string
          gateway_url?: string | null
          id?: string
          ipfs_hash?: string
          pin_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipfs_pins_did_id_fkey"
            columns: ["did_id"]
            isOneToOne: false
            referencedRelation: "dids"
            referencedColumns: ["id"]
          },
        ]
      }
      issuer_applications: {
        Row: {
          created_at: string | null
          dns_verification: boolean | null
          email: string
          email_verification: boolean | null
          full_name: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          dns_verification?: boolean | null
          email: string
          email_verification?: boolean | null
          full_name?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          dns_verification?: boolean | null
          email?: string
          email_verification?: boolean | null
          full_name?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      verifiable_credentials: {
        Row: {
          created_at: string
          credential_data: Json
          credential_id: string
          credential_type: string
          expires_at: string | null
          holder_user_id: string
          id: string
          issued_at: string
          issuer_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_data: Json
          credential_id: string
          credential_type: string
          expires_at?: string | null
          holder_user_id: string
          id?: string
          issued_at?: string
          issuer_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_data?: Json
          credential_id?: string
          credential_type?: string
          expires_at?: string | null
          holder_user_id?: string
          id?: string
          issued_at?: string
          issuer_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          created_at: string
          did_id: string
          expires_at: string | null
          id: string
          result: Json | null
          status: Database["public"]["Enums"]["verification_status"]
          updated_at: string
          verification_method: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          did_id: string
          expires_at?: string | null
          id?: string
          result?: Json | null
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string
          verification_method: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          did_id?: string
          expires_at?: string | null
          id?: string
          result?: Json | null
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string
          verification_method?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verifications_did_id_fkey"
            columns: ["did_id"]
            isOneToOne: false
            referencedRelation: "dids"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      did_status: "draft" | "pending" | "anchored" | "failed"
      operation_type: "create" | "update" | "deactivate" | "recover"
      verification_status: "pending" | "verified" | "failed" | "expired"
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
      did_status: ["draft", "pending", "anchored", "failed"],
      operation_type: ["create", "update", "deactivate", "recover"],
      verification_status: ["pending", "verified", "failed", "expired"],
    },
  },
} as const
