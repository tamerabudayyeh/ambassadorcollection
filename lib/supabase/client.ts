import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Server-side Supabase client (uses service role key for admin operations)
export const supabaseAdmin = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
);

// Type-safe database helpers
export type SupabaseClient = typeof supabase;