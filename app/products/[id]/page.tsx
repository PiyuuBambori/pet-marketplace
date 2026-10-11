import { notFound } from "next/navigation"
import ProductDetailView from "@/components/product-detail"
import { getProduct, getProducts } from "@/lib/catalog"
import { products as fallbackProducts } from "@/lib/products"

export const revalidate = 60

// Static params come from the bundled catalogue so the routes exist even
// before the database is seeded. Pages still resolve through the DB at render.
export function generateStaticParams() {
  return fallbackProducts.map((product) => ({ id: product.id }))
}

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