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
      admin_access_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
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
      bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string
          parent_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id: string
          parent_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string
          parent_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
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
      forum_posts: {
        Row: {
          content: string
          content_html: string | null
          created_at: string
          forum_id: string
          id: string
          is_pinned: boolean | null
          last_activity_at: string | null
          title: string
          trending_score: number | null
          updated_at: string
          user_id: string
          view_count: number | null
          views: number
        }
        Insert: {
          content: string
          content_html?: string | null
          created_at?: string
          forum_id: string
          id?: string
          is_pinned?: boolean | null
          last_activity_at?: string | null
          title: string
          trending_score?: number | null
          updated_at?: string
          user_id: string
          view_count?: number | null
          views?: number
        }
        Update: {
          content?: string
          content_html?: string | null
          created_at?: string
          forum_id?: string
          id?: string
          is_pinned?: boolean | null
          last_activity_at?: string | null
          title?: string
          trending_score?: number | null
          updated_at?: string
          user_id?: string
          view_count?: number | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forums: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
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
      moderation_actions: {
        Row: {
          action_type: string
          created_at: string
          duration_days: number | null
          expires_at: string | null
          id: string
          moderator_id: string
          notes: string | null
          reason: string
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          created_at?: string
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          moderator_id: string
          notes?: string | null
          reason: string
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          created_at?: string
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          moderator_id?: string
          notes?: string | null
          reason?: string
          target_id?: string
          target_type?: string
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
      post_media: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          media_type: string
          media_url: string
          post_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          media_type: string
          media_url: string
          post_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          media_type?: string
          media_url?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_recommendations: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          reason: string | null
          recommendation_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          reason?: string | null
          recommendation_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          reason?: string | null
          recommendation_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_recommendations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          created_at: string
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      post_view_history: {
        Row: {
          id: string
          post_id: string
          session_id: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_view_history_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_view_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          profile_visibility: string | null
          suspended: boolean | null
          suspended_until: string | null
          suspension_reason: string | null
          updated_at: string | null
          username: string
          warnings_count: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          is_public?: boolean | null
          profile_visibility?: string | null
          suspended?: boolean | null
          suspended_until?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
          username: string
          warnings_count?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          profile_visibility?: string | null
          suspended?: boolean | null
          suspended_until?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
          username?: string
          warnings_count?: number | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          parent_type: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          parent_type: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          parent_type?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_id: string
          reported_type: string
          reporter_id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_id: string
          reported_type: string
          reporter_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reported_type?: string
          reporter_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
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
      user_goals: {
        Row: {
          category: string | null
          completed: boolean
          created_at: string | null
          current_value: number
          goal_type: string
          id: string
          period_end: string
          period_start: string
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          completed?: boolean
          created_at?: string | null
          current_value?: number
          goal_type: string
          id?: string
          period_end: string
          period_start: string
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          completed?: boolean
          created_at?: string | null
          current_value?: number
          goal_type?: string
          id?: string
          period_end?: string
          period_start?: string
          target_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string | null
          id: string
          interest_score: number | null
          last_interaction_at: string | null
          tag_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest_score?: number | null
          last_interaction_at?: string | null
          tag_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interest_score?: number | null
          last_interaction_at?: string | null
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      assign_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      award_early_adopter_badge: { Args: never; Returns: undefined }
      award_event_badge: {
        Args: { p_event_icon: string; p_event_name: string; p_user_id: string }
        Returns: undefined
      }
      calculate_trending_score: { Args: { p_post_id: string }; Returns: number }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      get_admin_stats: { Args: never; Returns: Json }
      get_content_stats: { Args: { days?: number }; Returns: Json }
      get_recommended_posts: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          content: string
          created_at: string
          forum_id: string
          id: string
          recommendation_reason: string
          title: string
          user_id: string
          views: number
        }[]
      }
      get_trending_posts: {
        Args: { p_forum_id?: string; p_limit?: number }
        Returns: {
          comment_count: number
          content: string
          created_at: string
          forum_id: string
          id: string
          reaction_count: number
          title: string
          trending_score: number
          user_id: string
          views: number
        }[]
      }
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
      increment_post_views: { Args: { post_id: string }; Returns: undefined }
      revoke_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      search_forum_posts: {
        Args: {
          forum_filter?: string
          search_query: string
          tag_filter?: string
        }
        Returns: {
          avatar_url: string
          comment_count: number
          content: string
          content_html: string
          created_at: string
          forum_id: string
          id: string
          is_pinned: boolean
          relevance: number
          title: string
          user_id: string
          username: string
          views: number
        }[]
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
      suspend_user: {
        Args: {
          p_duration_days?: number
          p_moderator_id?: string
          p_reason: string
          p_user_id: string
        }
        Returns: undefined
      }
      unsuspend_user: {
        Args: { p_moderator_id?: string; p_user_id: string }
        Returns: undefined
      }
      update_trending_scores: { Args: never; Returns: undefined }
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
