import { notFound } from "next/navigation"
import ProductDetailView from "@/components/product-detail"
import { getProduct, getProducts } from "@/lib/catalog"

export const dynamic = "force-dynamic"

// Routed dynamically (see `dynamic` above) because the catalogue lives in
// Postgres. `generateStaticParams` is intentionally omitted — mixing it with
// force-dynamic prerendering is what caused the build to fail earlier.
export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)
  if (!product) return { title: "Product not found | Doom" }
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Doom`,
      description: product.description,
      images: [{ url: product.image }],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  const { products } = await getProducts()
  const similar = products
    .filter((p) => p.id !== product.id)
    .filter((p) => p.category === product.category)
    .slice(0, 5)

  return <ProductDetailView product={product} similar={similar} />
}