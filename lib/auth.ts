import "server-only"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export type AuthedUser = {
  id: string
  email: string
  name: string | null
  phone: string | null
  avatar: string
  role: "admin" | "buyer"
  createdAt: number
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "AuthError"
    this.status = status
  }
}

/**
 * Resolves the current user from the Supabase session cookie.
 *
 * Uses auth.getUser() rather than auth.getSession(): getSession() only reads
 * the cookie and does not verify it with the Auth server, so its user object
 * must not be trusted for authorisation decisions. getUser() revalidates.
 */
export async function getCurrentUser(): Promise<AuthedUser | null> {
  const supabase = createClient()
  if (!supabase) return null

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  // The profile row is created by the on_auth_user_created trigger, but read
  // defensively in case the trigger is missing.
  let profile = null
  try {
    profile = await prisma.user.findUnique({ where: { id: user.id } })
  } catch {
    profile = null
  }

  if (!profile) {
    try {
      profile = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email ?? "",
          name:
            (user.user_metadata?.name as string | undefined) ??
            user.email?.split("@")[0] ??
            "Pet Parent",
          phone: (user.user_metadata?.phone as string | undefined) ?? null,
          avatar: (user.user_metadata?.avatar as string | undefined) ?? "🐾",
          role: "buyer",
        },
      })
    } catch {
      return null
    }
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    avatar: profile.avatar,
    role: profile.role === "admin" ? "admin" : "buyer",
    createdAt: profile.createdAt.getTime(),
  }
}

/** Throws AuthError(401) when nobody is signed in. */
export async function requireUser(): Promise<AuthedUser> {
  const user = await getCurrentUser()
  if (!user) throw new AuthError("Sign in to continue.", 401)
  return user
}

/** Throws AuthError(401/403) unless the caller is the studio admin. */
export async function requireAdmin(): Promise<AuthedUser> {
  const user = await getCurrentUser()
  if (!user) throw new AuthError("Sign in to continue.", 401)
  if (user.role !== "admin") throw new AuthError("Studio admin access required.", 403)
  return user
}
