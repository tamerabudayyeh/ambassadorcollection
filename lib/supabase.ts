import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton instance for browser
let supabaseInstance: SupabaseClient | null = null

// Client for public operations (singleton pattern to prevent multiple instances)
export const supabase = (() => {
  if (!supabaseInstance && typeof window !== 'undefined') {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'ambassador-auth',
        flowType: 'pkce'
      },
    })
  } else if (!supabaseInstance) {
    // Server-side instance (doesn't persist sessions)
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  return supabaseInstance!
})()

// Server client for admin operations (requires service role key)
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    console.warn('Service role key not configured - admin operations will fail')
    return null
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Types for our database tables (we'll expand these after creating tables)
export type Hotel = {
  id: string
  name: string
  slug: string
  location: string
  description: string
  image_url: string
  rating: number
  amenities: string[]
  created_at: string
  updated_at: string
}

export type Room = {
  id: string
  hotel_id: string
  room_type: string
  name: string
  description: string
  max_occupancy: number
  base_price: number
  amenities: string[]
  image_url: string
  quantity: number
  created_at: string
  updated_at: string
}

export type Booking = {
  id: string
  confirmation_number: string
  hotel_id: string
  room_id: string
  guest_id: string
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
  total_price: number
  status: 'confirmed' | 'cancelled' | 'pending' | 'completed'
  payment_status: 'paid' | 'pending' | 'refunded'
  special_requests?: string
  created_at: string
  updated_at: string
}

export type Guest = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  country: string
  city?: string
  address?: string
  postal_code?: string
  created_at: string
  updated_at: string
}