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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ghost_members: {
        Row: {
          avatar_color: string
          codename: string
          id: string
          is_online: boolean
          joined_at: string
          last_seen: string | null
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          avatar_color?: string
          codename: string
          id?: string
          is_online?: boolean
          joined_at?: string
          last_seen?: string | null
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          avatar_color?: string
          codename?: string
          id?: string
          is_online?: boolean
          joined_at?: string
          last_seen?: string | null
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ghost_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "ghost_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      ghost_messages: {
        Row: {
          content: string | null
          created_at: string
          encrypted_content: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_deleted: boolean
          message_type: string
          metadata: Json | null
          reactions: Json | null
          reply_to: string | null
          room_id: string
          self_destruct_at: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          encrypted_content?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean
          message_type?: string
          metadata?: Json | null
          reactions?: Json | null
          reply_to?: string | null
          room_id: string
          self_destruct_at?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          encrypted_content?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean
          message_type?: string
          metadata?: Json | null
          reactions?: Json | null
          reply_to?: string | null
          room_id?: string
          self_destruct_at?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ghost_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "ghost_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghost_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "ghost_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      ghost_read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ghost_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ghost_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      ghost_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          invite_code: string
          is_active: boolean
          max_members: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          invite_code?: string
          is_active?: boolean
          max_members?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          invite_code?: string
          is_active?: boolean
          max_members?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ghost_typing: {
        Row: {
          id: string
          is_typing: boolean
          room_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_typing?: boolean
          room_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_typing?: boolean
          room_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ghost_typing_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "ghost_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_logs: {
        Row: {
          asn: string | null
          browser: string | null
          browser_version: string | null
          city: string | null
          color_depth: number | null
          connection_type: string | null
          cookies_enabled: boolean | null
          country: string | null
          country_code: string | null
          device_memory: number | null
          device_type: string | null
          do_not_track: string | null
          fingerprint: string | null
          hardware_concurrency: number | null
          id: string
          ip_address: string | null
          is_bot: boolean | null
          is_mobile: boolean | null
          isp: string | null
          language: string | null
          languages: string[] | null
          os: string | null
          os_version: string | null
          page_url: string | null
          pixel_ratio: number | null
          raw_headers: Json | null
          referrer: string | null
          region: string | null
          screen_height: number | null
          screen_width: number | null
          timezone: string | null
          timezone_offset: number | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          viewport_height: number | null
          viewport_width: number | null
          visited_at: string
        }
        Insert: {
          asn?: string | null
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          color_depth?: number | null
          connection_type?: string | null
          cookies_enabled?: boolean | null
          country?: string | null
          country_code?: string | null
          device_memory?: number | null
          device_type?: string | null
          do_not_track?: string | null
          fingerprint?: string | null
          hardware_concurrency?: number | null
          id?: string
          ip_address?: string | null
          is_bot?: boolean | null
          is_mobile?: boolean | null
          isp?: string | null
          language?: string | null
          languages?: string[] | null
          os?: string | null
          os_version?: string | null
          page_url?: string | null
          pixel_ratio?: number | null
          raw_headers?: Json | null
          referrer?: string | null
          region?: string | null
          screen_height?: number | null
          screen_width?: number | null
          timezone?: string | null
          timezone_offset?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
          visited_at?: string
        }
        Update: {
          asn?: string | null
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          color_depth?: number | null
          connection_type?: string | null
          cookies_enabled?: boolean | null
          country?: string | null
          country_code?: string | null
          device_memory?: number | null
          device_type?: string | null
          do_not_track?: string | null
          fingerprint?: string | null
          hardware_concurrency?: number | null
          id?: string
          ip_address?: string | null
          is_bot?: boolean | null
          is_mobile?: boolean | null
          isp?: string | null
          language?: string | null
          languages?: string[] | null
          os?: string | null
          os_version?: string | null
          page_url?: string | null
          pixel_ratio?: number | null
          raw_headers?: Json | null
          referrer?: string | null
          region?: string | null
          screen_height?: number | null
          screen_width?: number | null
          timezone?: string | null
          timezone_offset?: number | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
          visited_at?: string
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
