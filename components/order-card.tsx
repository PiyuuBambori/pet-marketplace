"use client"

import Link from "next/link"
import {
  Check,
  ChevronRight,
  CircleDot,
  MapPin,
  Package,
  Sparkles,
  Truck,
  X,
} from "lucide-react"
import {
  formatDate,
  formatRupees,
  ORDER_FLOW,
  statusIndex,
  type Order,
} from "@/lib/accounts"

const statusTone: Record<string, string> = {
  placed: "bg-pink-100 border-ink",
  confirmed: "bg-pink-100 border-ink",
  packed: "bg-pink-200 border-ink",
  shipped: "bg-pink-300 border-ink",
  out_for_delivery: "bg-pink-400 border-ink",
  delivered: "bg-success text-white border-ink",
  cancelled: "bg-ink/10 border-ink/30 text-ink/50",
}

export default function OrderCard({
  order,
  onAdvance,
  onCancel,
  viewerRole = "buyer",
}: {
  order: Order
  onAdvance?: (id: string) => void
  onCancel?: (id: string) => void
  /** Only the studio admin sees fulfilment controls. */
  viewerRole?: "admin" | "buyer"
}) {
  const current = statusIndex(order.status)
  const live = order.status !== "delivered" && order.status !== "cancelled"
  const totalUnits = order.items.reduce((n, i) => n + i.quantity, 0)
  const canManage = viewerRole === "admin"

  return (
    <div className="sticker overflow-hidden p-0">
      {/* head */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-ink/20 bg-pink-50 p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display text-lg uppercase">{order.id}</p>
            <span
              className={`tag ${statusTone[order.status]}`}
            >
              {ORDER_FLOW[current].label}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-ink/55">
            Placed {formatDate(order.placedAt)} · {totalUnits} item
            {totalUnits === 1 ? "" : "s"} ·{" "}
            {formatRupees(order.total)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && live && (
            <>
              {onAdvance && (
                <button
                  onClick={() => onAdvance(order.id)}
                  title="Move this order to the next fulfilment stage"
                  className="btn-white btn-sm"
                >
                  <Sparkles size={13} />
                  {ORDER_FLOW[current + 1]?.status === "shipped"
                    ? "Ship order"
                    : `Mark ${ORDER_FLOW[current + 1]?.label ?? "next"}`}
                </button>
              )}
              {onCancel && (
                <button
                  onClick={() => onCancel(order.id)}
                  className="btn btn-sm border-ink/30 bg-white text-ink/60 hover:bg-ink hover:text-white"
                >
                  <X size={13} /> Cancel
                </button>
              )}
            </>
          )}
          {!canManage && live && (
            <span className="tag border-ink/30 bg-white text-ink/50">
              Processing
            </span>
          )}
        </div>
      </div>

      {/* body */}
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          {/* items */}
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={`${order.id}-${item.productId}-${item.size}-${item.color}`}>
                <Link
                  href={`/products/${item.productId}`}
                  className="group flex items-center gap-3"
                >
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-pink-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                    {item.quantity > 1 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-ink bg-pink-500 px-1 text-[10px] font-bold text-white">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-pink-600">
                      {item.brand}
                    </p>
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p className="text-xs font-medium text-ink/55">
                      {item.size} · {item.color}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold">
                    {formatRupees(item.price * item.quantity)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* tracking */}
          {order.status !== "cancelled" && (
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest">
                  Tracking
                </h4>
                {order.trackingNumber && (
                  <span className="tag bg-pink-500 text-white">
                    <Truck size={11} /> {order.trackingNumber}
                  </span>
                )}
              </div>

              <ol className="space-y-0">
                {ORDER_FLOW.map((step, i) => {
                  const done = i <= current
                  const stamp = order.timeline.find(
                    (t) => t.status === step.status
                  )
                  const isLast = i === ORDER_FLOW.length - 1

                  return (
                    <li key={step.status} className="flex gap-3.5">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            done
                              ? "border-ink bg-pink-500 text-white"
                              : "border-ink/25 bg-white text-transparent"
                          }`}
                        >
                          {i === current && order.status !== "delivered" ? (
                            <CircleDot size={13} className="animate-spin-slow" />
                          ) : (
                            <Check size={13} />
                          )}
                        </span>
                        {!isLast && (
                          <span
                            className={`w-0.5 flex-1 ${i < current ? "bg-pink-500" : "bg-ink/15"}`}
                          />
                        )}
                      </div>
                      <div className="pb-5">
                        <p
                          className={`text-sm font-bold ${done ? "text-ink" : "text-ink/35"}`}
                        >
                          {step.label}
                        </p>
                        {stamp && (
                          <p className="text-xs font-medium text-ink/55">
                            {formatDate(stamp.at)} · {stamp.note}
                          </p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}

          {order.status === "cancelled" && (
            <p className="mt-5 rounded-full border-2 border-ink/30 bg-ink/5 px-4 py-2.5 text-sm font-bold text-ink/60">
              This order was cancelled. Your payment will be refunded within
              5–7 working days.
            </p>
          )}
        </div>

        {/* side */}
        <aside className="space-y-4">
          <div className="rounded-xl border-2 border-ink bg-pink-50 p-4">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
              <MapPin size={13} className="text-pink-500" /> Delivery to
            </h4>
            <p className="mt-2 text-sm font-bold">{order.address.fullName}</p>
            <p className="text-xs font-medium leading-relaxed text-ink/60">
              {order.address.line1}
              {order.address.line2 && <>, {order.address.line2}</>}
              <br />
              {order.address.city}, {order.address.state} {order.address.zip}
              <br />
              {order.address.country}
            </p>
            <p className="mt-2 text-xs font-semibold">{order.address.phone}</p>
          </div>

          <div className="rounded-xl border-2 border-ink bg-white p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest">
              Payment summary
            </h4>
            <dl className="mt-3 space-y-2 text-xs font-medium">
              <div className="flex justify-between">
                <dt className="text-ink/55">Subtotal</dt>
                <dd className="font-bold">{formatRupees(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/55">Discount</dt>
                <dd className="font-bold text-success">
                  − {formatRupees(order.discount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/55">Shipping</dt>
                <dd className="font-bold">
                  {order.shipping === 0 ? "FREE" : formatRupees(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/55">GST</dt>
                <dd className="font-bold">{formatRupees(order.tax)}</dd>
              </div>
              <div className="flex justify-between border-t-2 border-dashed border-ink/20 pt-2 text-sm">
                <dt className="font-bold">Total</dt>
                <dd className="font-bold">{formatRupees(order.total)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] font-semibold text-ink/50">
              Paid via {order.paymentMethod}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-ink/50">
              Arriving by {formatDate(order.estimatedDelivery)}
            </p>
          </div>

          <Link
            href={`/products/${order.items[0].productId}`}
            className="btn-white btn-sm w-full"
          >
            <Package size={13} /> Reorder
            <ChevronRight size={13} />
          </Link>
        </aside>
      </div>
    </div>
  )
}