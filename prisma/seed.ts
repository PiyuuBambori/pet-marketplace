import { config } from "dotenv"
import { PrismaClient } from "@prisma/client"
import { dogSizeChart, products } from "../lib/products"

config({ path: ".env" })
const prisma = new PrismaClient()

const BUCKET = "doom-images"
const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
}

/**
 * Uploads only the photos referenced by the catalogue to Supabase Storage and
 * returns a local-path → public-URL map. Unlike the old version this does not
 * push every leftover demo photo in public/photos.
 */
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

  // Make the seed runnable on a fresh project too.
  const { error: bucketError } = await admin.storage.getBucket(BUCKET)
  if (bucketError) {
    const { error } = await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ALLOWED_MIMES,
    })
    if (error) {
      console.warn(`[storage] could not create ${BUCKET}: ${error.message}`)
      return urlMap
    }
    console.log(`[storage] created bucket ${BUCKET}`)
  }

  const fs = await import("fs/promises")
  const path = await import("path")

  const localPaths = new Set<string>()
  for (const product of products) {
    localPaths.add(product.image)
    for (const image of product.gallery) localPaths.add(image)
  }

  for (const localPath of Array.from(localPaths)) {
    const ext = path.extname(localPath).toLowerCase()
    const contentType = MIME_BY_EXT[ext]
    if (!contentType) {
      console.warn(`[storage] unsupported file type: ${localPath}`)
      continue
    }

    const file = path.join(process.cwd(), "public", localPath.replace(/^\//, ""))
    let buffer: Buffer
    try {
      buffer = await fs.readFile(file)
    } catch {
      console.warn(`[storage] missing local file: ${localPath}`)
      continue
    }

    const key = `catalogue/${path.basename(localPath)}`
    const { error } = await admin.storage.from(BUCKET).upload(key, buffer, {
      contentType,
      cacheControl: "31536000",
      upsert: true,
    })

    if (error) {
      console.warn(`[storage] ${localPath}: ${error.message}`)
      continue
    }

    const { data } = admin.storage.from(BUCKET).getPublicUrl(key)
    urlMap.set(localPath, data.publicUrl)
  }

  console.log(`[storage] uploaded ${urlMap.size} catalogue images`)
  return urlMap
}

async function seedDesigns(imageUrls: Map<string, string>) {
  for (const product of products) {
    const imageUrl = imageUrls.get(product.image) ?? product.image
    const gallery = product.gallery.length
      ? product.gallery.map((image) => imageUrls.get(image) ?? image)
      : [imageUrl]

    const data = {
      brand: product.brand,
      title: product.name,
      description: product.description,
      imageUrl,
      gallery,
      category: product.category,
      garmentType: product.garment,
      sizes: product.sizes,
      colors: product.colors,
      price: product.price,
      mrp: product.mrp,
      fabric: product.fabric,
      care: product.care,
      highlights: product.highlights,
      measurements: { sizeChart: dogSizeChart },
      rating: product.rating,
      ratingCount: product.ratingCount,
      isActive: true,
    }

    // The SKU is the primary key, so re-running the seed updates the same row
    // instead of creating duplicates.
    await prisma.design.upsert({
      where: { id: product.id },
      update: data,
      create: { id: product.id, ...data },
    })
    console.log(`[catalogue] ${product.id} — ${product.name}`)
  }

  // Remove only the ten old demo listings by title. Anything a seller created
  // later is left untouched. Designs that have already been sold are hidden
  // instead of deleted so order history survives.
  const LEGACY_DEMO_TITLES = [
    "Cozy Fleece-Lined Dog Hoodie",
    "Merino Blend Cat Sweater",
    "Hi-Vis Waterproof Raincoat",
    "Everyday Cotton Bandana",
    "Thermal Winter Coat",
    "Cotton Cat Bandana",
    "Quilted Dog Jacket",
    "Occasion Pet Hat",
    "Velvet Tuxedo & Bow Tie",
    "Festive Fair Isle Sweater",
  ]

  const removed = await prisma.design.deleteMany({
    where: {
      title: { in: LEGACY_DEMO_TITLES },
      orderItems: { none: {} },
    },
  })
  const hidden = await prisma.design.updateMany({
    where: { title: { in: LEGACY_DEMO_TITLES } },
    data: { isActive: false },
  })
  console.log(
    `[catalogue] cleaned up ${removed.count} demo listing(s), hid ${hidden.count} with order history`
  )
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

  const count = await prisma.design.count({ where: { isActive: true } })
  const users = await prisma.user.count()
  console.log(`Seeded ${count} live designs, ${users} profiles.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
