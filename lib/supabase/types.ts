// TypeScript types generated from Supabase schema
// These types ensure type safety for all database operations

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
      availability_cache: {
        Row: {
          id: string
          hotel_id: string
          room_type_id: string
          date: string
          total_rooms: number
          booked_rooms: number
          blocked_rooms: number
          held_rooms: number
          available_rooms: number
          last_updated: string
        }
        Insert: {
          id?: string
          hotel_id: string
          room_type_id: string
          date: string
          total_rooms: number
          booked_rooms?: number
          blocked_rooms?: number
          held_rooms?: number
          last_updated?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          room_type_id?: string
          date?: string
          total_rooms?: number
          booked_rooms?: number
          blocked_rooms?: number
          held_rooms?: number
          last_updated?: string
        }
      }
      booking_holds: {
        Row: {
          id: string
          session_id: string
          hotel_id: string
          room_type_id: string
          check_in_date: string
          check_out_date: string
          room_count: number
          expires_at: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          hotel_id: string
          room_type_id: string
          check_in_date: string
          check_out_date: string
          room_count?: number
          expires_at: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          hotel_id?: string
          room_type_id?: string
          check_in_date?: string
          check_out_date?: string
          room_count?: number
          expires_at?: string
          status?: string
          created_at?: string
        }
      }
      booking_metrics: {
        Row: {
          id: string
          hotel_id: string
          date: string
          total_bookings: number
          total_revenue: number
          total_rooms_sold: number
          average_daily_rate: number
          occupancy_rate: number
          rev_par: number
          cancellation_count: number
          no_show_count: number
          average_lead_time: number
          average_length_of_stay: number
          booking_source_breakdown: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          date: string
          total_bookings?: number
          total_revenue?: number
          total_rooms_sold?: number
          average_daily_rate?: number
          occupancy_rate?: number
          rev_par?: number
          cancellation_count?: number
          no_show_count?: number
          average_lead_time?: number
          average_length_of_stay?: number
          booking_source_breakdown?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          date?: string
          total_bookings?: number
          total_revenue?: number
          total_rooms_sold?: number
          average_daily_rate?: number
          occupancy_rate?: number
          rev_par?: number
          cancellation_count?: number
          no_show_count?: number
          average_lead_time?: number
          average_length_of_stay?: number
          booking_source_breakdown?: Json
          created_at?: string
          updated_at?: string
        }
      }
      booking_modifications: {
        Row: {
          id: string
          booking_id: string
          modification_type: Database['public']['Enums']['modification_type']
          previous_values: Json | null
          new_values: Json | null
          reason: string | null
          modified_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          modification_type: Database['public']['Enums']['modification_type']
          previous_values?: Json | null
          new_values?: Json | null
          reason?: string | null
          modified_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          modification_type?: Database['public']['Enums']['modification_type']
          previous_values?: Json | null
          new_values?: Json | null
          reason?: string | null
          modified_by?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          confirmation_number: string
          hotel_id: string
          guest_id: string
          status: Database['public']['Enums']['booking_status']
          check_in_date: string
          check_out_date: string
          number_of_nights: number
          adults: number
          children: number
          infants: number
          room_type_id: string
          room_id: string | null
          rate_plan_id: string
          room_rate: number
          room_total: number
          taxes: number
          fees: number
          total_amount: number
          currency: string
          payment_status: Database['public']['Enums']['payment_status']
          payment_method: Database['public']['Enums']['payment_method'] | null
          payment_intent_id: string | null
          deposit_amount: number | null
          deposit_paid: boolean
          deposit_due_date: string | null
          balance_due_date: string | null
          special_requests: string | null
          internal_notes: string | null
          tags: string[] | null
          booking_source: Database['public']['Enums']['booking_source']
          booking_channel: string | null
          referral_code: string | null
          promo_code: string | null
          created_at: string
          updated_at: string
          cancelled_at: string | null
          confirmed_at: string | null
          checked_in_at: string | null
          checked_out_at: string | null
        }
        Insert: {
          id?: string
          confirmation_number?: string
          hotel_id: string
          guest_id: string
          status?: Database['public']['Enums']['booking_status']
          check_in_date: string
          check_out_date: string
          adults?: number
          children?: number
          infants?: number
          room_type_id: string
          room_id?: string | null
          rate_plan_id: string
          room_rate: number
          room_total: number
          taxes?: number
          fees?: number
          total_amount: number
          currency?: string
          payment_status?: Database['public']['Enums']['payment_status']
          payment_method?: Database['public']['Enums']['payment_method'] | null
          payment_intent_id?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean
          deposit_due_date?: string | null
          balance_due_date?: string | null
          special_requests?: string | null
          internal_notes?: string | null
          tags?: string[] | null
          booking_source?: Database['public']['Enums']['booking_source']
          booking_channel?: string | null
          referral_code?: string | null
          promo_code?: string | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
          confirmed_at?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
        }
        Update: {
          id?: string
          confirmation_number?: string
          hotel_id?: string
          guest_id?: string
          status?: Database['public']['Enums']['booking_status']
          check_in_date?: string
          check_out_date?: string
          adults?: number
          children?: number
          infants?: number
          room_type_id?: string
          room_id?: string | null
          rate_plan_id?: string
          room_rate?: number
          room_total?: number
          taxes?: number
          fees?: number
          total_amount?: number
          currency?: string
          payment_status?: Database['public']['Enums']['payment_status']
          payment_method?: Database['public']['Enums']['payment_method'] | null
          payment_intent_id?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean
          deposit_due_date?: string | null
          balance_due_date?: string | null
          special_requests?: string | null
          internal_notes?: string | null
          tags?: string[] | null
          booking_source?: Database['public']['Enums']['booking_source']
          booking_channel?: string | null
          referral_code?: string | null
          promo_code?: string | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
          confirmed_at?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
        }
      }
      dynamic_pricing: {
        Row: {
          id: string
          hotel_id: string
          room_type_id: string
          rate_plan_id: string | null
          date: string
          base_rate_multiplier: number
          minimum_rate: number | null
          maximum_rate: number | null
          close_out: boolean
          minimum_stay: number | null
          maximum_stay: number | null
          closed_to_arrival: boolean
          closed_to_departure: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          room_type_id: string
          rate_plan_id?: string | null
          date: string
          base_rate_multiplier?: number
          minimum_rate?: number | null
          maximum_rate?: number | null
          close_out?: boolean
          minimum_stay?: number | null
          maximum_stay?: number | null
          closed_to_arrival?: boolean
          closed_to_departure?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          room_type_id?: string
          rate_plan_id?: string | null
          date?: string
          base_rate_multiplier?: number
          minimum_rate?: number | null
          maximum_rate?: number | null
          close_out?: boolean
          minimum_stay?: number | null
          maximum_stay?: number | null
          closed_to_arrival?: boolean
          closed_to_departure?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      guests: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          country: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          date_of_birth: string | null
          nationality: string | null
          passport_number: string | null
          marketing_opt_in: boolean
          vip_status: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          country?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          passport_number?: string | null
          marketing_opt_in?: boolean
          vip_status?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          country?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          passport_number?: string | null
          marketing_opt_in?: boolean
          vip_status?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hotels: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          address: string
          city: string
          country: string
          postal_code: string | null
          phone: string | null
          email: string | null
          website: string | null
          check_in_time: string
          check_out_time: string
          currency: string
          time_zone: string
          tax_rate: number
          service_fee: number
          amenities: Json
          policies: Json
          coordinates: unknown | null
          status: Database['public']['Enums']['room_status']
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          slug: string
          description?: string | null
          address: string
          city: string
          country: string
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          check_in_time?: string
          check_out_time?: string
          currency?: string
          time_zone?: string
          tax_rate?: number
          service_fee?: number
          amenities?: Json
          policies?: Json
          coordinates?: unknown | null
          status?: Database['public']['Enums']['room_status']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          address?: string
          city?: string
          country?: string
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          check_in_time?: string
          check_out_time?: string
          currency?: string
          time_zone?: string
          tax_rate?: number
          service_fee?: number
          amenities?: Json
          policies?: Json
          coordinates?: unknown | null
          status?: Database['public']['Enums']['room_status']
          created_at?: string
          updated_at?: string
        }
      }
      inventory_blocks: {
        Row: {
          id: string
          hotel_id: string
          room_type_id: string | null
          room_id: string | null
          block_name: string
          start_date: string
          end_date: string
          rooms_blocked: number
          reason: Database['public']['Enums']['block_reason']
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          room_type_id?: string | null
          room_id?: string | null
          block_name: string
          start_date: string
          end_date: string
          rooms_blocked?: number
          reason?: Database['public']['Enums']['block_reason']
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          room_type_id?: string | null
          room_id?: string | null
          block_name?: string
          start_date?: string
          end_date?: string
          rooms_blocked?: number
          reason?: Database['public']['Enums']['block_reason']
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rate_plans: {
        Row: {
          id: string
          hotel_id: string
          room_type_id: string | null
          name: string
          description: string | null
          rate_type: Database['public']['Enums']['rate_type']
          base_rate_modifier: number
          includes_breakfast: boolean
          includes_taxes: boolean
          minimum_stay: number | null
          maximum_stay: number | null
          advance_booking_days: number | null
          valid_from: string
          valid_to: string
          days_of_week: number[]
          blackout_dates: string[] | null
          cancellation_type: Database['public']['Enums']['cancellation_type']
          cancellation_deadline_hours: number
          cancellation_penalty_amount: number | null
          cancellation_penalty_type: string | null
          cancellation_description: string | null
          payment_terms: Database['public']['Enums']['payment_terms_type']
          deposit_amount: number | null
          deposit_type: string | null
          payment_due_date: string
          payment_days_before: number | null
          status: Database['public']['Enums']['room_status']
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          hotel_id: string
          room_type_id?: string | null
          name: string
          description?: string | null
          rate_type?: Database['public']['Enums']['rate_type']
          base_rate_modifier?: number
          includes_breakfast?: boolean
          includes_taxes?: boolean
          minimum_stay?: number | null
          maximum_stay?: number | null
          advance_booking_days?: number | null
          valid_from: string
          valid_to: string
          days_of_week?: number[]
          blackout_dates?: string[] | null
          cancellation_type?: Database['public']['Enums']['cancellation_type']
          cancellation_deadline_hours?: number
          cancellation_penalty_amount?: number | null
          cancellation_penalty_type?: string | null
          cancellation_description?: string | null
          payment_terms?: Database['public']['Enums']['payment_terms_type']
          deposit_amount?: number | null
          deposit_type?: string | null
          payment_due_date?: string
          payment_days_before?: number | null
          status?: Database['public']['Enums']['room_status']
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          room_type_id?: string | null
          name?: string
          description?: string | null
          rate_type?: Database['public']['Enums']['rate_type']
          base_rate_modifier?: number
          includes_breakfast?: boolean
          includes_taxes?: boolean
          minimum_stay?: number | null
          maximum_stay?: number | null
          advance_booking_days?: number | null
          valid_from?: string
          valid_to?: string
          days_of_week?: number[]
          blackout_dates?: string[] | null
          cancellation_type?: Database['public']['Enums']['cancellation_type']
          cancellation_deadline_hours?: number
          cancellation_penalty_amount?: number | null
          cancellation_penalty_type?: string | null
          cancellation_description?: string | null
          payment_terms?: Database['public']['Enums']['payment_terms_type']
          deposit_amount?: number | null
          deposit_type?: string | null
          payment_due_date?: string
          payment_days_before?: number | null
          status?: Database['public']['Enums']['room_status']
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      room_types: {
        Row: {
          id: string
          hotel_id: string
          name: string
          slug: string
          description: string | null
          base_price: number
          max_occupancy: number
          max_adults: number
          max_children: number
          size_sqm: number | null
          bed_configuration: string | null
          images: Json
          amenities: Json
          total_inventory: number
          status: Database['public']['Enums']['room_status']
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          hotel_id: string
          name: string
          slug: string
          description?: string | null
          base_price: number
          max_occupancy?: number
          max_adults?: number
          max_children?: number
          size_sqm?: number | null
          bed_configuration?: string | null
          images?: Json
          amenities?: Json
          total_inventory?: number
          status?: Database['public']['Enums']['room_status']
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          name?: string
          slug?: string
          description?: string | null
          base_price?: number
          max_occupancy?: number
          max_adults?: number
          max_children?: number
          size_sqm?: number | null
          bed_configuration?: string | null
          images?: Json
          amenities?: Json
          total_inventory?: number
          status?: Database['public']['Enums']['room_status']
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          hotel_id: string
          room_type_id: string
          room_number: string
          floor: number | null
          building: string | null
          status: Database['public']['Enums']['room_status']
          notes: string | null
          last_maintenance: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          hotel_id: string
          room_type_id: string
          room_number: string
          floor?: number | null
          building?: string | null
          status?: Database['public']['Enums']['room_status']
          notes?: string | null
          last_maintenance?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          room_type_id?: string
          room_number?: string
          floor?: number | null
          building?: string | null
          status?: Database['public']['Enums']['room_status']
          notes?: string | null
          last_maintenance?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      public_bookings: {
        Row: {
          id: string | null
          confirmation_number: string | null
          hotel_id: string | null
          hotel_name: string | null
          status: Database['public']['Enums']['booking_status'] | null
          check_in_date: string | null
          check_out_date: string | null
          number_of_nights: number | null
          adults: number | null
          children: number | null
          room_type_name: string | null
          rate_plan_name: string | null
          total_amount: number | null
          currency: string | null
          special_requests: string | null
          created_at: string | null
          confirmed_at: string | null
          first_name: string | null
          last_name: string | null
          email: string | null
        }
      }
    }
    Functions: {
      cleanup_expired_holds: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_confirmation_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_accessible_hotels: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      has_hotel_access: {
        Args: {
          hotel_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      block_reason: 'maintenance' | 'group' | 'event' | 'other'
      booking_source: 'website' | 'phone' | 'email' | 'walk_in' | 'ota'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed'
      cancellation_type: 'flexible' | 'moderate' | 'strict' | 'non_refundable'
      modification_type: 'date_change' | 'room_change' | 'guest_change' | 'cancellation'
      payment_method: 'card' | 'cash' | 'bank_transfer' | 'other'
      payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
      payment_terms_type: 'pay_now' | 'pay_later' | 'deposit'
      rate_type: 'flexible' | 'non_refundable' | 'advance_purchase' | 'package'
      room_status: 'active' | 'inactive' | 'maintenance' | 'out_of_order'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}