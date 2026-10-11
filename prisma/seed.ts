import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { products } from "../lib/products"

const prisma = new PrismaClient()

/** Upserts the permanent admin account so the role is enforceable server-side. */
async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@doom.shop").toLowerCase()
  const password = process.env.ADMIN_PASSWORD ?? "admin123"
  const hashed = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "admin", password: hashed },
    create: {
      email,
      name: "Studio Admin",
      phone: "+91 90000 00000",
      avatar: "👑",
      password: hashed,
      role: "admin",
    },
  })

  return { email, password, id: admin.id }
}

async function seedDesigns() {
  for (const product of products) {
    const data = {
      brand: product.brand,
      title: product.name,
      description: product.description,
      imageUrl: product.image,
      gallery: product.gallery,
      category: product.category,
      garmentType: product.garment,
      sizes: product.sizes,
      colors: product.colors,
      price: product.price,
      mrp: product.mrp,
      fabric: product.fabric,
      care: product.care,
      highlights: product.highlights,
      rating: product.rating,
      ratingCount: product.ratingCount,
      isActive: true,
    }

    // Match on title so re-seeding updates instead of duplicating.
    const existing = await prisma.design.findFirst({
      where: { title: product.name },
    })

    if (existing) {
      await prisma.design.update({ where: { id: existing.id }, data })
    } else {
      await prisma.design.create({ data })
    }
  }
}

async function main() {
  const admin = await seedAdmin()
  await seedDesigns()

  const designCount = await prisma.design.count()

  console.log(`Seeded ${designCount} designs.`)
  console.log(`Permanent admin ready: ${admin.email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })