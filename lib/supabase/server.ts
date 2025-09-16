import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  // Use simple client for server-side operations during build
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}