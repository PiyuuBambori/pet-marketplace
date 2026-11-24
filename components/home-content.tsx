import Link from "next/link"
import { Megaphone } from "lucide-react"
import { type Product } from "@/lib/products"

const values = [
  "Made to order",
  "Sizes XXS–XL",
  "Handmade in India",
  "Small-batch prints",
]

export default function HomeContent({ products }: { products: Product[] }) {
  const tiles = products.slice(0, 5).map((product) => ({
    label: product.name,
    sub: `${product.colors[0]?.name ?? "Print"} · ${product.sizes[0]}–${
      product.sizes[product.sizes.length - 1]
    }`,
    href: `/products/${product.id}`,
    image: product.image,
  }))

  return (
    <>
      {/* collection tiles */}
      <section className="wrap py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl">Shop the Collection</h2>
            <p className="mt-2 text-sm font-medium text-ink/60">
              Five prints. One very good dog dress.
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
              className="group relative overflow-hidden rounded-sticker border-2 border-ink shadow-sticker transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
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
                The debut drop
              </span>
              <h2 className="mt-4 text-3xl uppercase leading-tight text-white sm:text-4xl">
                Dress-up, sorted
              </h2>
              <p className="mt-3 text-sm font-medium text-white/90">
                The first DOOM collection is here: green animal print, red
                bandana paisley, pink foxes, sunny checks and yellow polka dots.
              </p>
            </div>
            <Link href="/products" className="btn-white shrink-0">
              Shop all five
            </Link>
          </div>
        </div>
      </section>

      {/* value strip */}
      <section className="border-y-2 border-ink bg-pink-100 py-7">
        <div className="wrap">
          <p className="mb-5 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-ink/50">
            The DOOM debut collection
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {values.map((value) => (
              <span
                key={value}
                className="font-display text-lg uppercase tracking-tight text-ink/25 transition-colors hover:text-pink-500"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
