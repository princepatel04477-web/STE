import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceRoleKey));

/**
 * Public client for client-side or anon interactions.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })
  : null;

/**
 * Admin client with Service Role Key for server-side API routes, database operations, and storage management.
 */
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    })
  : null;

export default supabaseAdmin;
