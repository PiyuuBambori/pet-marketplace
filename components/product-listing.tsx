"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, SlidersHorizontal, X, Search } from "lucide-react"
import ProductCard from "@/components/product-card"
import { type Product } from "@/lib/products"

const sizeOrder = [
  "XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "One Size",
]

function uniqueSizes(products: Product[]) {
  return Array.from(new Set(products.flatMap((p) => p.sizes))).sort(
    (a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)
  )
}

function uniqueColors(products: Product[]) {
  return Array.from(
    new Map(products.flatMap((p) => p.colors).map((c) => [c.name, c])).values()
  )
}

type SortKey =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "discount"
  | "rating"
  | "new"

const sortLabels: Record<SortKey, string> = {
  recommended: "Recommended",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  discount: "Better Discount",
  rating: "Customer Rating",
  new: "Newest First",
}

export default function ProductListing({ products }: { products: Product[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const brands = Array.from(new Set(products.map((p) => p.brand))).sort()
  const allSizes = uniqueSizes(products)
  const allColors = uniqueColors(products)

  const [category, setCategory] = useState(params.get("category") ?? "")
  const [brandSet, setBrandSet] = useState<Set<string>>(new Set())
  const [sizeSet, setSizeSet] = useState<Set<string>>(new Set())
  const [colorSet, setColorSet] = useState<Set<string>>(new Set())
  const [discountOnly, setDiscountOnly] = useState(false)
  const [maxPrice, setMaxPrice] = useState(3000)
  const [sort, setSort] = useState<SortKey>("recommended")
  const [mobileFilters, setMobileFilters] = useState(false)

  const query = params.get("q") ?? ""

  useEffect(() => {
    setCategory(params.get("category") ?? "")
  }, [params])

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category && p.category !== category) return false
      if (query) {
        const haystack =
          `${p.name} ${p.brand} ${p.garment} ${p.category}`.toLowerCase()
        if (!haystack.includes(query.toLowerCase())) return false
      }
      if (brandSet.size && !brandSet.has(p.brand)) return false
      if (sizeSet.size && !p.sizes.some((s) => sizeSet.has(s))) return false
      if (colorSet.size && !p.colors.some((c) => colorSet.has(c.name)))
        return false
      if (discountOnly && p.mrp - p.price < 500) return false
      if (p.price > maxPrice) return false
      return true
    })

    list = [...list]
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        list.sort((a, b) => b.price - a.price)
        break
      case "discount":
        list.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp)
        break
      case "rating":
        list.sort((a, b) => b.rating - a.rating)
        break
      case "new":
        list.sort((a, b) => Number(b.id) - Number(a.id))
        break
    }
    return list
  }, [products, category, query, brandSet, sizeSet, colorSet, discountOnly, maxPrice, sort])

  const activeCount =
    brandSet.size +
    sizeSet.size +
    colorSet.size +
    (discountOnly ? 1 : 0) +
    (maxPrice < 3000 ? 1 : 0) +
    (category ? 1 : 0)

  function toggle(set: Set<string>, value: string, setter: (s: Set<string>) => void) {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    setter(next)
  }

  function clearAll() {
    setBrandSet(new Set())
    setSizeSet(new Set())
    setColorSet(new Set())
    setDiscountOnly(false)
    setMaxPrice(3000)
    router.replace(pathname)
  }

  const filterPanel = (
    <div className="space-y-7">
      {category && (
        <section>
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Pet type
          </h3>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
            <input
              type="checkbox"
              checked
              onChange={() => router.replace(pathname)}
              className="h-4 w-4 accent-[#ff2e88]"
            />
            <span className="rounded-full border-2 border-ink bg-pink-500 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
              {category === "dog" ? "Dogs" : "Cats"}
            </span>
          </label>
        </section>
      )}

      <section>
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
          Brand
        </h3>
        <ul className="space-y-2.5">
          {brands.map((brand) => (
            <li key={brand}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink/70 hover:text-ink">
                <input
                  type="checkbox"
                  checked={brandSet.has(brand)}
                  onChange={() => toggle(brandSet, brand, setBrandSet)}
                  className="h-4 w-4 accent-[#ff2e88]"
                />
                {brand}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
          Size
        </h3>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => (
            <button
              key={size}
              onClick={() => toggle(sizeSet, size, setSizeSet)}
              className={`chip h-9 min-w-[2.75rem] px-3 py-0 text-xs ${
                sizeSet.has(size) ? "chip-on" : ""
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <a
          href="/size-guide"
          className="mt-3 inline-block text-[11px] font-bold uppercase tracking-widest text-pink-600 hover:underline"
        >
          Size guide
        </a>
      </section>

      <section>
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
          Colour
        </h3>
        <ul className="space-y-2.5">
          {allColors.map((color) => (
            <li key={color.name}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink/70 hover:text-ink">
                <input
                  type="checkbox"
                  checked={colorSet.has(color.name)}
                  onChange={() => toggle(colorSet, color.name, setColorSet)}
                  className="h-4 w-4 accent-[#ff2e88]"
                />
                <span
                  style={{ backgroundColor: color.hex }}
                  className="h-4 w-4 rounded-full border border-ink/25"
                />
                {color.name}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
          Price
        </h3>
        <input
          type="range"
          min={300}
          max={3000}
          step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#ff2e88]"
        />
        <p className="mt-2 text-sm font-bold">Up to ₹{maxPrice}</p>
      </section>

      <section>
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
          Discount
        </h3>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink/70 hover:text-ink">
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(e) => setDiscountOnly(e.target.checked)}
            className="h-4 w-4 accent-[#ff2e88]"
          />
          40% and above
        </label>
      </section>

      {activeCount > 0 && (
        <button onClick={clearAll} className="btn-ink btn-sm w-full">
          <X size={13} /> Clear all ({activeCount})
        </button>
      )}
    </div>
  )

  const heading = query
    ? `Results for "${query}"`
    : category === "cat"
      ? "Cat Apparel"
      : category === "dog"
        ? "Dog Apparel"
        : "All Products"

  return (
    <div className="wrap py-8">
      <nav className="mb-5 text-xs font-semibold text-ink/50">
        <ol className="flex items-center gap-2">
          <li>
            <a href="/" className="hover:text-pink-500">
              Home
            </a>
          </li>
          <span>/</span>
          <li className="text-ink">{heading}</li>
        </ol>
      </nav>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-2 border-dashed border-ink/20 pb-5">
        <div>
          <h1 className="text-3xl uppercase sm:text-4xl">{heading}</h1>
          <p className="mt-1.5 text-sm font-semibold text-ink/55">
            {filtered.length} item{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      <div className="flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="rounded-sticker border-2 border-ink bg-white p-5">
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              onClick={() => setMobileFilters(true)}
              className="btn-ink btn-sm lg:hidden"
            >
              <SlidersHorizontal size={14} />
              Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </button>

            <div className="relative ml-auto">
              <label htmlFor="sort" className="sr-only">
                Sort products
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none rounded-full border-2 border-ink bg-pink-50 py-2.5 pl-5 pr-10 text-sm font-bold capitalize focus:outline-none"
              >
                {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {sortLabels[key]}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/50"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-sticker border-2 border-dashed border-ink/30 bg-pink-50 px-6 py-20 text-center">
              <span className="text-4xl">🐾</span>
              <h2 className="text-lg uppercase">No matches found</h2>
              <p className="max-w-sm text-sm font-medium text-ink/60">
                Try removing a filter or two, or browse everything we have.
              </p>
              <button onClick={clearAll} className="btn-pink btn-sm mt-2">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setMobileFilters(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white">
            <div className="flex items-center justify-between border-b-2 border-ink px-5 py-4">
              <h2 className="text-sm font-bold uppercase tracking-widest">Filters</h2>
              <button
                onClick={() => setMobileFilters(false)}
                aria-label="Close filters"
                className="p-1 text-ink/50 hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{filterPanel}</div>
            <div className="border-t-2 border-ink p-4">
              <button
                onClick={() => setMobileFilters(false)}
                className="btn-pink w-full"
              >
                Show {filtered.length} result{filtered.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}