import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { AuthError, requireAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic"

type Ctx = { params: { id: string } }

function fail(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 })
    }
  }
  console.error("Design mutation error:", error)
  return NextResponse.json({ error: "Could not update the listing." }, { status: 500 })
}

/** PATCH /api/designs/[id] — edit any subset of fields */
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requireAdmin()
    const body = await request.json()

    const data: Record<string, unknown> = {}

    if (typeof body.title === "string" && body.title.trim()) {
      data.title = body.title.trim()
    }
    if (typeof body.brand === "string") data.brand = body.brand.trim() || "Doom"
    if (typeof body.description === "string") data.description = body.description
    if (typeof body.imageUrl === "string" && body.imageUrl) {
      data.imageUrl = body.imageUrl
      data.gallery = [body.imageUrl]
    }
    if (typeof body.category === "string") data.category = body.category
    if (typeof body.garmentType === "string") data.garmentType = body.garmentType
    if (Array.isArray(body.sizes)) data.sizes = body.sizes
    if (Array.isArray(body.colors)) data.colors = body.colors
    if (Array.isArray(body.highlights)) data.highlights = body.highlights
    if (body.price !== undefined && body.price !== null && body.price !== "") {
      const numeric = Number(body.price)
      if (!Number.isFinite(numeric) || numeric < 0) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 })
      }
      data.price = numeric
    }
    if (body.mrp !== undefined) {
      data.mrp = body.mrp === null || body.mrp === "" ? null : Number(body.mrp)
    }
    if (typeof body.fabric === "string") data.fabric = body.fabric
    if (typeof body.care === "string") data.care = body.care
    if (typeof body.isActive === "boolean") data.isActive = body.isActive

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 })
    }

    const updated = await prisma.design.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return fail(error)
  }
}

/**
 * DELETE /api/designs/[id]
 * Soft delete (isActive = false) so OrderItem foreign keys stay intact —
 * hard deleting a design that has been bought would break order history.
 */
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requireAdmin()

    const updated = await prisma.design.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ ok: true, design: updated })
  } catch (error) {
    return fail(error)
  }
}