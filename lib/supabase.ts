import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// createBrowserClient persiste a sessão em cookies (necessário para middleware)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)