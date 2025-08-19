export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          background_img: string | null
          theme_url: string | null
          base_roles: string[]
          agency_role: string[]
          agency_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          background_img?: string | null
          theme_url?: string | null
          base_roles?: string[]
          agency_role?: string[]
          agency_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          background_img?: string | null
          theme_url?: string | null
          base_roles?: string[]
          agency_role?: string[]
          agency_name?: string | null
          created_at?: string
          updated_at?: string
        }
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