export type Role = "admin" | "buyer"

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"

export type OrderItem = {
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

export type Address = {
  fullName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  zip: string
  country: string
}

/** Mirrors a row of public."User" — credentials live in Supabase Auth. */
export type Account = {
  id: string
  email: string
  name: string | null
  phone: string | null
  avatar: string
  role: Role
  createdAt: number
  addresses: Address[]
}

export type TimelineEntry = { status: string; at: string; note: string }

export type Order = {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  subtotal: number
  shipping: number
  tax: number
  discount: number
  status: OrderStatus
  placedAt: number
  estimatedDelivery: number
  address: Address
  paymentMethod: string
  trackingNumber: string | null
  timeline: TimelineEntry[]
}

export const AVATARS = [
  "🩷", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
  "🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🦄", "🐥",
  "🌸", "🌈", "⭐", "🍓", "🧁", "🎀", "🎈", "🌻",
]

export const ORDER_FLOW = [
  { status: "placed", label: "Order Placed", note: "We received your order." },
  { status: "confirmed", label: "Confirmed", note: "Payment verified." },
  { status: "packed", label: "Packed", note: "Wrapped and ready to ship." },
  { status: "shipped", label: "Shipped", note: "On its way to you." },
  { status: "out_for_delivery", label: "Out for Delivery", note: "Arriving today." },
  { status: "delivered", label: "Delivered", note: "Enjoy the new outfit!" },
] as const

export function statusIndex(status: string): number {
  const i = ORDER_FLOW.findIndex((s) => s.status === status)
  return i === -1 ? 0 : i
}

export function statusLabel(status: string): string {
  return ORDER_FLOW[statusIndex(status)].label
}

export function formatRupees(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`
}

export function formatDate(ts: number | string) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(ts: number | string) {
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function makeOrderId() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5)
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5)
  return `PW-${stamp}${rand}`
}

export function makeTrackingNumber() {
  const n = Math.floor(Math.random() * 900000000) + 100000000
  return `PWX${n}IN`
}
