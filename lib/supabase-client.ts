//lib/supabase-client.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side client (user access)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Profile {
  id: string
  slug: string
  title: string
  description?: string
  logo_url?: string
  created_at?: string
  updated_at?: string
}

export interface Link {
  id: string
  profile_id: string
  title: string
  url: string
  icon?: string
  order?: number
  created_at?: string
  updated_at?: string
}