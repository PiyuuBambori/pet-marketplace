import { Suspense } from "react"
import ProductListing from "@/components/product-listing"
import { getProducts } from "@/lib/catalog"

export const metadata = {
  title: "Shop Pet Clothes",
  description:
    "Browse dog and cat apparel. Filter by brand, size, colour and price.",
}

export const revalidate = 60

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