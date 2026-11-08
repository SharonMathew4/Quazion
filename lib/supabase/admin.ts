import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase Admin client using the Service Role Key.
 * NEVER expose this or import it into client-side code.
 * Used for administrative user lookup, ORCID bridge provisioning, and system maintenance.
 */
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
