import { Suspense } from "react"
import ProductListing from "@/components/product-listing"
import { getProducts } from "@/lib/catalog"

export const metadata = {
  title: "Shop DOOM Dog Dresses",
  description:
    "Browse the DOOM debut collection of dog dresses. Filter by size, print and price.",
}

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  const { products } = await getProducts()

  return (
    <main>
      <Suspense
        fallback={
          <div className="wrap py-16 text-center text-sm font-bold uppercase tracking-widest text-ink/40">
            Loading products…
          </div>
        }
      >
        <ProductListing products={products} />
      </Suspense>
    </main>
  )
}