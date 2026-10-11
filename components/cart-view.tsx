"use client"

import Link from "next/link"
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight, Truck } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatPrice } from "@/lib/products"

const FREE_SHIPPING_THRESHOLD = 1499
const SHIPPING_FEE = 79

export default function CartView() {
  const { lines, subtotal, savings, updateQuantity, removeItem } = useCart()

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + shipping + tax
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  if (lines.length === 0) {
    return (
      <main className="wrap py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <span className="animate-bob text-5xl">🛍️</span>
          <h1 className="text-2xl uppercase">Your bag is empty</h1>
          <p className="text-sm font-medium text-ink/60">
            Nothing here yet. Find something your pet will actually wear.
          </p>
          <Link href="/products" className="btn-pink mt-2">
            Start shopping <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="wrap py-8">
      <header className="mb-6 border-b-2 border-dashed border-ink/20 pb-5">
        <h1 className="text-3xl uppercase sm:text-4xl">Shopping bag</h1>
        <p className="mt-1.5 text-sm font-semibold text-ink/55">
          {lines.length} item{lines.length === 1 ? "" : "s"}
        </p>
      </header>

      {/* free shipping bar */}
      <div className="mb-8 rounded-sticker border-2 border-ink bg-pink-100 p-4">
        <div className="flex items-center gap-2.5">
          <Truck size={18} className="shrink-0 text-pink-500" />
          {remaining > 0 ? (
            <p className="text-sm font-bold">
              Add{" "}
              <span className="text-pink-600">{formatPrice(remaining)}</span> more
              for free shipping
            </p>
          ) : (
            <p className="text-sm font-bold text-success">
              🎉 You unlocked free shipping
            </p>
          )}
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-white">
          <div
            className="h-full rounded-full bg-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <ul className="space-y-5">
          {lines.map((line) => (
            <li key={line.key} className="flex gap-4">
              <Link
                href={`/products/${line.productId}`}
                className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-pink-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={line.image}
                  alt={line.name}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-600">
                  {line.brand}
                </p>
                <Link
                  href={`/products/${line.productId}`}
                  className="mt-0.5 truncate text-sm font-bold hover:text-pink-600"
                >
                  {line.name}
                </Link>
                <p className="mt-1 text-xs font-semibold text-ink/55">
                  {line.size} · {line.color}
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                  <div className="flex items-center rounded-full border-2 border-ink bg-white">
                    <button
                      onClick={() => updateQuantity(line.key, line.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="p-2 text-ink/50 hover:text-pink-500"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(line.key, line.quantity + 1)}
                      aria-label="Increase quantity"
                      className="p-2 text-ink/50 hover:text-pink-500"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="ml-auto text-right">
                    <p className="text-sm font-bold">
                      {formatPrice(line.price * line.quantity)}
                    </p>
                    {line.mrp !== line.price && (
                      <p className="text-xs font-medium text-ink/45 line-through">
                        {formatPrice(line.mrp * line.quantity)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeItem(line.key)}
                    aria-label={`Remove ${line.name}`}
                    className="p-2 text-ink/40 transition-colors hover:text-pink-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-sticker border-2 border-ink bg-white p-6 shadow-sticker lg:sticky lg:top-32">
          <h2 className="mb-5 text-lg uppercase">
            Price details ({lines.length})
          </h2>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="font-medium text-ink/55">Total MRP</dt>
              <dd className="font-medium text-ink/55 line-through">
                {formatPrice(subtotal + savings)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-ink/55">Discount on MRP</dt>
              <dd className="font-bold text-success">
                − {formatPrice(savings)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-ink/55">Shipping</dt>
              <dd
                className={
                  shipping === 0 ? "font-bold text-success" : "font-bold"
                }
              >
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-ink/55">GST (8%)</dt>
              <dd className="font-bold">{formatPrice(tax)}</dd>
            </div>
            <div className="flex justify-between border-t-2 border-dashed border-ink/20 pt-3">
              <dt className="font-display text-lg uppercase">Total</dt>
              <dd className="font-display text-lg">
                {formatPrice(total)}
              </dd>
            </div>
          </dl>

          <Link href="/checkout" className="btn-pink mt-6 w-full">
            <ShoppingBag size={16} /> Place order
          </Link>
          <p className="mt-3 text-center text-[11px] font-semibold text-ink/50">
            Secure checkout · Free 30-day returns
          </p>
        </aside>
      </div>
    </main>
  )
}