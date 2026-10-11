import { NextResponse } from "next/server"
import { AuthError, requireAdmin } from "@/lib/auth"
import { createAdminClient, STORAGE_BUCKET } from "@/lib/supabase/admin"
import {
  MAX_IMAGE_BYTES,
  describeAcceptedFormats,
  detectImageFormat,
} from "@/lib/images"

// Never cache; this handler mutates storage.
export const dynamic = "force-dynamic"

/** Magic bytes needed to identify the widest format (AVIF reads 12 bytes). */
const SIGNATURE_BYTES = 16

/**
 * Admin-only image upload.
 *
 * The browser cannot upload directly to the bucket: the `doom-images` bucket
 * has no `authenticated` INSERT policy (all writes go through the service
 * role), and the service-role key must never reach the client. So the client
 * posts multipart form data here and this route performs the upload with the
 * privileged admin client.
 *
 * The file is identified by its magic bytes rather than by the browser-supplied
 * `Content-Type`, and the object is stored under the detected extension.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 401
    const message =
      error instanceof AuthError ? error.message : "Not authorised."
    return NextResponse.json({ error: message }, { status })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 })
  }

  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was provided." }, { status: 400 })
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 })
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Images must be 5 MB or smaller." },
      { status: 400 }
    )
  }

  const header = new Uint8Array(
    await file.slice(0, SIGNATURE_BYTES).arrayBuffer()
  )
  const format = detectImageFormat(header)

  if (!format) {
    return NextResponse.json(
      { error: `That file is not a ${describeAcceptedFormats()} image.` },
      { status: 415 }
    )
  }

  const key = `designs/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${format.extension}`

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(key, file, {
        cacheControl: "31536000",
        contentType: format.mime,
        upsert: false,
      })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(key)

    return NextResponse.json({
      url: data.publicUrl,
      key,
      format: format.extension,
      bytes: file.size,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}