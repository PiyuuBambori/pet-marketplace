import type { MetadataRoute } from "next"
import { products } from "@/lib/products"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/size-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  // Admin and checkout areas should never be indexed
  return [...staticRoutes, ...productRoutes]
}