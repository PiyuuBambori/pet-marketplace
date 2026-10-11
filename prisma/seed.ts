import { config } from "dotenv"
import { PrismaClient } from "@prisma/client"
import { products } from "../lib/products"

config({ path: ".env" })
const prisma = new PrismaClient()

/** Buckets the catalogue photos into Supabase Storage public URLs. */
async function uploadCataloguePhotos(): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    console.warn("[storage] not configured, keeping local /photos paths")
    return urlMap
  }

  const { createClient } = await import("@supabase/supabase-js")
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const bucket = "doom-images"
  const fs = await import("fs/promises")
  const path = await import("path")

  const dir = path.join(process.cwd(), "public", "photos")
  let files: string[] = []
  try {
    files = await fs.readdir(dir)
  } catch {
    console.warn("[storage] public/photos not found, skipping")
    return urlMap
  }

  const mimeByExt: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  }

  for (const file of files) {
    const ext = path.extname(file).toLowerCase()
    const contentType = mimeByExt[ext]
    if (!contentType) continue

    const buffer = await fs.readFile(path.join(dir, file))
    const key = `catalogue/${file}`

    // The bucket restricts MIME types, so it must be declared explicitly —
    // a bare Buffer is detected as text/plain and rejected.
    const { error } = await admin.storage.from(bucket).upload(key, buffer, {
      contentType,
      cacheControl: "31536000",
      upsert: true,
    })

    if (error) {
      console.warn(`[storage] ${file}: ${error.message}`)
      continue
    }

    const { data } = admin.storage.from(bucket).getPublicUrl(key)
    urlMap.set(`/photos/${file}`, data.publicUrl)
    console.log(`[storage] uploaded ${key}`)
  }

  return urlMap
}

async function seedDesigns(imageUrls: Map<string, string>) {
  for (const product of products) {
    const imageUrl = imageUrls.get(product.image) ?? product.image

    const data = {
      brand: product.brand,
      title: product.name,
      description: product.description,
      imageUrl,
      gallery: [imageUrl],
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

/**
 * Creates the permanent admin in Supabase Auth (if missing) and sets role.
 * Idempotent — safe to re-run.
 */
async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@doom.shop").toLowerCase()
  const password = process.env.ADMIN_PASSWORD ?? "admin123"

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    console.warn("[admin] Supabase not configured, skipping admin creation")
    return
  }

  const { createClient } = await import("@supabase/supabase-js")
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const found = list?.users?.find(
    (u) => (u.email ?? "").toLowerCase() === email
  )

  let userId = found?.id

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Studio Admin", avatar: "👑" },
    })
    if (error) {
      console.error(`[admin] could not create ${email}: ${error.message}`)
      return
    }
    userId = data.user.id
    console.log(`[admin] created ${email}`)
  } else {
    await admin.auth.admin.updateUserById(userId, { password, email_confirm: true })
    console.log(`[admin] ${email} already existed, password reset`)
  }

  // The trigger creates the profile row; make sure the role is admin.
  await prisma.user.upsert({
    where: { id: userId },
    update: { role: "admin" },
    create: {
      id: userId,
      email,
      name: "Studio Admin",
      phone: "+91 90000 00000",
      avatar: "👑",
      role: "admin",
    },
  })

  console.log(`[admin] ready: ${email}`)
}

async function main() {
  const imageUrls = await uploadCataloguePhotos()
  await seedDesigns(imageUrls)
  await seedAdmin()

  const count = await prisma.design.count()
  const users = await prisma.user.count()
  console.log(`Seeded ${count} designs, ${users} profiles.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
