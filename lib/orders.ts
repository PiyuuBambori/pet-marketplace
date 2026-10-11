export const ORDER_FLOW = [
  { status: "placed", label: "Order Placed", note: "We received your order." },
  { status: "confirmed", label: "Confirmed", note: "Payment verified." },
  { status: "packed", label: "Packed", note: "Wrapped and ready to ship." },
  { status: "shipped", label: "Shipped", note: "On its way to you." },
  { status: "out_for_delivery", label: "Out for Delivery", note: "Arriving today." },
  { status: "delivered", label: "Delivered", note: "Enjoy the new outfit!" },
] as const

export type OrderFlowStatus = (typeof ORDER_FLOW)[number]["status"]

export function statusIndex(status: string): number {
  const i = ORDER_FLOW.findIndex((step) => step.status === status)
  return i === -1 ? 0 : i
}

export function statusLabel(status: string): string {
  const found = ORDER_FLOW.find((step) => step.status === status)
  return found?.label ?? status
}

export function nextStatus(status: string): OrderFlowStatus | null {
  const i = statusIndex(status)
  return i < ORDER_FLOW.length - 1 ? ORDER_FLOW[i + 1].status : null
}

export type TimelineEntry = { status: string; at: string; note: string }