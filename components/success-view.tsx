"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Check, Package, Truck } from "lucide-react"
import { useAccounts } from "@/components/account-provider"
import { useOrders } from "@/components/orders-provider"

export default function SuccessView() {
  const params = useSearchParams()
  const { user, hydrated } = useAccounts()
  const { myOrders } = useOrders()
  const [orderId, setOrderId] = useState<string>("")

  useEffect(() => {
    setOrderId(params.get("order") ?? "")
  }, [params])

  const order =
    myOrders.find((o) => o.id === orderId) ?? myOrders[0] ?? null

  return (
    <main className="wrap py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-24 w-24 animate-pop items-center justify-center rounded-full border-2 border-ink bg-pink-500 text-white shadow-sticker">
          <Check size={44} strokeWidth={3} />
        </div>

        <span className="tag mt-6 border-pink-500 bg-pink-100 text-pink-600">
          {order ? "Order confirmed" : "Thank you"}
        </span>
        <h1 className="mt-3 text-3xl uppercase sm:text-4xl">
          {order?.address.fullName?.split(" ")[0] ?? "Pet parent"}
          , your order is in!
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-ink/60">
          We&apos;ve sent a confirmation to{" "}
          <span className="font-bold text-ink">{user?.email ?? "your email"}</span>{" "}
          and will notify you as soon as your parcel ships.
        </p>

        {hydrated && order && (
          <div className="sticker mt-8 text-left">
            <div className="flex items-center justify-between border-b-2 border-dashed border-ink/20 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-ink/50">
                Order ID
              </span>
              <span className="font-display text-lg">{order.id}</span>
            </div>

            <ul className="mt-4 space-y-2.5">
              {order.items.map((item) => (
                <li
                  key={`${order.id}-${item.productId}-${item.size}-${item.color}`}
                  className="flex items-center gap-3"
                >
                  <div className="h-14 w-11 shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-pink-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{item.name}</p>
                    <p className="text-[11px] font-medium text-ink/55">
                      {item.size} · {item.color} · Qty {item.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 border-t-2 border-dashed border-ink/20 pt-3 text-sm">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-ink/55">Total paid</span>
                <span className="font-display text-lg">
                  ₹{order.total.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-ink/55">Payment</span>
                <span className="font-bold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-ink/55">Arrives by</span>
                <span className="font-bold">
                  {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/account/orders" className="btn-pink">
            <Truck size={16} /> Track my order
          </Link>
          <Link href="/products" className="btn-white">
            <Package size={16} /> Keep shopping
          </Link>
        </div>

        {hydrated && !order && (
          <p className="mt-6 text-xs font-semibold text-ink/45">
            Tip: sign in to see every order and its tracking timeline.
          </p>
        )}
      </div>
    </main>
  )
}