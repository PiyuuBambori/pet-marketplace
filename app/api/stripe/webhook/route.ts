import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { ORDER_FLOW } from "@/lib/accounts"

export const dynamic = "force-dynamic"

/**
 * Stripe webhook — marks orders paid once checkout completes.
 * Must read the RAW body so Stripe's signature can be verified.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secret || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured on this deployment." },
      { status: 503 }
    )
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
  }

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          const now = new Date()
          const order = await prisma.order.findUnique({ where: { id: orderId } })
          const timeline = Array.isArray(order?.timeline)
            ? (order.timeline as { status: string; at: string; note: string }[])
            : []

          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "confirmed",
              stripeSessionId: session.id,
              paymentMethod: session.payment_method_types?.[0] ?? "Card",
              timeline: [
                ...timeline,
                {
                  status: "confirmed",
                  at: now.toISOString(),
                  note: ORDER_FLOW[1].note,
                },
              ],
            },
          })
        }
        break
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId
        if (orderId) {
          const now = new Date()
          const order = await prisma.order.findUnique({ where: { id: orderId } })
          const timeline = Array.isArray(order?.timeline)
            ? (order.timeline as { status: string; at: string; note: string }[])
            : []
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "cancelled",
              timeline: [
                ...timeline,
                {
                  status: "cancelled",
                  at: now.toISOString(),
                  note: "Checkout session expired.",
                },
              ],
            },
          })
        }
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Handler failed" }, { status: 500 })
  }
}