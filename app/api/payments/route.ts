import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

const FREE_SHIPPING_THRESHOLD = 1499
const SHIPPING_FEE = 79

type LineItem = {
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

/**
 * Creates the order server-side, then a Stripe Checkout Session for it.
 * The session's metadata carries orderId so the webhook can settle the order.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  if (!secret) {
    return NextResponse.json(
      { error: "Stripe is not configured on this deployment." },
      { status: 503 }
    )
  }

  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Sign in to check out." }, { status: 401 })
    }

    const body = await request.json()
    const items = (body?.items ?? []) as LineItem[]
    const address = body?.address

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your bag is empty." }, { status: 400 })
    }
    if (!address?.line1 || !address?.city || !address?.zip) {
      return NextResponse.json(
        { error: "A complete delivery address is required." },
        { status: 400 }
      )
    }

    // Price from the database, never from the client
    const priced = []
    let subtotal = 0
    let listTotal = 0

    for (const item of items) {
      const design = await prisma.design.findFirst({
        where: { id: item.productId, isActive: true },
      })
      if (!design) continue

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

    if (priced.length === 0) {
      return NextResponse.json(
        { error: "None of the items in your bag are still available." },
        { status: 409 }
      )
    }

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
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
    })

    const stripe = new Stripe(secret, { apiVersion: "2024-06-20" })

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: priced.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "inr",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name,
            description: `${item.brand} · Size ${item.size} · ${item.color}`,
          },
        },
      })),
      metadata: { orderId: order.id },
      shipping_address_collection: { allowed_countries: ["IN", "US", "GB", "AE"] },
      success_url: `${appUrl}/checkout/success?order=${order.id}`,
      cancel_url: `${appUrl}/checkout`,
    })

    return NextResponse.json({ orderId: order.id, sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Could not start checkout." },
      { status: 500 }
    )
  }
}