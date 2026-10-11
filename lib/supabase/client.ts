import { createBrowserClient } from "@supabase/ssr"

// NOTE: deliberately no `import "server-only"` here — this module is imported
// by Client Components, so that guard would fail the build.
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
}

/**
 * Browser-side Supabase client. Used by Client Components for sign-in/up/out.
 * Returns null when Supabase is not configured so the UI can degrade gracefully.
 */
export function createClient() {
  if (!isSupabaseConfigured()) return null

  // Memoised on purpose: createBrowserClient attaches an auth-state listener,
  // so building a new one per render would leak subscriptions and race on
  // token refresh.
  if (cached) return cached

  cached = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  return cached
}

let cached: ReturnType<typeof createBrowserClient> | null = null
