"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ClipboardList,
  MapPin,
  Package,
  Phone,
  Search,
  Truck,
  User,
  X,
  Check,
} from "lucide-react"
import { useAccounts } from "@/components/account-provider"
import { useOrders } from "@/components/orders-provider"
import type { HydratedOrder } from "@/components/orders-provider"
import {
  formatDate,
  formatRupees,
  ORDER_FLOW,
  statusIndex,
  statusLabel,
  type Order,
} from "@/lib/accounts"

/**
 * The admin API includes the buyer profile alongside each order. Reuse the
 * provider's type so the two cannot drift apart.
 */
type AdminOrder = HydratedOrder

const stageFilters = [
  { id: "todo", label: "To ship" },
  { id: "transit", label: "In transit" },
  { id: "done", label: "Completed" },
  { id: "all", label: "All" },
] as const

type StageFilter = (typeof stageFilters)[number]["id"]

export default function AdminOrders() {
  const router = useRouter()
  const { user, isAdmin, hydrated } = useAccounts()
  const { orders, loading, advanceOrder, cancelOrder } = useOrders()

  const [filter, setFilter] = useState<StageFilter>("todo")
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (hydrated && !user) router.replace("/login")
  }, [hydrated, user, router])

  const sorted = useMemo(
    () => [...orders].sort((a, b) => b.placedAt - a.placedAt),
    [orders]
  )

  const visible = sorted
    .filter((order) => {
      if (filter === "todo")
        return order.status === "placed" || order.status === "confirmed" || order.status === "packed"
      if (filter === "transit")
        return order.status === "shipped" || order.status === "out_for_delivery"
      if (filter === "done")
        return order.status === "delivered" || order.status === "cancelled"
      return true
    })
    .filter((order) => {
      const buyer = (order as AdminOrder).buyer
      const haystack = [
        order.id,
        buyer?.name,
        buyer?.email,
        buyer?.phone,
        order.address.fullName,
        order.address.city,
        order.address.zip,
        ...order.items.map((i) => i.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return query.trim() ? haystack.includes(query.trim().toLowerCase()) : true
    })

  const counts = {
    todo: orders.filter(
      (o) => o.status === "placed" || o.status === "confirmed" || o.status === "packed"
    ).length,
    transit: orders.filter(
      (o) => o.status === "shipped" || o.status === "out_for_delivery"
    ).length,
    done: orders.filter(
      (o) => o.status === "delivered" || o.status === "cancelled"
    ).length,
    all: orders.length,
  }

  if (!hydrated || !user) {
    return (
      <main className="wrap py-20 text-center">
        <p className="font-bold uppercase tracking-widest text-ink/40">Loading…</p>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="wrap py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <span className="text-4xl">🔒</span>
          <h1 className="text-2xl uppercase">Studio admin only</h1>
          <p className="text-sm font-medium text-ink/60">
            Fulfilment controls are reserved for the permanent admin account.
          </p>
          <Link href="/login" className="btn-pink btn-sm mt-1">
            Studio access
          </Link>
        </div>
      </main>
    )
  }

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0)

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
          <li className="text-ink">Fulfilment</li>
        </ol>
      </nav>

      <header className="relative mb-7 overflow-hidden rounded-sticker border-2 border-ink bg-pink-500 p-7 text-white shadow-sticker-lg">
        <div className="halftone halftone-light absolute inset-0 opacity-25" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="tag border-ink bg-white text-pink-600">
              ✦ Studio Admin
            </span>
            <h1 className="mt-3 text-3xl uppercase sm:text-4xl">
              Orders to ship
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-white/85">
              Every order across all buyer profiles — who bought it, where it is
              going, and what stage it is at.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border-2 border-ink bg-white/15 px-4 py-2 text-center">
              <p className="font-display text-2xl">{counts.todo}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest">
                To ship
              </p>
            </div>
            <div className="rounded-xl border-2 border-ink bg-white/15 px-4 py-2 text-center">
              <p className="font-display text-2xl">{counts.transit}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest">
                In transit
              </p>
            </div>
            <div className="rounded-xl border-2 border-ink bg-white/15 px-4 py-2 text-center">
              <p className="font-display text-2xl">{formatRupees(revenue)}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest">
                Revenue
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {stageFilters.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`chip ${filter === option.id ? "chip-on" : ""}`}
            >
              {option.label}
              <span className="ml-0.5 text-xs opacity-70">
                ({counts[option.id]})
              </span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 rounded-full border-2 border-ink bg-pink-50 px-4">
          <Search size={16} className="shrink-0 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID, buyer, city or item"
            className="w-full bg-transparent py-2.5 text-sm font-medium focus:outline-none sm:w-64"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-sticker border-2 border-dashed border-ink/30 bg-pink-50 px-6 py-16 text-center">
          <span className="text-4xl">📋</span>
          <h2 className="text-lg uppercase">Nothing to fulfil here</h2>
          <p className="max-w-sm text-sm font-medium text-ink/60">
            {query
              ? `No orders matched "${query}".`
              : "When a buyer places an order it appears in this queue with their delivery address."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {visible.map((order) => (
            <ShipmentCard
              key={order.id}
              order={order}
              expanded={expanded === order.id}
              onToggle={() =>
                setExpanded((current) =>
                  current === order.id ? null : order.id
                )
              }
              onAdvance={advanceOrder}
              onCancel={cancelOrder}
            />
          ))}
        </div>
      )}
    </main>
  )
}

