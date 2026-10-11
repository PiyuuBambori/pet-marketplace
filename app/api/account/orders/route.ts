import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

/** GET /api/account/orders — the signed-in buyer's own orders */
export async function GET() {
  try {
    const user = await requireUser()

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    })

    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ error: "Sign in to see your orders." }, { status: 401 })
  }
}