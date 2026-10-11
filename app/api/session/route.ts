import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUser, type AuthedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clientIp, rateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const REGISTER_LIMIT = 10
const REGISTER_WINDOW_MS = 10 * 60 * 1000

/** Turn Supabase Auth's terse errors into something a shopper can act on. */
function friendlyAuthError(message: string) {
  const text = message.toLowerCase()

  if (text.includes("already been registered") || text.includes("already registered")) {
    return { error: "An account with that email already exists.", status: 409 }
  }
  if (text.includes("rate limit") || text.includes("too many")) {
    return {
      error: "Too many accounts from this network. Please try again in a few minutes.",
      status: 429,
    }
  }
  if (text.includes("password")) {
    return { error: message, status: 400 }
  }
  return { error: message, status: 400 }
}

/** GET /api/session — who am I */
export async function GET() {
  try {
    const user = await getCurrentUser()
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}

/**
 * POST /api/session
 *   { action: "login",    email, password }
 *   { action: "register", name, email, password, phone?, avatar? }
 *
 * Credentials are owned by Supabase Auth. This route exists to keep the
 * profile row (avatar, role) in step and to return a normalised user shape.
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured on this deployment." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const action = body?.action

    if (action === "login") {
      const email = String(body.email ?? "").trim().toLowerCase()
      const password = String(body.password ?? "")

      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required." },
          { status: 400 }
        )
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const message =
          error.message === "Invalid login credentials"
            ? "Incorrect email or password."
            : error.message
        return NextResponse.json({ error: message }, { status: 401 })
      }

      const user = await getCurrentUser()
      return NextResponse.json({ user: user ?? data.user })
    }

    if (action === "register") {
      const name = String(body.name ?? "").trim()
      const email = String(body.email ?? "").trim().toLowerCase()
      const phone = String(body.phone ?? "").trim()
      const password = String(body.password ?? "")
      const avatar = String(body.avatar ?? "🐾")

      if (!name || !email || !password) {
        return NextResponse.json(
          { error: "Name, email and password are required." },
          { status: 400 }
        )
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json({ error: "Enter a valid email." }, { status: 400 })
      }
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters." },
          { status: 400 }
        )
      }

      // Registration no longer sends a confirmation email: the built-in
      // Supabase mailer is rate limited (a handful of signups per hour), which
      // made account creation fail outright. Accounts are created confirmed
      // through the admin API instead, which sends nothing.
      const limit = rateLimit(
        `register:${clientIp(request)}`,
        REGISTER_LIMIT,
        REGISTER_WINDOW_MS
      )
      if (!limit.ok) {
        return NextResponse.json(
          {
            error: `Too many accounts created from this network. Try again in ${Math.ceil(limit.retryAfter / 60)} minute(s).`,
          },
          { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
        )
      }

      const admin = createAdminClient()

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, phone, avatar },
      })

      if (createError) {
        const mapped = friendlyAuthError(createError.message)
        return NextResponse.json({ error: mapped.error }, { status: mapped.status })
      }

      // The on_auth_user_created trigger normally inserts this row. Upserting
      // as well keeps registration working on a project where the setup SQL
      // has not been applied yet.
      await prisma.user.upsert({
        where: { id: created.user.id },
        update: { name, phone, avatar },
        create: {
          id: created.user.id,
          email,
          name,
          phone: phone || null,
          avatar,
          role: "buyer",
        },
      })

      // Sign in with the cookie-backed client so the session is set for the
      // browser straight away.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        const mapped = friendlyAuthError(signInError.message)
        return NextResponse.json({ error: mapped.error }, { status: mapped.status })
      }

      const user = await getCurrentUser()
      return NextResponse.json({ user }, { status: 201 })
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ error: "Could not sign you in." }, { status: 500 })
  }
}

/** DELETE /api/session — sign out */
export async function DELETE() {
  try {
    const supabase = createClient()
    if (supabase) await supabase.auth.signOut()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Could not sign out." }, { status: 500 })
  }
}

export type { AuthedUser }