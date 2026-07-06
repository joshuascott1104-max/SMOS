export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      actions: {
        Row: {
          cancelled_reason: string | null
          completed_date: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string
          id: string
          linked_meeting_id: string | null
          linked_opportunity_id: string | null
          linked_rep_id: string | null
          outcome: string | null
          owner_id: string
          owner_type: string
          priority: string
          replanned_reason: string | null
          status: string
          title: string
        }
        Insert: {
          cancelled_reason?: string | null
          completed_date?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date: string
          id?: string
          linked_meeting_id?: string | null
          linked_opportunity_id?: string | null
          linked_rep_id?: string | null
          outcome?: string | null
          owner_id: string
          owner_type: string
          priority?: string
          replanned_reason?: string | null
          status?: string
          title: string
        }
        Update: {
          cancelled_reason?: string | null
          completed_date?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string
          id?: string
          linked_meeting_id?: string | null
          linked_opportunity_id?: string | null
          linked_rep_id?: string | null
          outcome?: string | null
          owner_id?: string
          owner_type?: string
          priority?: string
          replanned_reason?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_linked_meeting_id_fkey"
            columns: ["linked_meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_linked_opportunity_id_fkey"
            columns: ["linked_opportunity_id"]
            isOneToOne: false
            referencedRelation: "strategic_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_linked_rep_id_fkey"
            columns: ["linked_rep_id"]
            isOneToOne: false
            referencedRelation: "reps"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_scores: {
        Row: {
          created_at: string
          crm_discipline_pct: number
          follow_up_compliance_pct: number
          gate_progression_pct: number
          id: string
          manager_id: string
          manager_notes: string | null
          month: string
          new_customers_won: number
          rep_id: string
        }
        Insert: {
          created_at?: string
          crm_discipline_pct?: number
          follow_up_compliance_pct?: number
          gate_progression_pct?: number
          id?: string
          manager_id: string
          manager_notes?: string | null
          month: string
          new_customers_won?: number
          rep_id: string
        }
        Update: {
          created_at?: string
          crm_discipline_pct?: number
          follow_up_compliance_pct?: number
          gate_progression_pct?: number
          id?: string
          manager_id?: string
          manager_notes?: string | null
          month?: string
          new_customers_won?: number
          rep_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_scores_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_scores_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "reps"
            referencedColumns: ["id"]
          },
        ]
      }
      depots: {
        Row: {
          created_at: string
          id: string
          manager_id: string | null
          name: string
          region: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_id?: string | null
          name: string
          region: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          manager_id?: string | null
          name?: string
          region?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "depots_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          confidence: string | null
          created_at: string
          depot_id: string | null
          forecast_value: number
          gap_to_target: number | null
          id: string
          manager_notes: string | null
          month: string
          rep_id: string | null
          target: number
          weighted_forecast: number
        }
        Insert: {
          confidence?: string | null
          created_at?: string
          depot_id?: string | null
          forecast_value?: number
          gap_to_target?: number | null
          id?: string
          manager_notes?: string | null
          month: string
          rep_id?: string | null
          target?: number
          weighted_forecast?: number
        }
        Update: {
          confidence?: string | null
          created_at?: string
          depot_id?: string | null
          forecast_value?: number
          gap_to_target?: number | null
          id?: string
          manager_notes?: string | null
          month?: string
          rep_id?: string | null
          target?: number
          weighted_forecast?: number
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_depot_id_fkey"
            columns: ["depot_id"]
            isOneToOne: false
            referencedRelation: "depots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forecasts_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "reps"
            referencedColumns: ["id"]
          },
        ]
      }
      kpis: {
        Row: {
          activity_score: number | null
          appointments: number
          calls: number
          conversion_rate: number | null
          created_at: string
          discovery_meetings: number
          forecast_value: number
          id: string
          manager_id: string
          manager_notes: string | null
          performance_score: number | null
          proposals_issued: number
          qualified_opportunities: number
          quotes: number
          rep_id: string
          revenue_won: number
          week_commencing: string
          wins: number
        }
        Insert: {
          activity_score?: number | null
          appointments?: number
          calls?: number
          conversion_rate?: number | null
          created_at?: string
          discovery_meetings?: number
          forecast_value?: number
          id?: string
          manager_id: string
          manager_notes?: string | null
          performance_score?: number | null
          proposals_issued?: number
          qualified_opportunities?: number
          quotes?: number
          rep_id: string
          revenue_won?: number
          week_commencing: string
          wins?: number
        }
        Update: {
          activity_score?: number | null
          appointments?: number
          calls?: number
          conversion_rate?: number | null
          created_at?: string
          discovery_meetings?: number
          forecast_value?: number
          id?: string
          manager_id?: string
          manager_notes?: string | null
          performance_score?: number | null
          proposals_issued?: number
          qualified_opportunities?: number
          quotes?: number
          rep_id?: string
          revenue_won?: number
          week_commencing?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpis_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "reps"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_notes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          meeting_id: string
          note: string
          section: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          meeting_id: string
          note: string
          section: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          meeting_id?: string
          note?: string
          section?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_notes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          depot_id: string | null
          id: string
          manager_id: string
          meeting_date: string
          meeting_type: string
          rep_id: string | null
          status: string
          summary: string | null
        }
        Insert: {
          created_at?: string
          depot_id?: string | null
          id?: string
          manager_id: string
          meeting_date: string
          meeting_type: string
          rep_id?: string | null
          status?: string
          summary?: string | null
        }
        Update: {
          created_at?: string
          depot_id?: string | null
          id?: string
          manager_id?: string
          meeting_date?: string
          meeting_type?: string
          rep_id?: string | null
          status?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_depot_id_fkey"
            columns: ["depot_id"]
            isOneToOne: false
            referencedRelation: "depots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "reps"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          objective: string
          progress_notes: string | null
          rep_id: string
          review_id: string | null
          status: string
          success_measure: string | null
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          objective: string
          progress_notes?: string | null
          rep_id: string
          review_id?: string | null
          status?: string
          success_measure?: string | null
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          objective?: string
          progress_notes?: string | null
          rep_id?: string
          review_id?: string | null
          status?: string
          success_measure?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objectives_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "reps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "one_to_one_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      one_to_one_reviews: {
        Row: {
          commercial_score_id: string | null
          created_at: string
          development_areas: string | null
          id: string
          manager_feedback: string | null
          manager_id: string
          next_review_date: string | null
          overall_rating: number | null
          performance_summary: string | null
          period_covered: string | null
          recognition_achieved: string | null
          rep_feedback: string | null
          rep_id: string
          review_date: string
          strengths: string | null
          support_required: string | null
        }
        Insert: {
          commercial_score_id?: string | null
          created_at?: string
          development_areas?: string | null
          id?: string
          manager_feedback?: string | null
          manager_id: string
          next_review_date?: string | null
          overall_rating?: number | null
          performance_summary?: string | null
          period_covered?: string | null
          recognition_achieved?: string | null
          rep_feedback?: string | null
          rep_id: string
          review_date: string
          strengths?: string | null
          support_required?: string | null
        }
        Update: {
          commercial_score_id?: string | null
          created_at?: string
          development_areas?: string | null
          id?: string
          manager_feedback?: string | null
          manager_id?: string
          next_review_date?: string | null
          overall_rating?: number | null
          performance_summary?: string | null
          period_covered?: string | null
          recognition_achieved?: string | null
          rep_feedback?: string | null
          rep_id?: string
          review_date?: string
          strengths?: string | null
          support_required?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "one_to_one_reviews_commercial_score_id_fkey"
            columns: ["commercial_score_id"]
            isOneToOne: false
            referencedRelation: "commercial_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "one_to_one_reviews_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "one_to_one_reviews_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "reps"
            referencedColumns: ["id"]
          },
        ]
      }
      reps: {
        Row: {
          created_at: string
          depot_id: string
          full_name: string
          id: string
          manager_id: string
          monthly_target: number
          new_customer_target: number
          notes: string | null
          start_date: string | null
          status: string
        }
        Insert: {
          created_at?: string
          depot_id: string
          full_name: string
          id?: string
          manager_id: string
          monthly_target?: number
          new_customer_target?: number
          notes?: string | null
          start_date?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          depot_id?: string
          full_name?: string
          id?: string
          manager_id?: string
          monthly_target?: number
          new_customer_target?: number
          notes?: string | null
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reps_depot_id_fkey"
            columns: ["depot_id"]
            isOneToOne: false
            referencedRelation: "depots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reps_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_opportunities: {
        Row: {
          company_name: string
          created_at: string
          depot_id: string
          estimated_monthly_revenue: number
          expected_close_month: string | null
          id: string
          last_reviewed: string | null
          manager_notes: string | null
          next_action: string | null
          probability: number
          rep_id: string
          stage: string
          status: string
          submission_id: string | null
          support_reason: string | null
          support_required: boolean
          weighted_value: number | null
        }
        Insert: {
          company_name: string
          created_at?: string
          depot_id: string
          estimated_monthly_revenue?: number
          expected_close_month?: string | null
          id?: string
          last_reviewed?: string | null
          manager_notes?: string | null
          next_action?: string | null
          probability?: number
          rep_id: string
          stage?: string
          status?: string
          submission_id?: string | null
          support_reason?: string | null
          support_required?: boolean
          weighted_value?: number | null
        }
        Update: {
          company_name?: string
          created_at?: string
          depot_id?: string
          estimated_monthly_revenue?: number
          expected_close_month?: string | null
          id?: string
          last_reviewed?: string | null
          manager_notes?: string | null
          next_action?: string | null
          probability?: number
          rep_id?: string
          stage?: string
          status?: string
          submission_id?: string | null
          support_reason?: string | null
          support_required?: boolean
          weighted_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "strategic_opportunities_depot_id_fkey"
            columns: ["depot_id"]
            isOneToOne: false
            referencedRelation: "depots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_opportunities_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "reps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_opportunities_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "weekly_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          depot_id: string | null
          email: string
          full_name: string
          id: string
          last_login: string | null
          manager_id: string | null
          role: string
          status: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          depot_id?: string | null
          email: string
          full_name: string
          id?: string
          last_login?: string | null
          manager_id?: string | null
          role: string
          status?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          depot_id?: string | null
          email?: string
          full_name?: string
          id?: string
          last_login?: string | null
          manager_id?: string | null
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_depot_id_fkey"
            columns: ["depot_id"]
            isOneToOne: false
            referencedRelation: "depots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_submissions: {
        Row: {
          biggest_challenge: string | null
          biggest_win: string | null
          created_at: string
          id: string
          manager_id: string
          manager_notes: string | null
          manager_reviewed: boolean
          rep_id: string
          submitted_date: string | null
          support_needed: string | null
          week_commencing: string
        }
        Insert: {
          biggest_challenge?: string | null
          biggest_win?: string | null
          created_at?: string
          id?: string
          manager_id: string
          manager_notes?: string | null
          manager_reviewed?: boolean
          rep_id: string
          submitted_date?: string | null
          support_needed?: string | null
          week_commencing: string
        }
        Update: {
          biggest_challenge?: string | null
          biggest_win?: string | null
          created_at?: string
          id?: string
          manager_id?: string
          manager_notes?: string | null
          manager_reviewed?: boolean
          rep_id?: string
          submitted_date?: string | null
          support_needed?: string | null
          week_commencing?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_submissions_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_submissions_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "reps"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_user: {
        Args: {
          p_depot_id?: string
          p_email: string
          p_full_name: string
          p_manager_id?: string
          p_password: string
          p_role: string
        }
        Returns: {
          auth_user_id: string | null
          created_at: string
          depot_id: string | null
          email: string
          full_name: string
          id: string
          last_login: string | null
          manager_id: string | null
          role: string
          status: string
        }
      }
      admin_set_user_password: {
        Args: {
          p_new_password: string
          p_user_id: string
        }
        Returns: undefined
      }
      is_active_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
