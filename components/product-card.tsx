"use client"

import Link from "next/link"
import { Heart, Star } from "lucide-react"
import { type Product, discount, formatPrice } from "@/lib/products"

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product
  priority?: boolean
}) {
  const off = discount(product.price, product.mrp)

  return (
    <Link href={`/products/${product.id}`} className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sticker border-2 border-ink bg-pink-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
        />

        {/* discount sticker */}
        <span className="absolute left-2.5 top-2.5 -rotate-6 rounded-full border-2 border-ink bg-pink-500 px-2.5 py-1 text-[11px] font-bold uppercase text-white shadow-sticker-sm">
          {off}% off
        </span>

        {/* wishlist */}
        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={(e) => e.preventDefault()}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-white opacity-0 transition-all hover:bg-pink-500 hover:text-white focus:opacity-100 group-hover:opacity-100"
        >
          <Heart size={16} />
        </button>

        {/* hover cta */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-pink-500 px-3 py-2.5 text-center transition-transform duration-300 group-hover:translate-y-0">
          <span className="text-[11px] font-bold uppercase tracking-widest text-white">
            View Product
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-pink-600">
          {product.brand}
        </p>
        <h3 className="mt-0.5 line-clamp-1 text-sm font-bold">{product.name}</h3>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-base font-bold">{formatPrice(product.price)}</span>
          <span className="text-xs font-medium text-ink/45 line-through">
            {formatPrice(product.mrp)}
          </span>
        </div>

        {product.rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="rating-pill">
              {product.rating}
              <Star size={10} fill="currentColor" />
            </span>
            <span className="text-[11px] font-medium text-ink/50">
              {product.ratingCount.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color.name}
              title={color.name}
              style={{ backgroundColor: color.hex }}
              className="h-4 w-4 rounded-full border border-ink/25"
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-[11px] font-medium text-ink/50">
              +{product.colors.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}