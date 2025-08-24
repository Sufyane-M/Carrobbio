/**
 * Supabase Configuration
 * Configurazione del client Supabase per il backend
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
// Load environment variables first (only in development)
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
// Environment variables validation with explicit typing
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is required');
}
if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}
// Crea il client Supabase con service role key per operazioni backend
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
// Export delle configurazioni per uso esterno
// Removed "export const config" to avoid Vercel static analysis of a reserved "config" export in non-entry files
export default supabase;
