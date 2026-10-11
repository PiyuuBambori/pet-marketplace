import { prisma } from "@/lib/prisma"
import { products as fallbackProducts, type Product } from "@/lib/products"

/**
 * A database row mapped onto the shape the storefront already renders.
 * Keeping the shapes identical is what makes the fallback seamless.
 */
type DesignRow = {
  id: string
  brand: string | null
  title: string
  description: string | null
  imageUrl: string
  gallery: unknown
  category: string
  garmentType: string
  sizes: unknown
  colors: unknown
  price: number
  mrp: number | null
  fabric: string | null
  care: string | null
  highlights: unknown
  rating: number
  ratingCount: number
}

function toArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : []
}

function toColors(value: unknown): { name: string; hex: string }[] {
  if (!Array.isArray(value)) return []
  return value as { name: string; hex: string }[]
}

function mapRow(row: DesignRow): Product {
  const gallery = toArray(row.gallery)
  return {
    id: row.id,
    brand: row.brand ?? "Doom",
    name: row.title,
    category: row.category === "cat" ? "cat" : "dog",
    garment: row.garmentType as Product["garment"],
    price: row.price,
    mrp: row.mrp ?? row.price,
    image: row.imageUrl,
    gallery: gallery.length ? gallery : [row.imageUrl],
    colors: toColors(row.colors),
    sizes: toArray(row.sizes),
    rating: row.rating ?? 0,
    ratingCount: row.ratingCount ?? 0,
    description: row.description ?? "",
    highlights: toArray(row.highlights),
    fabric: row.fabric ?? "See product label",
    care: row.care ?? "See product label",
  }
}

/**
 * Reads the catalogue from Postgres, falling back to the bundled list in
 * lib/products.ts when the database is unreachable or empty. The storefront
 * therefore never renders blank — but note that catalogue edits made in the
 * database are not visible while the fallback is serving.
 */
export async function getProducts(): Promise<{
  products: Product[]
  source: "database" | "fallback"
}> {
  try {
    const rows = await prisma.design.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    })

    if (rows.length === 0) {
      return { products: fallbackProducts, source: "fallback" }
    }

    return { products: rows.map((row) => mapRow(row as unknown as DesignRow)), source: "database" }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[catalog] database unavailable, serving bundled catalogue:",
        error instanceof Error ? error.message : error
      )
    }
    return { products: fallbackProducts, source: "fallback" }
  }
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const { products: list, source } = await getProducts()
  if (source === "fallback") {
    return list.find((product) => product.id === id)
  }

  try {
    const row = await prisma.design.findFirst({
      where: { id, isActive: true },
    })
    if (row) return mapRow(row as unknown as DesignRow)
  } catch {
    // fall through to the in-memory list
  }
  return list.find((product) => product.id === id)
}

export async function getAllDesigns() {
  try {
    return await prisma.design.findMany({ orderBy: { createdAt: "desc" } })
  } catch {
    return []
  }
}