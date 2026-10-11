import Link from "next/link"
import { Megaphone } from "lucide-react"
import { products } from "@/lib/products"

const tiles = [
  { label: "Dog Hoodies", sub: "Up to 50% off", href: "/products?q=hoodie", image: "/photos/dog-hoodie.jpg", span: "col-span-2 lg:col-span-1" },
  { label: "Cat Sweaters", sub: "Soft knits", href: "/products?category=cat", image: "/photos/cat-sweater.jpg", span: "col-span-2 lg:col-span-1" },
  { label: "Raincoats", sub: "Monsoon ready", href: "/products?q=raincoat", image: "/photos/dog-raincoat.jpg", span: "" },
  { label: "Bandanas", sub: "From ₹399", href: "/products?q=bandana", image: "/photos/dog-bandana.jpg", span: "" },
  { label: "Winter Coats", sub: "Thermal lined", href: "/products?q=coat", image: "/photos/dog-winter-coat.jpg", span: "" },
  { label: "Jackets", sub: "Layer up", href: "/products?q=jacket", image: "/photos/dog-jacket.jpg", span: "" },
  { label: "Cat Bandanas", sub: "Slim neck fit", href: "/products?category=cat", image: "/photos/cat-bandana.jpg", span: "" },
  { label: "Accessories", sub: "Hats & ties", href: "/products?q=hat", image: "/photos/dog-hat.jpg", span: "" },
  { label: "Occasion", sub: "Festive & formal", href: "/products?q=festive", image: "/photos/dog-festive-sweater.jpg", span: "" },
]

const brands = Array.from(new Set(products.map((p) => p.brand)))

export default function HomeContent() {
  return (
    <>
      {/* category tiles */}
      <section className="wrap py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl">Shop by Category</h2>
            <p className="mt-2 text-sm font-medium text-ink/60">
              Everything your pet needs to look their best.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden text-xs font-bold uppercase tracking-widest text-pink-600 hover:underline sm:block"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className={`group relative overflow-hidden rounded-sticker border-2 border-ink shadow-sticker transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none ${tile.span}`}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-pink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.image}
                  alt={tile.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-display text-base uppercase leading-tight text-white">
                  {tile.label}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-pink-300">
                  {tile.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* megaphone promo — straight out of the moodboard */}
      <section className="wrap pb-12">
        <div className="relative overflow-hidden rounded-sticker border-2 border-ink bg-pink-500 shadow-sticker-lg">
          <div className="halftone halftone-light absolute inset-0 opacity-25" />
          <div className="paper-crumple absolute -right-10 top-0 h-full w-1/3 opacity-40" />

          <div className="relative flex flex-col items-start gap-6 px-7 py-10 sm:px-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                <Megaphone size={13} className="text-pink-500" />
                Limited time
              </span>
              <h2 className="mt-4 text-3xl uppercase leading-tight text-white sm:text-4xl">
                Extra 10% off your first order
              </h2>
              <p className="mt-3 text-sm font-medium text-white/90">
                Use code{" "}
                <span className="rounded-full border-2 border-ink bg-white px-3 py-1 font-bold text-pink-600">
                  PAWFIRST10
                </span>{" "}
                at checkout. Applies to orders above ₹999.
              </p>
            </div>
            <Link
              href="/products"
              className="btn-white shrink-0"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* brand strip */}
      <section className="border-y-2 border-ink bg-pink-100 py-7">
        <div className="wrap">
          <p className="mb-5 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-ink/50">
            Brands that dress well
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {brands.map((brand) => (
              <span
                key={brand}
                className="font-display text-lg uppercase tracking-tight text-ink/25 transition-colors hover:text-pink-500"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}