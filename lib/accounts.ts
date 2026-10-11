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
  timeline: { status: OrderStatus; at: number; note: string }[]
}

export type Account = {
  id: string
  name: string
  email: string
  /** intentionally not persisted in plaintext-readable form for buyer accounts */
  passwordHash: string
  role: Role
  avatar: string
  phone: string
  createdAt: number
  addresses: Address[]
}

/** A design saved from the Seller Studio, stored locally for the admin. */
export type SavedDesign = {
  id: string
  brand: string | null
  title: string
  description: string
  imageUrl: string
  category: string
  garmentType: string
  sizes: string[]
  colors: string[]
  price: number
  mrp: number | null
  createdAt: number
}

/** The single, permanent admin account. Cannot be deleted or demoted. */
export const ADMIN_EMAIL = "admin@doom.shop"

export const PERMANENT_ADMIN = {
  id: "acc_admin_permanent",
  name: "Studio Admin",
  email: ADMIN_EMAIL,
  passwordHash: "admin-doom-2024",
  role: "admin" as Role,
  avatar: "👑",
  phone: "+91 90000 00000",
  createdAt: 0,
  addresses: [],
}

export const ADMIN_PASSWORD = "admin123"

export function canLoginAsAdmin(email: string, password: string) {
  return (
    email.trim().toLowerCase() === ADMIN_EMAIL &&
    password === ADMIN_PASSWORD
  )
}

export const AVATARS = [
  "🩷", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
  "🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🦄", "🐥",
  "🌸", "🌈", "⭐", "🍓", "🧁", "🎀", "🎈", "🌻",
]

export const orderFlow: {
  status: OrderStatus
  label: string
  note: string
}[] = [
  { status: "placed", label: "Order Placed", note: "We received your order." },
  { status: "confirmed", label: "Confirmed", note: "Payment verified." },
  { status: "packed", label: "Packed", note: "Wrapped and ready to ship." },
  { status: "shipped", label: "Shipped", note: "On its way to you." },
  {
    status: "out_for_delivery",
    label: "Out for Delivery",
    note: "Arriving today.",
  },
  { status: "delivered", label: "Delivered", note: "Enjoy the new outfit!" },
]

export function statusIndex(status: OrderStatus) {
  const i = orderFlow.findIndex((s) => s.status === status)
  return i === -1 ? 0 : i
}

export function statusLabel(status: OrderStatus) {
  return orderFlow[statusIndex(status)].label
}

export function formatRupees(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`
}

export function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(ts: number) {
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