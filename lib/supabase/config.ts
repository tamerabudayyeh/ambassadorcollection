// Supabase configuration with fallbacks for development
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnrnkhcavvgfdqysggaa.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imducm5raGNhdnZnZmRxeXNnZ2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MDQ5NzMsImV4cCI6MjA3MDk4MDk3M30.kgHxvVA1JPsaoZzTqkIlPHbo73EYSrAcnhdIQjyh5JI',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imducm5raGNhdnZnZmRxeXNnZ2FhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQwNDk3MywiZXhwIjoyMDcwOTgwOTczfQ.U5JcexFxjN-9OtYjIfgvUG_SiocvudtXJu_EZKCcweM'
} as const;

// Validate configuration
if (typeof window !== 'undefined') {
  // Client-side validation
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.error('Missing Supabase configuration:', {
      url: !!supabaseConfig.url,
      anonKey: !!supabaseConfig.anonKey
    });
  }
} else {
  // Server-side validation
  if (!supabaseConfig.url || !supabaseConfig.anonKey || !supabaseConfig.serviceRoleKey) {
    console.error('Missing Supabase configuration:', {
      url: !!supabaseConfig.url,
      anonKey: !!supabaseConfig.anonKey,
      serviceRoleKey: !!supabaseConfig.serviceRoleKey
    });
  }
}