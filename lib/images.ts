/**
 * Shared image rules for catalogue uploads.
 *
 * Imported by both the browser (Seller Studio) and the upload route handler so
 * the picker, the client-side guard and the server-side guard can never
 * disagree about what is accepted.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export type ImageFormat = {
  /** Lowercase extension, without the dot. */
  extension: string
  /** MIME type stored on the object. */
  mime: string
  /** Label shown in the picker. */
  label: string
}

/**
 * Formats we accept. Kept to raster types the storefront can actually render
 * through next/image.
 */
export const IMAGE_FORMATS: ImageFormat[] = [
  { extension: "jpg", mime: "image/jpeg", label: "JPEG" },
  { extension: "jpeg", mime: "image/jpeg", label: "JPEG" },
  { extension: "png", mime: "image/png", label: "PNG" },
  { extension: "webp", mime: "image/webp", label: "WebP" },
  { extension: "avif", mime: "image/avif", label: "AVIF" },
  { extension: "gif", mime: "image/gif", label: "GIF" },
]

/** Value for the `<input type="file" accept>` attribute. */
export const ACCEPTED_IMAGE_INPUT = IMAGE_FORMATS.map(
  (format) => `.${format.extension}`
).join(",")

const ACCEPTED_MIMES = new Set(IMAGE_FORMATS.map((format) => format.mime))

export function isAcceptedMimeType(mime: string) {
  return ACCEPTED_MIMES.has(mime.toLowerCase())
}

/** True when the browser reported an accepted MIME type *and* a plausible size. */
export function isPlausibleImageFile(file: File) {
  return isAcceptedMimeType(file.type) && file.size <= MAX_IMAGE_BYTES
}

export function describeAcceptedFormats() {
  const labels = uniqueLabels()
  return `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`
}

/** Distinct format labels, preserving the declared order. */
export function uniqueLabels() {
  const seen: string[] = []
  for (const format of IMAGE_FORMATS) {
    if (!seen.includes(format.label)) seen.push(format.label)
  }
  return seen
}

/**
 * Identify an image by its magic bytes.
 *
 * The MIME type on a `File` comes from the browser and can be forged, so the
 * server never trusts it on its own — it re-checks the signature and stores
 * the object under the format we actually detected.
 */
export function detectImageFormat(bytes: Uint8Array): ImageFormat | null {
  const startsWith = (...signature: number[]) =>
    signature.every((byte, index) => bytes[index] === byte)

  if (startsWith(0xff, 0xd8, 0xff)) return find("jpg")

  if (
    startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
  ) {
    return find("png")
  }

  // "RIFF" at offset 0 and "WEBP" at offset 8.
  if (
    startsWith(0x52, 0x49, 0x46, 0x46) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return find("webp")
  }

  // ....ftypavif / ....ftypavis
  if (
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    const brand =
      String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11])
    if (brand === "avif" || brand === "avis") return find("avif")
  }

  if (startsWith(0x47, 0x49, 0x46, 0x38)) return find("gif")

  return null

  function find(extension: string) {
    return IMAGE_FORMATS.find((format) => format.extension === extension) ?? null
  }
}