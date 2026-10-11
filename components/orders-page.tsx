"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Package, Search } from "lucide-react"
import { useAccounts } from "@/components/account-provider"
import { useOrders } from "@/components/orders-provider"
import OrderCard from "@/components/order-card"

export default function OrdersPage() {
  const router = useRouter()
  const { user, isAdmin, hydrated } = useAccounts()
  const { myOrders, loading, advanceOrder, cancelOrder } = useOrders()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "past">("all")

  useEffect(() => {
    if (hydrated && !user) router.replace("/login")
  }, [hydrated, user, router])

  if (!hydrated || !user) {
    return (
      <main className="wrap py-20 text-center">
        <p className="font-bold uppercase tracking-widest text-ink/40">Loading…</p>
      </main>
    )
  }

  const matches = (id: string) =>
    query.trim() ? id.toLowerCase().includes(query.trim().toLowerCase()) : true

  const visible = myOrders
    .filter((order) => matches(order.id))
    .filter((order) => {
      if (filter === "active")
        return order.status !== "delivered" && order.status !== "cancelled"
      if (filter === "past")
        return order.status === "delivered" || order.status === "cancelled"
      return true
    })

  const counts = {
    all: myOrders.length,
    active: myOrders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled"
    ).length,
    past: myOrders.filter(
      (o) => o.status === "delivered" || o.status === "cancelled"
    ).length,
  }

  return (
    <main className="wrap py-10">
      <nav className="mb-6 text-xs font-semibold text-ink/50">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-pink-500">
              Home
            </Link>
          </li>
          <span>/</span>
          <li>
            <Link href="/account" className="hover:text-pink-500">
              Account
            </Link>
          </li>
          <span>/</span>
          <li className="text-ink">Orders</li>
        </ol>
      </nav>

      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="tag border-pink-500 text-pink-600">
            {user.avatar} {(user?.name ?? "buyer").split(" ")[0]}
          </span>
          <h1 className="mt-3 text-3xl uppercase sm:text-4xl">My orders</h1>
          <p className="mt-1.5 text-sm font-medium text-ink/60">
            Everything you have bought, with live tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-pink-50 px-4">
          <Search size={16} className="shrink-0 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find by order ID"
            className="w-full bg-transparent py-2.5 text-sm font-medium focus:outline-none sm:w-52"
          />
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["all", "All orders"],
            ["active", "On the way"],
            ["past", "Past"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`chip ${filter === id ? "chip-on" : ""}`}
          >
            <Package size={14} />
            {label}
            <span className="ml-0.5 text-xs opacity-70">({counts[id]})</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-sticker border-2 border-dashed border-ink/30 bg-pink-50 px-6 py-16 text-center">
          <span className="text-4xl">📦</span>
          <h2 className="text-lg uppercase">
            {query ? "No matching orders" : "No orders here yet"}
          </h2>
          <p className="max-w-sm text-sm font-medium text-ink/60">
            {query
              ? `Nothing matched "${query}". Try a different order ID.`
              : "Place your first order and it will appear here with step-by-step tracking."}
          </p>
          <Link href="/products" className="btn-pink btn-sm mt-2">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {visible.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              viewerRole={isAdmin ? "admin" : "buyer"}
              onAdvance={isAdmin ? advanceOrder : undefined}
              onCancel={isAdmin ? cancelOrder : undefined}
            />
          ))}
        </div>
      )}
    </main>
  )
}