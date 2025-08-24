import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Reservation {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  reservation_date: string
  reservation_time: string
  party_size: number
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

// Tipo principale per gli elementi del menu
export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: 'antipasti' | 'pizza' | 'pasta' | 'pesce' | 'dolci' | 'bevande'
  image_url?: string
  available: boolean
  allergens?: string[]
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  status: 'new' | 'read' | 'replied'
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  password_hash: string
  role: 'admin' | 'manager'
  created_at: string
  updated_at: string
}