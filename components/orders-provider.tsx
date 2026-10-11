"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { Order } from "@/lib/accounts"
import { useAccounts } from "@/components/account-provider"

type OrdersContextValue = {
  loading: boolean
  orders: HydratedOrder[]
  myOrders: Order[]
  refresh: () => Promise<void>
  advanceOrder: (orderId: string) => Promise<void>
  cancelOrder: (orderId: string) => Promise<void>
}

const OrdersContext = createContext<OrdersContextValue | null>(null)

/** Buyer profile joined onto orders by the admin endpoint. */
export type OrderBuyer = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  avatar: string | null
}

/**
 * An Order plus the admin-only `buyer` relation. The buyer endpoint does not
 * return this, so consumers must treat it as optional.
 */
export type HydratedOrder = Order & { buyer?: OrderBuyer }

type DbOrder = {
  id: string
  userId: string
  status: string
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  paymentMethod: string | null
  trackingNumber: string | null
  shippingAddress: unknown
  estimatedDelivery: string | null
  timeline: unknown
  createdAt: string
  user?: OrderBuyer | null
  items: {
    designId: string
    name: string
    brand: string | null
    image: string | null
    mrp: number | null
    size: string
    color: string
    quantity: number
    price: number
  }[]
}

function normalise(row: DbOrder): HydratedOrder {
  const address = (row.shippingAddress ?? {}) as Order["address"]
  return {
    id: row.id,
    userId: row.userId,
    items: row.items.map((item) => ({
      productId: item.designId,
      name: item.name,
      brand: item.brand ?? "Doom",
      image: item.image ?? "",
      price: item.price,
      mrp: item.mrp ?? item.price,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    })),
    total: row.total,
    subtotal: row.subtotal,
    shipping: row.shipping,
    tax: row.tax,
    discount: row.discount,
    status: row.status as Order["status"],
    placedAt: new Date(row.createdAt).getTime(),
    estimatedDelivery: row.estimatedDelivery
      ? new Date(row.estimatedDelivery).getTime()
      : 0,
    address: {
      fullName: address.fullName ?? "",
      phone: address.phone ?? "",
      line1: address.line1 ?? "",
      line2: address.line2 ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      zip: address.zip ?? "",
      country: address.country ?? "India",
    },
    paymentMethod: row.paymentMethod ?? "Card",
    trackingNumber: row.trackingNumber,
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    // Present only on the admin endpoint; the buyer route omits it entirely.
    buyer: row.user ?? undefined,
  }
}

/**
 * Orders live in Postgres, never in localStorage. Admin endpoints are used for
 * the fulfilment board; buyers read their own from the same route with the
 * session cookie deciding what they see.
 */
export function OrdersProvider({ children }: { children: React.ReactNode }) {
  // Auth state is read here rather than passed in: this is a Client
  // Component, so consuming the account context directly avoids crossing the
  // server/client boundary with values (which broke prerendering).
  const { user, isAdmin, hydrated } = useAccounts()
  const isSignedIn = Boolean(user)

  const [orders, setOrders] = useState<HydratedOrder[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setOrders([])
      return
    }
    setLoading(true)
    try {
      const endpoint = isAdmin ? "/api/admin/orders" : "/api/account/orders"
      const res = await fetch(endpoint, { cache: "no-store" })
      if (!res.ok) throw new Error()
      const data: DbOrder[] = await res.json()
      setOrders(data.map(normalise))
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin, isSignedIn])

  useEffect(() => {
    if (hydrated) void refresh()
  }, [refresh, hydrated])

  const mutate = useCallback(
    async (orderId: string, action: "advance" | "cancel") => {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      })
      if (!res.ok) return
      await refresh()
    },
    [refresh]
  )

  const advanceOrder = useCallback(
    (orderId: string) => mutate(orderId, "advance"),
    [mutate]
  )

  const cancelOrder = useCallback(
    (orderId: string) => mutate(orderId, "cancel"),
    [mutate]
  )

  const value = useMemo<OrdersContextValue>(
    () => ({
      loading,
      orders,
      myOrders: orders,
      refresh,
      advanceOrder,
      cancelOrder,
    }),
    [loading, orders, refresh, advanceOrder, cancelOrder]
  )

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error("useOrders must be used inside OrdersProvider")
  return ctx
}