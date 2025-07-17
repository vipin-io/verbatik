import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// The '!' tells TypeScript that we are sure these environment variables will exist.
// We've ensured this by setting them up in our .env.local file.

export const supabase = createClient(supabaseUrl, supabaseAnonKey)