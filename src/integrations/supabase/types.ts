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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_plan_versions: {
        Row: {
          business_plan_id: string
          content: Json | null
          created_at: string
          id: string
          summary: string | null
          user_id: string
          version_number: number | null
        }
        Insert: {
          business_plan_id: string
          content?: Json | null
          created_at?: string
          id?: string
          summary?: string | null
          user_id: string
          version_number?: number | null
        }
        Update: {
          business_plan_id?: string
          content?: Json | null
          created_at?: string
          id?: string
          summary?: string | null
          user_id?: string
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_plan_versions_business_plan_id_fkey"
            columns: ["business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      business_plans: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          plan_type: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          plan_type?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          plan_type?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          business_name: string | null
          created_at: string
          employee_count: string | null
          funding_needs: Json | null
          goals: string | null
          organization_type: string | null
          ownership_type: string | null
          province: string | null
          revenue_range: string | null
          sector: string | null
          stage: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          employee_count?: string | null
          funding_needs?: Json | null
          goals?: string | null
          organization_type?: string | null
          ownership_type?: string | null
          province?: string | null
          revenue_range?: string | null
          sector?: string | null
          stage?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          employee_count?: string | null
          funding_needs?: Json | null
          goals?: string | null
          organization_type?: string | null
          ownership_type?: string | null
          province?: string | null
          revenue_range?: string | null
          sector?: string | null
          stage?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      career_applications: {
        Row: {
          city_province: string
          community_experience: string
          cover_letter_url: string | null
          email_address: string
          full_name: string
          id: string
          indigenous_identity: string | null
          indigenous_sovereignty_meaning: string
          ip_address: string | null
          linkedin_url: string | null
          ocap_aligned_ai_interest: string
          other_links: string | null
          phone_number: string | null
          portfolio_github_url: string | null
          preferred_start_date: string | null
          preferred_work_location: string
          resume_url: string | null
          role_applying_for: string
          submitted_at: string
          work_eligibility: string
          writing_samples_url: string | null
        }
        Insert: {
          city_province: string
          community_experience: string
          cover_letter_url?: string | null
          email_address: string
          full_name: string
          id?: string
          indigenous_identity?: string | null
          indigenous_sovereignty_meaning: string
          ip_address?: string | null
          linkedin_url?: string | null
          ocap_aligned_ai_interest: string
          other_links?: string | null
          phone_number?: string | null
          portfolio_github_url?: string | null
          preferred_start_date?: string | null
          preferred_work_location: string
          resume_url?: string | null
          role_applying_for: string
          submitted_at?: string
          work_eligibility: string
          writing_samples_url?: string | null
        }
        Update: {
          city_province?: string
          community_experience?: string
          cover_letter_url?: string | null
          email_address?: string
          full_name?: string
          id?: string
          indigenous_identity?: string | null
          indigenous_sovereignty_meaning?: string
          ip_address?: string | null
          linkedin_url?: string | null
          ocap_aligned_ai_interest?: string
          other_links?: string | null
          phone_number?: string | null
          portfolio_github_url?: string | null
          preferred_start_date?: string | null
          preferred_work_location?: string
          resume_url?: string | null
          role_applying_for?: string
          submitted_at?: string
          work_eligibility?: string
          writing_samples_url?: string | null
        }
        Relationships: []
      }
      cirnac_reports: {
        Row: {
          created_at: string | null
          id: string
          report_data: Json | null
          report_type: string
          reporting_period_end: string | null
          reporting_period_start: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_data?: Json | null
          report_type: string
          reporting_period_end?: string | null
          reporting_period_start?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          report_data?: Json | null
          report_type?: string
          reporting_period_end?: string | null
          reporting_period_start?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cirnac_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          body: string
          created_at: string
          display_name: string
          id: string
          is_approved: boolean
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          display_name: string
          id?: string
          is_approved?: boolean
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          display_name?: string
          id?: string
          is_approved?: boolean
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          body: string
          category: string
          created_at: string
          display_name: string
          id: string
          is_approved: boolean
          is_pinned: boolean
          reply_count: number
          title: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          display_name: string
          id?: string
          is_approved?: boolean
          is_pinned?: boolean
          reply_count?: number
          title: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          display_name?: string
          id?: string
          is_approved?: boolean
          is_pinned?: boolean
          reply_count?: number
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: []
      }
      community_votes: {
        Row: {
          post_id: string
          user_id: string
        }
        Insert: {
          post_id: string
          user_id: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          email: string
          full_name: string
          id: string
          ip_address: string | null
          message: string
          phone: string | null
          status: string
          subject: string
          submitted_at: string
          user_agent: string | null
        }
        Insert: {
          email: string
          full_name: string
          id?: string
          ip_address?: string | null
          message: string
          phone?: string | null
          status?: string
          subject: string
          submitted_at?: string
          user_agent?: string | null
        }
        Update: {
          email?: string
          full_name?: string
          id?: string
          ip_address?: string | null
          message?: string
          phone?: string | null
          status?: string
          subject?: string
          submitted_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      data_requests: {
        Row: {
          completed_at: string | null
          description: string | null
          email: string
          full_name: string
          id: string
          ip_address: string | null
          phone: string | null
          request_type: string
          status: string
          submitted_at: string
          tracking_number: string
          user_agent: string | null
          verification_method: string | null
        }
        Insert: {
          completed_at?: string | null
          description?: string | null
          email: string
          full_name: string
          id?: string
          ip_address?: string | null
          phone?: string | null
          request_type: string
          status?: string
          submitted_at?: string
          tracking_number?: string
          user_agent?: string | null
          verification_method?: string | null
        }
        Update: {
          completed_at?: string | null
          description?: string | null
          email?: string
          full_name?: string
          id?: string
          ip_address?: string | null
          phone?: string | null
          request_type?: string
          status?: string
          submitted_at?: string
          tracking_number?: string
          user_agent?: string | null
          verification_method?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          id: string
          mime_type: string | null
          name: string
          size_bytes: number | null
          storage_path: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          mime_type?: string | null
          name: string
          size_bytes?: number | null
          storage_path: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          mime_type?: string | null
          name?: string
          size_bytes?: number | null
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      email_consent: {
        Row: {
          basis: string
          consent_ip: string | null
          consent_type: string
          consent_user_agent: string | null
          granted: boolean
          id: string
          occurred_at: string
          recipient_hash: string
          source: string
        }
        Insert: {
          basis: string
          consent_ip?: string | null
          consent_type: string
          consent_user_agent?: string | null
          granted: boolean
          id?: string
          occurred_at?: string
          recipient_hash: string
          source: string
        }
        Update: {
          basis?: string
          consent_ip?: string | null
          consent_type?: string
          consent_user_agent?: string | null
          granted?: boolean
          id?: string
          occurred_at?: string
          recipient_hash?: string
          source?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          idempotency_key: string
          recipient_hash: string
          related_grant_id: string | null
          resend_id: string | null
          sent_at: string | null
          status: string
          template_alias: string | null
          template_key: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key: string
          recipient_hash: string
          related_grant_id?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          template_alias?: string | null
          template_key: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key?: string
          recipient_hash?: string
          related_grant_id?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          template_alias?: string | null
          template_key?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_log_related_grant_id_fkey"
            columns: ["related_grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_log_related_grant_id_fkey"
            columns: ["related_grant_id"]
            isOneToOne: false
            referencedRelation: "sendable_grants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_suppressions: {
        Row: {
          created_at: string
          reason: string
          recipient_hash: string
          source: string | null
        }
        Insert: {
          created_at?: string
          reason: string
          recipient_hash: string
          source?: string | null
        }
        Update: {
          created_at?: string
          reason?: string
          recipient_hash?: string
          source?: string | null
        }
        Relationships: []
      }
      funding_applications: {
        Row: {
          created_at: string
          grant_application_id: string | null
          grant_id: string
          id: string
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          grant_application_id?: string | null
          grant_id: string
          id?: string
          stage?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          grant_application_id?: string | null
          grant_id?: string
          id?: string
          stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_applications_grant_application_id_fkey"
            columns: ["grant_application_id"]
            isOneToOne: false
            referencedRelation: "grant_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_applications_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_applications_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "sendable_grants"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_match_cache: {
        Row: {
          cached_at: string
          eligibility: string
          expires_at: string
          explanation: string
          fit_score: number
          grant_id: string
          grant_updated_at: string
          id: string
          profile_hash: string
          user_id: string
        }
        Insert: {
          cached_at?: string
          eligibility: string
          expires_at?: string
          explanation: string
          fit_score: number
          grant_id: string
          grant_updated_at: string
          id?: string
          profile_hash: string
          user_id: string
        }
        Update: {
          cached_at?: string
          eligibility?: string
          expires_at?: string
          explanation?: string
          fit_score?: number
          grant_id?: string
          grant_updated_at?: string
          id?: string
          profile_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_match_cache_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_match_cache_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "sendable_grants"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_match_runs: {
        Row: {
          cache_hits: number | null
          grant_count: number
          id: string
          llm_input_tokens: number | null
          llm_output_tokens: number | null
          run_at: string
          source: string
          user_id: string
        }
        Insert: {
          cache_hits?: number | null
          grant_count: number
          id?: string
          llm_input_tokens?: number | null
          llm_output_tokens?: number | null
          run_at?: string
          source: string
          user_id: string
        }
        Update: {
          cache_hits?: number | null
          grant_count?: number
          id?: string
          llm_input_tokens?: number | null
          llm_output_tokens?: number | null
          run_at?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      funding_readiness_items: {
        Row: {
          application_id: string
          created_at: string
          document_id: string | null
          id: string
          kind: string
          label: string
          note: string | null
          position: number
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_id?: string | null
          id?: string
          kind: string
          label: string
          note?: string | null
          position?: number
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_id?: string | null
          id?: string
          kind?: string
          label?: string
          note?: string | null
          position?: number
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_readiness_items_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "funding_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_readiness_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_saved_matches: {
        Row: {
          grant_id: string
          id: string
          notes: string | null
          saved_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          grant_id: string
          id?: string
          notes?: string | null
          saved_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          grant_id?: string
          id?: string
          notes?: string | null
          saved_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_saved_matches_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_saved_matches_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "sendable_grants"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_connections: {
        Row: {
          calendar_id: string | null
          created_at: string
          encrypted_tokens: string | null
          google_email: string | null
          scope: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_id?: string | null
          created_at?: string
          encrypted_tokens?: string | null
          google_email?: string | null
          scope?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_id?: string | null
          created_at?: string
          encrypted_tokens?: string | null
          google_email?: string | null
          scope?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grant_alerts_subscribers: {
        Row: {
          confirmation_token: string
          confirmed_at: string | null
          consent_given: boolean
          consent_ip: string | null
          consent_user_agent: string | null
          email: string
          id: string
          industries: string[]
          is_active: boolean
          last_digest_sent_at: string | null
          provinces: string[]
          subscribed_at: string
          unsubscribe_token: string
          unsubscribed_at: string | null
        }
        Insert: {
          confirmation_token?: string
          confirmed_at?: string | null
          consent_given: boolean
          consent_ip?: string | null
          consent_user_agent?: string | null
          email: string
          id?: string
          industries?: string[]
          is_active?: boolean
          last_digest_sent_at?: string | null
          provinces?: string[]
          subscribed_at?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmation_token?: string
          confirmed_at?: string | null
          consent_given?: boolean
          consent_ip?: string | null
          consent_user_agent?: string | null
          email?: string
          id?: string
          industries?: string[]
          is_active?: boolean
          last_digest_sent_at?: string | null
          provinces?: string[]
          subscribed_at?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      grant_application_versions: {
        Row: {
          content: Json | null
          created_at: string
          grant_application_id: string
          id: string
          summary: string | null
          user_id: string
          version_number: number | null
        }
        Insert: {
          content?: Json | null
          created_at?: string
          grant_application_id: string
          id?: string
          summary?: string | null
          user_id: string
          version_number?: number | null
        }
        Update: {
          content?: Json | null
          created_at?: string
          grant_application_id?: string
          id?: string
          summary?: string | null
          user_id?: string
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grant_application_versions_grant_application_id_fkey"
            columns: ["grant_application_id"]
            isOneToOne: false
            referencedRelation: "grant_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      grant_applications: {
        Row: {
          amount_requested: number | null
          application_data: Json | null
          created_at: string | null
          deadline: string | null
          funding_body: string | null
          grant_id: string | null
          grant_name: string
          id: string
          notes: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_requested?: number | null
          application_data?: Json | null
          created_at?: string | null
          deadline?: string | null
          funding_body?: string | null
          grant_id?: string | null
          grant_name: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_requested?: number | null
          application_data?: Json | null
          created_at?: string | null
          deadline?: string | null
          funding_body?: string | null
          grant_id?: string | null
          grant_name?: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grant_applications_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grant_applications_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "sendable_grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grant_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grants: {
        Row: {
          amount_currency: string
          amount_max: number | null
          amount_min: number | null
          applicant_types: string[] | null
          application_url: string
          business_stages: string[]
          created_at: string
          deadline: string | null
          description: string
          eligibility_notes: string | null
          funder: string
          funding_type: string
          id: string
          identity_criteria: string[] | null
          industries: string[]
          is_published: boolean
          is_recurring: boolean
          is_repayable: boolean | null
          last_verified: string | null
          name: string
          ownership_min_pct: number | null
          provinces: string[]
          recurrence_notes: string | null
          source_published_date: string | null
          source_url: string | null
          updated_at: string
          verification_notes: string | null
          verification_status: string
          verified_by: string | null
        }
        Insert: {
          amount_currency?: string
          amount_max?: number | null
          amount_min?: number | null
          applicant_types?: string[] | null
          application_url: string
          business_stages?: string[]
          created_at?: string
          deadline?: string | null
          description: string
          eligibility_notes?: string | null
          funder: string
          funding_type?: string
          id?: string
          identity_criteria?: string[] | null
          industries?: string[]
          is_published?: boolean
          is_recurring?: boolean
          is_repayable?: boolean | null
          last_verified?: string | null
          name: string
          ownership_min_pct?: number | null
          provinces?: string[]
          recurrence_notes?: string | null
          source_published_date?: string | null
          source_url?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_status?: string
          verified_by?: string | null
        }
        Update: {
          amount_currency?: string
          amount_max?: number | null
          amount_min?: number | null
          applicant_types?: string[] | null
          application_url?: string
          business_stages?: string[]
          created_at?: string
          deadline?: string | null
          description?: string
          eligibility_notes?: string | null
          funder?: string
          funding_type?: string
          id?: string
          identity_criteria?: string[] | null
          industries?: string[]
          is_published?: boolean
          is_recurring?: boolean
          is_repayable?: boolean | null
          last_verified?: string | null
          name?: string
          ownership_min_pct?: number | null
          provinces?: string[]
          recurrence_notes?: string | null
          source_published_date?: string | null
          source_url?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_status?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          confirmation_token: string | null
          confirmed_at: string | null
          email: string
          id: string
          ip_address: string | null
          is_active: boolean
          subscribed_at: string
          unsubscribe_token: string
          user_agent: string | null
        }
        Insert: {
          confirmation_token?: string | null
          confirmed_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          subscribed_at?: string
          unsubscribe_token?: string
          user_agent?: string | null
        }
        Update: {
          confirmation_token?: string | null
          confirmed_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          subscribed_at?: string
          unsubscribe_token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title?: string | null
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_description: string | null
          business_name: string | null
          business_stage: string | null
          business_type: string | null
          community_name: string | null
          created_at: string | null
          email: string | null
          employees: string | null
          entity_type: string | null
          full_name: string | null
          funding_purpose: string | null
          id: string
          indigenous_identity: string | null
          indigenous_ownership_pct: number | null
          industry: string | null
          location: string | null
          nation: string | null
          phone: string | null
          province: string | null
          social_links: Json
          target_funding_amount: number | null
          territory: string | null
          updated_at: string | null
          website: string | null
          year_founded: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_description?: string | null
          business_name?: string | null
          business_stage?: string | null
          business_type?: string | null
          community_name?: string | null
          created_at?: string | null
          email?: string | null
          employees?: string | null
          entity_type?: string | null
          full_name?: string | null
          funding_purpose?: string | null
          id: string
          indigenous_identity?: string | null
          indigenous_ownership_pct?: number | null
          industry?: string | null
          location?: string | null
          nation?: string | null
          phone?: string | null
          province?: string | null
          social_links?: Json
          target_funding_amount?: number | null
          territory?: string | null
          updated_at?: string | null
          website?: string | null
          year_founded?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_description?: string | null
          business_name?: string | null
          business_stage?: string | null
          business_type?: string | null
          community_name?: string | null
          created_at?: string | null
          email?: string | null
          employees?: string | null
          entity_type?: string | null
          full_name?: string | null
          funding_purpose?: string | null
          id?: string
          indigenous_identity?: string | null
          indigenous_ownership_pct?: number | null
          industry?: string | null
          location?: string | null
          nation?: string | null
          phone?: string | null
          province?: string | null
          social_links?: Json
          target_funding_amount?: number | null
          territory?: string | null
          updated_at?: string | null
          website?: string | null
          year_founded?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_name: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          description: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          related_id: string | null
          related_type: string | null
          status: string
          task_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          related_id?: string | null
          related_type?: string | null
          status?: string
          task_type?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          related_id?: string | null
          related_type?: string | null
          status?: string
          task_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          created_at: string
          email: string
          id: string
          owner_id: string
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          owner_id: string
          role?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          owner_id?: string
          role?: string
          status?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          approval_status: Database["public"]["Enums"]["testimonial_approval"]
          approved_at: string | null
          approved_by: string | null
          company: string | null
          consent_status: Database["public"]["Enums"]["testimonial_consent"]
          created_at: string
          customer_name: string
          id: string
          location: string | null
          photo_or_logo_url: string | null
          publish_status: Database["public"]["Enums"]["testimonial_publish"]
          quote: string
          role: string | null
          source: string | null
          submitted_by: string | null
          updated_at: string
          verified_metric: string | null
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["testimonial_approval"]
          approved_at?: string | null
          approved_by?: string | null
          company?: string | null
          consent_status?: Database["public"]["Enums"]["testimonial_consent"]
          created_at?: string
          customer_name: string
          id?: string
          location?: string | null
          photo_or_logo_url?: string | null
          publish_status?: Database["public"]["Enums"]["testimonial_publish"]
          quote: string
          role?: string | null
          source?: string | null
          submitted_by?: string | null
          updated_at?: string
          verified_metric?: string | null
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["testimonial_approval"]
          approved_at?: string | null
          approved_by?: string | null
          company?: string | null
          consent_status?: Database["public"]["Enums"]["testimonial_consent"]
          created_at?: string
          customer_name?: string
          id?: string
          location?: string | null
          photo_or_logo_url?: string | null
          publish_status?: Database["public"]["Enums"]["testimonial_publish"]
          quote?: string
          role?: string | null
          source?: string | null
          submitted_by?: string | null
          updated_at?: string
          verified_metric?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          language: string
          notifications: Json
          privacy: Json
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string
          unsubscribe_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          language?: string
          notifications?: Json
          privacy?: Json
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string
          unsubscribe_token?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          language?: string
          notifications?: Json
          privacy?: Json
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string
          unsubscribe_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json | null
          processed: boolean
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json | null
          processed?: boolean
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json | null
          processed?: boolean
          processed_at?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      sendable_grants: {
        Row: {
          amount_currency: string | null
          amount_max: number | null
          amount_min: number | null
          applicant_types: string[] | null
          application_url: string | null
          business_stages: string[] | null
          created_at: string | null
          deadline: string | null
          description: string | null
          eligibility_notes: string | null
          funder: string | null
          funding_type: string | null
          id: string | null
          identity_criteria: string[] | null
          industries: string[] | null
          is_published: boolean | null
          is_recurring: boolean | null
          is_repayable: boolean | null
          last_verified: string | null
          name: string | null
          ownership_min_pct: number | null
          provinces: string[] | null
          recurrence_notes: string | null
          source_published_date: string | null
          source_url: string | null
          updated_at: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_by: string | null
        }
        Insert: {
          amount_currency?: string | null
          amount_max?: number | null
          amount_min?: number | null
          applicant_types?: string[] | null
          application_url?: string | null
          business_stages?: string[] | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          eligibility_notes?: string | null
          funder?: string | null
          funding_type?: string | null
          id?: string | null
          identity_criteria?: string[] | null
          industries?: string[] | null
          is_published?: boolean | null
          is_recurring?: boolean | null
          is_repayable?: boolean | null
          last_verified?: string | null
          name?: string | null
          ownership_min_pct?: number | null
          provinces?: string[] | null
          recurrence_notes?: string | null
          source_published_date?: string | null
          source_url?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_by?: string | null
        }
        Update: {
          amount_currency?: string | null
          amount_max?: number | null
          amount_min?: number | null
          applicant_types?: string[] | null
          application_url?: string | null
          business_stages?: string[] | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          eligibility_notes?: string | null
          funder?: string | null
          funding_type?: string | null
          id?: string | null
          identity_criteria?: string[] | null
          industries?: string[] | null
          is_published?: boolean | null
          is_recurring?: boolean | null
          is_repayable?: boolean | null
          last_verified?: string | null
          name?: string | null
          ownership_min_pct?: number | null
          provinces?: string[] | null
          recurrence_notes?: string | null
          source_published_date?: string | null
          source_url?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      grant_is_sendable: {
        Args: {
          g: Database["public"]["Tables"]["grants"]["Row"]
          window_days?: number
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
    }
    Enums: {
      app_role: "admin" | "team_member" | "user"
      testimonial_approval: "pending" | "approved" | "rejected"
      testimonial_consent: "pending" | "granted" | "withdrawn"
      testimonial_publish: "draft" | "published" | "unpublished"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "team_member", "user"],
      testimonial_approval: ["pending", "approved", "rejected"],
      testimonial_consent: ["pending", "granted", "withdrawn"],
      testimonial_publish: ["draft", "published", "unpublished"],
    },
  },
} as const
