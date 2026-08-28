import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceRoleKey));

/**
 * Whether supabaseAdmin is actually privileged.
 *
 * Without SUPABASE_SERVICE_ROLE_KEY the admin client falls back to the anon
 * key above, and row-level security then answers every read with an empty
 * list and a 200 - no error to catch. A draw run on that client would be told
 * the exhibitor has never drawn and that no stall on the floor is taken, then
 * have its write silently refused. Callers that must not run half-blind check
 * this first and refuse rather than guess.
 */
export const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

if (isSupabaseConfigured && !hasServiceRoleKey) {
  console.error(
    '[Supabase] SUPABASE_SERVICE_ROLE_KEY is not set. The admin client is ' +
    'running on the anon key, which row-level security answers with empty ' +
    'results rather than errors. Writes will not persist.'
  );
}

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
