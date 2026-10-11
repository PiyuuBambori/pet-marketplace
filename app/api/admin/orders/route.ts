import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { AuthError, requireAdmin } from "@/lib/auth"
import { ORDER_FLOW } from "@/lib/orders"

export const dynamic = "force-dynamic"

function fail(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  console.error("Admin orders error:", error)
  return NextResponse.json({ error: "Could not load orders." }, { status: 500 })
}

/** GET /api/admin/orders — every order across all buyers, for fulfilment */
export async function GET() {
  try {
    await requireAdmin()

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    return fail(error)
  }
}

/**
 * PATCH /api/admin/orders  { orderId, action: "advance" | "cancel" }
 * Admin-only fulfilment actions. Status transitions follow the fixed flow so
 * the buyer-facing timeline can never be pushed into an impossible state.
 */
export async function PATCH(request: Request) {
  try {
    await requireAdmin()

    const { orderId, action } = await request.json()

    if (!orderId || !["advance", "cancel"].includes(action)) {
      return NextResponse.json(
        { error: "orderId and action (advance|cancel) are required" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    const now = new Date()
    const timeline = Array.isArray(order.timeline)
      ? (order.timeline as { status: string; at: string; note: string }[])
      : []

    if (action === "cancel") {
      if (order.status === "delivered" || order.status === "cancelled") {
        return NextResponse.json(
          { error: "This order can no longer be cancelled." },
          { status: 409 }
        )
      }
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "cancelled",
          trackingNumber: null,
          timeline: [
            ...timeline,
            { status: "cancelled", at: now.toISOString(), note: "Cancelled by the studio." },
          ],
        },
      })
      return NextResponse.json({ order: updated })
    }

    const index = ORDER_FLOW.findIndex((step) => step.status === order.status)
    if (index === -1 || index >= ORDER_FLOW.length - 1) {
      return NextResponse.json(
        { error: "This order is already at its final stage." },
        { status: 409 }
      )
    }

    const next = ORDER_FLOW[index + 1]
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: next.status,
        trackingNumber:
          order.trackingNumber ??
          (next.status === "shipped" || next.status === "out_for_delivery"
            ? `PWX${Math.floor(Math.random() * 900000000) + 100000000}IN`
            : null),
        timeline: [...timeline, { status: next.status, at: now.toISOString(), note: next.note }],
      },
    })

    return NextResponse.json({ order: updated })
  } catch (error) {
    return fail(error)
  }
}