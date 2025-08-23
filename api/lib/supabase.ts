/**
 * Supabase Configuration
 * Configurazione del client Supabase per il backend
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables first
dotenv.config();

// Environment variables validation
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

if (!anonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required');
}

// Crea il client Supabase con service role key per operazioni backend
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Export delle configurazioni per uso esterno
export const config = {
  url: supabaseUrl,
  anonKey: anonKey,
  serviceRoleKey: supabaseServiceKey
};

export default supabase;