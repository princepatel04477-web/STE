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

/**
 * Columns added by migration 20260904000027, which gave the profile fields a
 * home of their own instead of leaving them inside fascia_names_json.
 *
 * A deployment can reach production before its migration is applied, and
 * PostgREST refuses a whole write that names a column the schema does not have
 * (PGRST204). That would take out every profile save until the migration ran,
 * so upsertExhibitorRow drops these and tries once more rather than failing.
 */
const PROFILE_COLUMNS = [
  'exhibitor_name',
  'company_description',
  'gstin',
  'profile_pic_url',
] as const;

/** True for the error PostgREST raises when a column is not in the schema. */
function isUnknownColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  // PGRST204 from PostgREST, 42703 ("undefined column") from Postgres itself.
  if (error.code === 'PGRST204' || error.code === '42703') return true;
  const message = error.message || '';
  return PROFILE_COLUMNS.some((column) => message.includes(`'${column}' column`));
}

/**
 * Writes an exhibitor row, surviving a schema that predates the profile
 * columns. Returns the error PostgREST gave, or null when the row was saved.
 */
export async function upsertExhibitorRow(
  row: Record<string, unknown>
): Promise<{ message: string } | null> {
  if (!supabaseAdmin) return { message: 'Supabase is not configured.' };

  const { error } = await supabaseAdmin
    .from('exhibitors')
    .upsert(row, { onConflict: 'mobile' });

  if (!error) return null;
  if (!isUnknownColumnError(error)) return { message: error.message };

  console.warn(
    '[Supabase] The exhibitor profile columns are missing - apply migration ' +
    '20260904000027. Saving without them for now; the values still go into ' +
    'fascia_names_json.'
  );

  const fallback = { ...row };
  for (const column of PROFILE_COLUMNS) delete fallback[column];

  const { error: retryError } = await supabaseAdmin
    .from('exhibitors')
    .upsert(fallback, { onConflict: 'mobile' });

  return retryError ? { message: retryError.message } : null;
}

export default supabaseAdmin;
