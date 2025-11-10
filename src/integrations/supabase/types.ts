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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_rate_limits: {
        Row: {
          called_at: string
          created_at: string
          function_name: string
          id: string
          user_id: string
        }
        Insert: {
          called_at?: string
          created_at?: string
          function_name: string
          id?: string
          user_id: string
        }
        Update: {
          called_at?: string
          created_at?: string
          function_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          language: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      climate_actions: {
        Row: {
          category: Database["public"]["Enums"]["action_category"]
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          latitude: number | null
          longitude: number | null
          photo_url: string | null
          points_awarded: number | null
          story: string | null
          updated_at: string | null
          user_id: string
          voice_note_url: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["action_category"]
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          latitude?: number | null
          longitude?: number | null
          photo_url?: string | null
          points_awarded?: number | null
          story?: string | null
          updated_at?: string | null
          user_id: string
          voice_note_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["action_category"]
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          latitude?: number | null
          longitude?: number | null
          photo_url?: string | null
          points_awarded?: number | null
          story?: string | null
          updated_at?: string | null
          user_id?: string
          voice_note_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "climate_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          active_date: string
          category: string
          created_at: string
          description: string
          difficulty: string
          expires_at: string
          id: string
          points_reward: number
          title: string
        }
        Insert: {
          active_date?: string
          category: string
          created_at?: string
          description: string
          difficulty: string
          expires_at: string
          id?: string
          points_reward?: number
          title: string
        }
        Update: {
          active_date?: string
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          expires_at?: string
          id?: string
          points_reward?: number
          title?: string
        }
        Relationships: []
      }
      feedback_forms: {
        Row: {
          category: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      involvement_forms: {
        Row: {
          availability: string | null
          country: string | null
          created_at: string | null
          email: string
          experience: string | null
          full_name: string
          id: string
          motivation: string | null
          organization: string | null
          portfolio_url: string | null
          role_type: string
          skills: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          availability?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          experience?: string | null
          full_name: string
          id?: string
          motivation?: string | null
          organization?: string | null
          portfolio_url?: string | null
          role_type: string
          skills?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          availability?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          motivation?: string | null
          organization?: string | null
          portfolio_url?: string | null
          role_type?: string
          skills?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lesson_suggestions: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          profile_visibility: string | null
          suspended: boolean | null
          suspension_reason: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          is_public?: boolean | null
          profile_visibility?: string | null
          suspended?: boolean | null
          suspension_reason?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          profile_visibility?: string | null
          suspended?: boolean | null
          suspension_reason?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean
          max_members: number
          name: string
          total_points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean
          max_members?: number
          name: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean
          max_members?: number
          name?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_icon: string | null
          achievement_name: string
          achievement_type: string
          earned_at: string | null
          id: string
          points_awarded: number | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_icon?: string | null
          achievement_name: string
          achievement_type: string
          earned_at?: string | null
          id?: string
          points_awarded?: number | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_icon?: string | null
          achievement_name?: string
          achievement_type?: string
          earned_at?: string | null
          id?: string
          points_awarded?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_completions: {
        Row: {
          challenge_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string | null
          current_streak: number | null
          last_action_date: string | null
          longest_streak: number | null
          total_actions: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          last_action_date?: string | null
          longest_streak?: number | null
          total_actions?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          last_action_date?: string | null
          longest_streak?: number | null
          total_actions?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      anonymize_coordinates: {
        Args: { lat: number; lon: number }
        Returns: Json
      }
      award_early_adopter_badge: { Args: never; Returns: undefined }
      award_event_badge: {
        Args: { p_event_icon: string; p_event_name: string; p_user_id: string }
        Returns: undefined
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      send_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      action_category:
        | "tree_planting"
        | "water_saving"
        | "energy_conservation"
        | "teaching"
        | "recycling"
        | "transportation"
        | "other"
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "co_admin"
        | "educator"
        | "translator"
        | "developer"
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
      action_category: [
        "tree_planting",
        "water_saving",
        "energy_conservation",
        "teaching",
        "recycling",
        "transportation",
        "other",
      ],
      app_role: [
        "admin",
        "moderator",
        "user",
        "co_admin",
        "educator",
        "translator",
        "developer",
      ],
    },
  },
} as const
