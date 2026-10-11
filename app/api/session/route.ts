import { NextResponse } from "next/server"
import {
  createSession,
  destroySession,
  getSessionUser,
  hashPassword,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/** POST /api/session  { action: "login" | "register" } */
export async function POST(request: Request) {
  try {
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

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user?.password) {
        return NextResponse.json(
          { error: "No account found with that email." },
          { status: 401 }
        )
      }

      if (!(await verifyPassword(password, user.password))) {
        return NextResponse.json(
          { error: "Incorrect password." },
          { status: 401 }
        )
      }

      await createSession(user.id)
      return NextResponse.json({ user: toPublicUser({ ...user, avatar: user.avatar }) })
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

      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json(
          { error: "An account with that email already exists." },
          { status: 409 }
        )
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          avatar,
          password: await hashPassword(password),
          role: "buyer",
        },
      })

      await createSession(user.id)
      return NextResponse.json({ user: toPublicUser({ ...user, avatar: user.avatar }) }, { status: 201 })
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json(
      {
        error:
          "Could not sign you in. The database may not be configured — check DATABASE_URL.",
      },
      { status: 500 }
    )
  }
}

/** DELETE /api/session — sign out */
export async function DELETE() {
  try {
    await destroySession()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Could not sign out." }, { status: 500 })
  }
}

/** GET /api/session — who am I */
export async function GET() {
  try {
    const user = await getSessionUser()
    return NextResponse.json({ user: user ? toPublicUser(user) : null })
  } catch {
    return NextResponse.json({ user: null })
  }
}