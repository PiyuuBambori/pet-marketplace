import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

type IncomingItem = {
  productId: string
  name: string
  brand: string
  image: string
  price: number
  mrp: number
  size: string
  color: string
  quantity: number
}

/** POST /api/orders — create an order for the signed-in profile */
export async function POST(request: Request) {
  try {
    const user = await requireUser().catch(() => null)
    if (!user) {
      return NextResponse.json({ error: "Sign in to place an order." }, { status: 401 })
    }

    const body = await request.json()
    const items = body?.items as IncomingItem[]

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your bag is empty." }, { status: 400 })
    }

    const address = body?.address
    if (!address?.line1 || !address?.city || !address?.zip || !address?.fullName) {
      return NextResponse.json(
        { error: "A complete delivery address is required." },
        { status: 400 }
      )
    }

    // Re-price from the database so the client cannot dictate what is charged.
    const priced = [] as {
      designId: string
      name: string
      brand: string
      image: string
      mrp: number
      size: string
      color: string
      quantity: number
      price: number
    }[]

    let subtotal = 0
    let listTotal = 0

    for (const item of items) {
      const design = await prisma.design.findFirst({
        where: { id: item.productId, isActive: true },
      })

      if (!design) {
        return NextResponse.json(
          { error: `"${item.name}" is no longer available.` },
          { status: 409 }
        )
      }

      const quantity = Math.max(1, Math.min(10, Number(item.quantity) || 1))
      const price = design.price
      const mrp = design.mrp ?? price

      subtotal += price * quantity
      listTotal += mrp * quantity

      priced.push({
        designId: design.id,
        name: design.title,
        brand: design.brand ?? "Doom",
        image: design.imageUrl,
        mrp,
        size: String(item.size ?? "One Size"),
        color: String(item.color ?? "Default"),
        quantity,
        price,
      })
    }

    const shipping = subtotal >= 1499 ? 0 : 79
    const discount = Math.max(0, listTotal - subtotal)
    const tax = Math.round(subtotal * 0.08)
    const total = subtotal + shipping + tax

    const now = new Date()
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: "placed",
        subtotal,
        shipping,
        tax,
        discount,
        total,
        paymentMethod: String(body?.paymentMethod ?? "Card"),
        shippingAddress: address,
        estimatedDelivery: new Date(now.getTime() + 4 * 86_400_000),
        timeline: [{ status: "placed", at: now.toISOString(), note: "Order placed." }],
        items: { create: priced },
      },
      include: { items: true },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: "Could not place the order. Please try again." },
      { status: 500 }
    )
  }
}