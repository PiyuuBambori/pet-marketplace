import Link from "next/link"
import { Sparkles } from "lucide-react"
import ProductCard from "@/components/product-card"
import { discount, formatPrice, type Product } from "@/lib/products"

export default function ProductRail({
  title,
  subtitle,
  href,
  items,
  tone = "plain",
}: {
  title: string
  subtitle?: string
  href: string
  items: Product[]
  tone?: "plain" | "tinted"
}) {
  return (
    <section className={`wrap py-12 ${tone === "tinted" ? "bg-pink-100" : ""}`}>
      <div className="mb-6 flex items-end justify-between border-b-2 border-dashed border-ink/20 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl uppercase sm:text-3xl">
            {tone === "tinted" && <Sparkles size={20} className="text-pink-500" />}
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 text-sm font-medium text-ink/60">{subtitle}</p>
          )}
        </div>
        <Link
          href={href}
          className="shrink-0 text-xs font-bold uppercase tracking-widest text-pink-600 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="rail -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
        {items.map((product) => (
          <div
            key={product.id}
            className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[19%]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function DealRail({ products }: { products: Product[] }) {
  const deals = [...products]
    .sort((a, b) => discount(b.price, b.mrp) - discount(a.price, a.mrp))
    .slice(0, 8)

  return (
    <section className="wrap py-12">
      <div className="mb-6 flex items-end justify-between border-b-2 border-dashed border-ink/20 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl uppercase sm:text-3xl">Biggest Discounts</h2>
          <span className="burst flex h-9 w-9 items-center justify-center bg-pink-500">
            <span className="text-[9px] font-bold uppercase text-white">Hot</span>
          </span>
        </div>
        <Link
          href="/products?sort=discount"
          className="shrink-0 text-xs font-bold uppercase tracking-widest text-pink-600 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {deals.map((product) => {
          const off = discount(product.price, product.mrp)
          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group relative overflow-hidden rounded-sticker border-2 border-ink shadow-sticker transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-pink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute left-2.5 top-2.5 -rotate-6 rounded-full border-2 border-ink bg-pink-500 px-2.5 py-1 text-[11px] font-bold uppercase text-white shadow-sticker-sm">
                  {off}% off
                </span>
              </div>
              <div className="border-t-2 border-ink bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-600">
                  {product.brand}
                </p>
                <h3 className="mt-0.5 line-clamp-1 text-sm font-bold">{product.name}</h3>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                  <span className="text-xs font-medium text-ink/45 line-through">
                    {formatPrice(product.mrp)}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}