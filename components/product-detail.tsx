"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Heart,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react"
import SizeChart from "@/components/size-chart"
import ProductCard from "@/components/product-card"
import { useCart } from "@/components/cart-provider"
import {
  discount,
  formatPrice,
  type Product,
} from "@/lib/products"

const assurances = [
  { icon: Truck, text: "Delivery in 4–6 days" },
  { icon: RotateCcw, text: "30-day returns" },
  { icon: ShieldCheck, text: "Secure payment" },
]

export default function ProductDetailView({
  product,
  similar = [],
}: {
  product: Product
  similar?: Product[]
}) {
  const { addItem, lines } = useCart()

  const [size, setSize] = useState<string>("")
  const [color, setColor] = useState(product.colors[0].name)
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [added, setAdded] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const off = discount(product.price, product.mrp)

  const alreadyInBag = lines.some(
    (line) => line.productId === product.id && line.size === size
  )

  const addToBag = useCallback(() => {
    if (!size) {
      setSizeError(true)
      return
    }
    addItem({ product, size, color, quantity: qty })
    setAdded(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(false), 2200)
  }, [addItem, product, size, color, qty])

  return (
    <main className="wrap py-6">
      <nav className="mb-6 text-xs font-semibold text-ink/50">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-pink-500">
              Home
            </Link>
          </li>
          <span>/</span>
          <li>
            <Link
              href={`/products?category=${product.category}`}
              className="capitalize hover:text-pink-500"
            >
              {product.category === "dog" ? "Dogs" : "Cats"}
            </Link>
          </li>
          <span>/</span>
          <li className="truncate text-ink">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
        {/* gallery */}
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-sticker border-2 border-ink bg-pink-100 shadow-sticker">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <span className="absolute left-4 top-4 -rotate-6 rounded-full border-2 border-ink bg-pink-500 px-3 py-1.5 text-xs font-bold uppercase text-white shadow-sticker-sm">
              {off}% off
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            <div className="relative h-20 w-16 overflow-hidden rounded-lg border-2 border-ink bg-pink-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {["Front", "Back", "Detail"].map((label) => (
              <div
                key={label}
                className="flex h-20 w-16 items-center justify-center rounded-lg border-2 border-dashed border-ink/25 text-[9px] font-bold uppercase text-ink/40"
              >
                {label}
              </div>
            ))}
          </div>

          {/* details */}
          <section className="mt-10 border-t-2 border-dashed border-ink/20 pt-8">
            <h2 className="mb-3 text-lg uppercase">Product details</h2>
            <p className="text-sm font-medium leading-relaxed text-ink/70">
              {product.description}
            </p>

            <h3 className="mt-6 mb-2 text-sm uppercase">Highlights</h3>
            <ul className="space-y-1.5">
              {product.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex gap-2 text-sm font-medium text-ink/70"
                >
                  <Check size={15} className="mt-0.5 shrink-0 text-pink-500" />
                  {highlight}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-ink bg-pink-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  Fabric
                </p>
                <p className="mt-1 text-sm font-bold">{product.fabric}</p>
              </div>
              <div className="rounded-xl border-2 border-ink bg-pink-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  Care
                </p>
                <p className="mt-1 text-sm font-bold">{product.care}</p>
              </div>
            </div>
          </section>
        </div>

        {/* buy box */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-pink-600">
            {product.brand}
          </p>
          <h1 className="mt-1.5 text-2xl uppercase leading-tight">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2.5">
            <span className="rating-pill">
              {product.rating}
              <Star size={11} fill="currentColor" />
            </span>
            <span className="text-xs font-semibold text-ink/50">
              {product.ratingCount.toLocaleString("en-IN")} ratings
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl">{formatPrice(product.price)}</span>
            <span className="text-base font-medium text-ink/45 line-through">
              {formatPrice(product.mrp)}
            </span>
            <span className="rounded-full border-2 border-ink bg-pink-500 px-2.5 py-0.5 text-xs font-bold text-white">
              {off}% off
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-ink/45">
            Inclusive of all taxes
          </p>

          {/* colour */}
          <section className="mt-7">
            <h3 className="mb-2.5 text-xs font-bold uppercase tracking-widest">
              Colour:{" "}
              <span className="font-semibold normal-case tracking-normal text-ink/60">
                {color}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  title={c.name}
                  aria-label={c.name}
                  className={`h-10 w-10 rounded-full border-2 border-ink transition-transform hover:scale-110 ${
                    color === c.name
                      ? "shadow-sticker-sm"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </section>

          {/* size */}
          <section className="mt-7">
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest">
                Size{" "}
                {size && (
                  <span className="font-semibold normal-case tracking-normal text-ink/60">
                    {size}
                  </span>
                )}
              </h3>
              <Link
                href="/size-guide"
                className="text-[11px] font-bold uppercase tracking-widest text-pink-600 hover:underline"
              >
                Size chart
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s)
                    setSizeError(false)
                  }}
                  className={`chip h-11 min-w-[3.25rem] text-sm ${size === s ? "chip-on" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="mt-2 text-xs font-bold text-pink-600">
                Please pick a size first.
              </p>
            )}
          </section>

          {/* qty */}
          <section className="mt-7 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border-2 border-ink bg-white">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-3 text-ink/50 transition-colors hover:text-pink-500"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                aria-label="Increase quantity"
                className="p-3 text-ink/50 transition-colors hover:text-pink-500"
              >
                <Plus size={14} />
              </button>
            </div>
            <p className="text-sm font-medium text-ink/60">
              Total{" "}
              <span className="font-bold text-ink">
                {formatPrice(product.price * qty)}
              </span>
            </p>
          </section>

          {/* actions */}
          <div className="mt-6 space-y-3">
            <button
              onClick={addToBag}
              className={`w-full ${added ? "btn-ink" : "btn-pink"}`}
            >
              {added ? (
                <>
                  <Check size={17} /> Added to bag
                </>
              ) : (
                <>
                  <ShoppingBag size={17} /> Add to bag
                </>
              )}
            </button>
            <button
              onClick={() => setWishlisted((v) => !v)}
              className="btn-white w-full"
            >
              <Heart size={17} fill={wishlisted ? "currentColor" : "none"} />
              {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
            </button>
          </div>

          {alreadyInBag && size && (
            <p className="mt-3 rounded-full border-2 border-ink bg-pink-100 px-4 py-2 text-center text-xs font-bold">
              This size is already in your bag.
            </p>
          )}

          <Link
            href="/cart"
            className="mt-3 block text-center text-[11px] font-bold uppercase tracking-widest text-pink-600 hover:underline"
          >
            Go to bag
          </Link>

          {/* assurances */}
          <ul className="mt-6 space-y-2.5 border-t-2 border-dashed border-ink/20 pt-5">
            {assurances.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2.5 text-sm font-medium text-ink/65"
              >
                <Icon size={16} className="shrink-0 text-pink-500" />
                {text}
              </li>
            ))}
          </ul>

          <section className="mt-8 border-t-2 border-dashed border-ink/20 pt-6">
            <SizeChart
              product={product}
              selectedSize={size}
              onSelectSize={(s) => {
                setSize(s)
                setSizeError(false)
              }}
            />
          </section>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16 border-t-2 border-dashed border-ink/20 pt-10">
          <h2 className="mb-6 text-xl uppercase">
            Similar {product.category === "dog" ? "dog" : "cat"} products
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {similar.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}