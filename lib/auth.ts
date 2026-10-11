import "server-only"
import { cookies } from "next/headers"
import { randomBytes, createHmac, timingSafeEqual } from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const SESSION_COOKIE = "doom_session"
const SESSION_TTL_DAYS = 7

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (secret && secret.length >= 16) return secret
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is missing or too short. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    )
  }
  // Deterministic development fallback so sessions survive a dev restart.
  return "doom-development-only-secret"
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed)
}

/** Signed, unguessable session token. Only the hash is stored. */
function signToken(): { token: string; lookup: string } {
  const raw = randomBytes(32).toString("hex")
  const mac = createHmac("sha256", sessionSecret()).update(raw).digest("hex")
  return { token: `${raw}.${mac}`, lookup: raw }
}

function verifySignature(token: string): string | null {
  const [raw, mac] = token.split(".")
  if (!raw || !mac) return null
  const expected = createHmac("sha256", sessionSecret()).update(raw).digest("hex")
  const a = Buffer.from(mac)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  return raw
}

export type SessionUser = {
  id: string
  email: string
  name: string | null
  phone: string | null
  avatar: string
  role: string
  createdAt: Date
}

export async function createSession(userId: string): Promise<void> {
  const { token, lookup } = signToken()

  await prisma.session.create({
    data: {
      token: lookup,
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000),
    },
  })

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 86_400,
  })
}

export async function destroySession(): Promise<void> {
  const store = cookies()
  const raw = store.get(SESSION_COOKIE)?.value

  if (raw) {
    const lookup = verifySignature(raw)
    if (lookup) {
      await prisma.session.deleteMany({ where: { token: lookup } })
    }
  }

  store.delete(SESSION_COOKIE)
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const raw = cookies().get(SESSION_COOKIE)?.value
  if (!raw) return null

  const lookup = verifySignature(raw)
  if (!lookup) return null

  try {
    const session = await prisma.session.findUnique({
      where: { token: lookup },
      include: { user: true },
    })

    if (!session) return null
    if (session.expiresAt.getTime() < Date.now()) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
      return null
    }

    const { user } = session
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    }
  } catch {
    return null
  }
}

/** Throws when the caller is not a signed-in admin. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) throw new AuthError("Not signed in", 401)
  if (user.role !== "admin") throw new AuthError("Admin access required", 403)
  return user
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = "AuthError"
  }
}

export function toPublicUser(user: SessionUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role as "admin" | "buyer",
    createdAt: user.createdAt.getTime(),
  }
}