import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { AuthError, requireAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic"

function unauthorised(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  console.error("Designs API error:", error)
  return NextResponse.json({ error: "Designs request failed." }, { status: 500 })
}

/** GET /api/designs — catalogue, admin sees inactive entries too */
export async function GET(request: Request) {
  try {
    await requireAdmin()

    const url = new URL(request.url)
    const includeInactive = url.searchParams.get("all") === "true"

    const designs = await prisma.design.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(designs)
  } catch (error) {
    return unauthorised(error)
  }
}

/** POST /api/designs — create a listing */
export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const {
      brand,
      title,
      description,
      imageUrl,
      category,
      garmentType,
      sizes,
      colors,
      price,
      mrp,
      fabric,
      care,
      highlights,
    } = body

    if (!title || !category || price === undefined || price === null) {
      return NextResponse.json(
        { error: "title, category and price are required" },
        { status: 400 }
      )
    }

    const numericPrice = Number(price)
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    const design = await prisma.design.create({
      data: {
        brand: brand || "Doom",
        title: String(title),
        description: description ? String(description) : null,
        imageUrl: imageUrl || "/photos/dog-hoodie.jpg",
        gallery: [imageUrl || "/photos/dog-hoodie.jpg"],
        category: String(category),
        garmentType: garmentType || "other",
        sizes: Array.isArray(sizes) ? sizes : [],
        colors: Array.isArray(colors) ? colors : [],
        price: numericPrice,
        mrp: mrp !== undefined && mrp !== null && mrp !== "" ? Number(mrp) : null,
        fabric: fabric || null,
        care: care || null,
        highlights: Array.isArray(highlights) ? highlights : [],
        rating: 0,
        ratingCount: 0,
        isActive: true,
      },
    })

    return NextResponse.json(design, { status: 201 })
  } catch (error) {
    return unauthorised(error)
  }
}