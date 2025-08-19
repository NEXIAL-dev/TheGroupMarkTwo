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
          base_roles: string[]
          agency_roles: string[]
          agency_id: string | null
          profile_pic: string | null
          background_pic: string | null
          theme_pic: string | null
          avatar_url: string | null
          background_img: string | null
          theme_url: string | null
          agency_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          base_roles?: string[]
          agency_roles?: string[]
          agency_id?: string | null
          profile_pic?: string | null
          background_pic?: string | null
          theme_pic?: string | null
          avatar_url?: string | null
          background_img?: string | null
          theme_url?: string | null
          agency_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          base_roles?: string[]
          agency_roles?: string[]
          agency_id?: string | null
          profile_pic?: string | null
          background_pic?: string | null
          theme_pic?: string | null
          avatar_url?: string | null
          background_img?: string | null
          theme_url?: string | null
          agency_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agencies: {
        Row: {
          id: string
          name: string
          owner_id: string
          status: string
          recent_activity: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          status?: string
          recent_activity?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          status?: string
          recent_activity?: string[]
          created_at?: string
        }
      }
      agency_members: {
        Row: {
          id: string
          agency_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          user_id?: string
          joined_at?: string
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