function ShipmentCard({
  order,
  expanded,
  onToggle,
  onAdvance,
  onCancel,
}: {
  order: AdminOrder
  expanded: boolean
  onToggle: () => void
  onAdvance: (id: string) => void
  onCancel: (id: string) => void
}) {
    const buyer = order.buyer
  const stage = statusIndex(order.status)
  const next = ORDER_FLOW[stage + 1]
  const isOpen = order.status === "placed" || order.status === "confirmed" || order.status === "packed"
  const units = order.items.reduce((n, i) => n + i.quantity, 0)

  return (
    <div className="sticker overflow-hidden p-0">
      {/* head */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-dashed border-ink/20 bg-pink-50 p-5">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-pink-500 text-white">
            <ClipboardList size={20} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg uppercase">{order.id}</p>
              <span
                className={`tag ${
                  order.status === "delivered"
                    ? "border-success bg-success text-white"
                    : order.status === "cancelled"
                      ? "border-ink/30 bg-white text-ink/50"
                      : "border-ink bg-pink-200"
                }`}
              >
                {statusLabel(order.status)}
              </span>
              {isOpen && (
                <span className="tag animate-pulse-pink border-pink-500 bg-pink-500 text-white">
                  Action needed
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-semibold text-ink/55">
              Placed {formatDate(order.placedAt)} · {units} unit
              {units === 1 ? "" : "s"} · {formatRupees(order.total)} ·{" "}
              {order.paymentMethod}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isOpen && next && (
            <button onClick={() => onAdvance(order.id)} className="btn-pink btn-sm">
              <Truck size={14} />
              {next.status === "shipped" ? "Ship order" : `Mark ${next.label}`}
            </button>
          )}
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <button
              onClick={() => onCancel(order.id)}
              className="btn btn-sm border-ink/30 bg-white text-ink/60 hover:bg-ink hover:text-white"
            >
              <X size={13} /> Cancel
            </button>
          )}
          <button onClick={onToggle} className="btn-white btn-sm">
            {expanded ? "Hide" : "Details"}
          </button>
        </div>
      </div>

      {/* always-visible shipping summary */}
      <div className="grid gap-4 p-5 lg:grid-cols-3">
        {/* ship to */}
        <div className="rounded-xl border-2 border-ink bg-pink-100 p-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-pink-600">
            <User size={12} /> Buyer
          </h4>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-lg">
              {buyer?.avatar ?? "🐾"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {buyer?.name ?? order.address.fullName}
              </p>
              <p className="truncate text-[11px] font-medium text-ink/60">
                {buyer?.email ?? "—"}
              </p>
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold">
            <Phone size={11} className="text-pink-500" />
            {order.address.phone}
          </p>
        </div>

        {/* address */}
        <div className="rounded-xl border-2 border-ink bg-white p-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-pink-600">
            <MapPin size={12} /> Ship to
          </h4>
          <p className="text-sm font-bold">{order.address.fullName}</p>
          <p className="mt-0.5 text-xs font-medium leading-relaxed text-ink/70">
            {order.address.line1}
            {order.address.line2 && <>, {order.address.line2}</>}
            <br />
            {order.address.city}, {order.address.state} {order.address.zip}
            <br />
            {order.address.country}
          </p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(
              `${order.address.line1}, ${order.address.city}, ${order.address.state} ${order.address.zip}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-[11px] font-bold uppercase tracking-widest text-pink-600 hover:underline"
          >
            Open in maps
          </a>
        </div>

        {/* items to pack */}
        <div className="rounded-xl border-2 border-ink bg-white p-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-pink-600">
            <Package size={12} /> Pack list
          </h4>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={`${order.id}-${item.productId}-${item.size}-${item.color}`} className="flex items-center gap-2">
                <div className="h-11 w-9 shrink-0 overflow-hidden rounded border-2 border-ink bg-pink-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold">{item.name}</p>
                  <p className="text-[10px] font-medium text-ink/55">
                    {item.size} · {item.color} · ×{item.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* progress rail */}
      <div className="border-t-2 border-dashed border-ink/20 px-5 py-4">
        <div className="flex items-center gap-1">
          {ORDER_FLOW.map((step, i) => {
            const done = i <= stage
            return (
              <div key={step.status} className="flex flex-1 items-center gap-1">
                <div className="flex-1">
                  <div
                    className={`h-2 rounded-full border-2 border-ink transition-colors ${
                      done ? "bg-pink-500" : "bg-white"
                    }`}
                  />
                  <p
                    className={`mt-1.5 truncate text-[9px] font-bold uppercase tracking-wide ${
                      done ? "text-ink" : "text-ink/35"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        {order.trackingNumber && (
          <p className="mt-3 flex items-center gap-2 text-[11px] font-bold">
            <Truck size={12} className="text-pink-500" />
            Tracking {order.trackingNumber}
          </p>
        )}
      </div>

      {expanded && (
        <div className="animate-slide-up border-t-2 border-dashed border-ink/20 bg-pink-50 p-5">
          <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ink/50">
            Full timeline
          </h4>
          <ol className="space-y-2">
            {order.timeline.map((entry, i) => (
              <li key={`${entry.status}-${i}`} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-pink-500 text-white">
                  <Check size={11} />
                </span>
                <div>
                  <p className="text-xs font-bold">
                    {ORDER_FLOW.find((s) => s.status === entry.status)?.label ?? entry.status}
                  </p>
                  <p className="text-[11px] font-medium text-ink/55">
                    {formatDate(entry.at)} · {entry.note}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}