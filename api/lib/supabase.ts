/**
 * Supabase Configuration
 * Configurazione del client Supabase per il backend
 */
import { createClient } from '@supabase/supabase-js';

// Configurazione Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://dxamovfpehesohqzhxhx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4YW1vdmZwZWhlc29ocXpoeGh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3Nzk4MiwiZXhwIjoyMDcxMjUzOTgyfQ.2C5CtDgPV3tx-iH_W-xveAgaKywum3iQ-E718qXGgXM';

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
  anonKey: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4YW1vdmZwZWhlc29ocXpoeGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Nzc5ODIsImV4cCI6MjA3MTI1Mzk4Mn0.CclXwNyCG2Hh1dzAvUU23HmRBwxuewJRcRvsOtvA4MI',
  serviceRoleKey: supabaseServiceKey
};

export default supabase;