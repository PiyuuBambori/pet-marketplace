import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Service-role client. This BYPASSES row level security, so it must only ever
 * be constructed inside Route Handlers / scripts — never in a component.
 * The key is read from a non-public env var and is never sent to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing. See .env.example."
    )
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const STORAGE_BUCKET = "doom-images"
