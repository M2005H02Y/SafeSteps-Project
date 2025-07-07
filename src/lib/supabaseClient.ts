
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // In a real app, you'd want to handle this more gracefully.
  // For this prototype, throwing an error is fine to make sure env vars are set.
  throw new Error("Supabase URL or anonymous key is not defined. Please check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
