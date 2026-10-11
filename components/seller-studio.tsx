"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Upload, Check, AlertTriangle, Trash2, ImagePlus } from "lucide-react"
import { useAccounts } from "@/components/account-provider"
import { formatRupees } from "@/lib/accounts"
import {
  ACCEPTED_IMAGE_INPUT,
  MAX_IMAGE_BYTES,
  describeAcceptedFormats,
  isPlausibleImageFile,
  uniqueLabels,
} from "@/lib/images"

const categories = [
  { id: "dog", label: "Dog" },
  { id: "cat", label: "Cat" },
]

const garments = [
  { id: "hoodie", label: "Hoodie" },
  { id: "sweater", label: "Sweater" },
  { id: "raincoat", label: "Raincoat" },
  { id: "bandana", label: "Bandana" },
  { id: "coat", label: "Coat" },
  { id: "dress", label: "Dress" },
  { id: "jacket", label: "Jacket" },
  { id: "hat", label: "Hat" },
  { id: "tuxedo", label: "Tuxedo" },
]

const dogSizes = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"]
const catSizes = ["S", "M", "L", "XL"]

/**
 * Upload an image through the admin API route rather than straight to Storage.
 * The bucket has no authenticated INSERT policy and the service-role key is
 * server-only, so this must go through /api/upload. The server also sniffs the
 * file signature and returns the stored format.
 */
async function uploadImage(file: File): Promise<{ url: string; format?: string }> {
  const form = new FormData()
  form.append("file", file)

  const response = await fetch("/api/upload", { method: "POST", body: form })

  let payload: { url?: string; format?: string; error?: string } = {}
  try {
    payload = await response.json()
  } catch {
    // fall through to the status-based message below
  }

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Upload failed.")
  }

  return { url: payload.url, format: payload.format }
}

export default function SellerStudio() {
  const { user, isAdmin, hydrated, configured } = useAccounts()

  const [brand, setBrand] = useState("Doom")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [mrp, setMrp] = useState("")
  const [category, setCategory] = useState("dog")
  const [garment, setGarment] = useState("hoodie")
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"])
  const [colors, setColors] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const sizeOptions = category === "dog" ? dogSizes : catSizes

  async function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    if (!isPlausibleImageFile(file)) {
      setStatus({
        tone: "error",
        text:
          file.size > MAX_IMAGE_BYTES
            ? "Image must be under 5 MB."
            : `Please upload a ${describeAcceptedFormats()} file.`,
      })
      return
    }

    setUploading(true)
    setStatus(null)
    try {
      const { url, format } = await uploadImage(file)
      setImageUrl(url)
      setPreview(url)
      setStatus({
        tone: "ok",
        text: `Saved to Supabase Storage as ${format?.toUpperCase() ?? "image"}.`,
      })
    } catch (error) {
      setStatus({
        tone: "error",
        text:
          error instanceof Error
            ? `Upload failed: ${error.message}`
            : "Upload failed.",
      })
    } finally {
      setUploading(false)
    }
  }

  function toggleSize(size: string) {
    setSizes((current) =>
      current.includes(size)
        ? current.filter((s) => s !== size)
        : [...current, size]
    )
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setStatus(null)

    try {
      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          title,
          description,
          imageUrl,
          category,
          garmentType: garment,
          sizes,
          colors: colors
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
          price: Number(price),
          mrp: mrp ? Number(mrp) : null,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        setStatus({
          tone: "error",
          text:
            response.status === 401 || response.status === 403
              ? "Studio admin access required to publish."
              : data.error ?? "Could not publish the design.",
        })
        return
      }

      setStatus({ tone: "ok", text: `“${data.title}” is now live in the store.` })
      resetForm()
    } catch {
      setStatus({ tone: "error", text: "Network error. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setPrice("")
    setMrp("")
    setColors("")
    setImageUrl("")
    setPreview(null)
  }

  const discount =
    price && mrp && Number(mrp) > Number(price)
      ? Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100)
      : 0

  const notSignedIn = hydrated && !user

  return (
    <main className="wrap py-10">
      <nav className="mb-6 text-xs font-semibold text-ink/50">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-pink-500">
              Home
            </Link>
          </li>
          <span>/</span>
          <li className="text-ink">Seller Studio</li>
        </ol>
      </nav>

      <header className="mb-8">
        <span className="tag border-pink-500 bg-pink-100 text-pink-600">
          Seller Studio
        </span>
        <h1 className="mt-3 text-3xl uppercase sm:text-4xl">Upload a new design</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-ink/60">
          Add a pet clothing design to the Doom catalogue. Images are uploaded to
          Supabase Storage and published straight to the storefront.
        </p>
      </header>

      {notSignedIn && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-sticker border-2 border-ink bg-pink-100 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle size={22} className="shrink-0 text-pink-500" />
            <div>
              <p className="text-sm font-bold uppercase">Sign in to publish</p>
              <p className="text-xs font-medium text-ink/60">
                Publishing is restricted to the studio admin.
              </p>
            </div>
          </div>
          <Link href="/login" className="btn-ink btn-sm shrink-0">
            Studio access
          </Link>
        </div>
      )}

      {user && !isAdmin && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-sticker border-2 border-ink bg-pink-100 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle size={22} className="shrink-0 text-pink-500" />
            <div>
              <p className="text-sm font-bold uppercase">
                Publishing needs the studio admin
              </p>
              <p className="text-xs font-medium text-ink/60">
                You are signed in as a buyer.
              </p>
            </div>
          </div>
          <Link href="/login" className="btn-ink btn-sm shrink-0">
            Studio access
          </Link>
        </div>
      )}

      {!configured && (
        <p className="mb-6 rounded-sticker border-2 border-ink bg-pink-100 px-5 py-4 text-sm font-bold">
          Supabase is not configured on this deployment, so uploads are disabled.
        </p>
      )}

      <form
        onSubmit={submit}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-6">
          <section className="sticker p-6">
            <h2 className="mb-5 text-lg uppercase">Basic details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  Brand
                </label>
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  Product title
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Cozy Fleece-Lined Dog Hoodie"
                  className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this design good? Fabric, fit, features."
                  className="w-full rounded-2xl border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section className="sticker p-6">
            <h2 className="mb-5 text-lg uppercase">Category</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  Pet type
                </p>
                <div className="flex gap-2">
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCategory(item.id)
                        setSizes(["S", "M", "L"])
                      }}
                      className={`chip flex-1 ${category === item.id ? "chip-on" : ""}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  Garment
                </p>
                <select
                  value={garment}
                  onChange={(e) => setGarment(e.target.value)}
                  className="w-full rounded-full border-2 border-ink bg-white px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
                >
                  {garments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink/50">
                Available sizes
              </p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`chip h-10 min-w-[3rem] px-3 text-xs ${
                      sizes.includes(size) ? "chip-on" : ""
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <Link
                href="/size-guide"
                className="mt-2 inline-block text-[11px] font-bold uppercase tracking-widest text-pink-600 hover:underline"
              >
                View size chart
              </Link>
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                Colours (comma separated)
              </label>
              <input
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="Midnight Navy, Blush, Cocoa"
                className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
              />
            </div>
          </section>

          <section className="sticker p-6">
            <h2 className="mb-5 text-lg uppercase">Pricing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  Selling price (₹)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1299"
                  className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  MRP (₹) — optional
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  placeholder="2499"
                  className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
            {discount > 0 && (
              <p className="mt-4 rounded-full border-2 border-ink bg-pink-100 px-4 py-2.5 text-xs font-bold">
                Customers will see a{" "}
                <span className="text-pink-600">{discount}%</span> discount badge.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="sticker p-6">
            <h2 className="mb-4 text-lg uppercase">Product image</h2>

            {preview ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-sticker border-2 border-ink bg-pink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null)
                    setImageUrl("")
                  }}
                  className="absolute right-2 top-2 rounded-full border-2 border-ink bg-white px-3 py-1 text-[10px] font-bold uppercase"
                >
                  Remove
                </button>
                <span className="absolute bottom-2 left-2 right-2 truncate rounded-full border-2 border-ink bg-white/90 px-3 py-1 text-[10px] font-bold">
                  Stored in Supabase Storage
                </span>
              </div>
            ) : (
              <label
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  void handleFiles(e.dataTransfer.files)
                }}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sticker border-2 border-dashed px-4 py-12 text-center transition-all ${
                  dragOver
                    ? "border-pink-500 bg-pink-100"
                    : "border-ink/25 hover:border-pink-500 hover:bg-pink-50"
                }`}
              >
                <ImagePlus size={30} className="text-pink-500" />
                <span className="text-sm font-bold">
                  {uploading ? "Uploading…" : "Drop an image here"}
                </span>
                <span className="text-xs font-medium text-ink/50">
                  or click to browse · up to 5 MB
                </span>
                <span className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
                  {uniqueLabels().map((label) => (
                    <span
                      key={label}
                      className="rounded-full border-2 border-ink/20 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink/70"
                    >
                      {label}
                    </span>
                  ))}
                </span>
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_INPUT}
                  className="hidden"
                  onChange={(e) => {
                    void handleFiles(e.target.files)
                    // Reset so picking the same file twice still fires onChange.
                    e.target.value = ""
                  }}
                />
              </label>
            )}

            <div className="mt-4">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                Or paste an image URL
              </label>
              <input
                value={preview ? "" : imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  setPreview(e.target.value || null)
                }}
                placeholder="https://…"
                className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
              />
            </div>
          </section>

          <section className="sticker p-6">
            {status && (
              <div
                className={`mb-4 flex items-start gap-2 rounded-full border-2 border-ink px-4 py-2.5 text-xs font-bold ${
                  status.tone === "ok" ? "bg-pink-100" : "bg-white"
                }`}
              >
                {status.tone === "ok" ? (
                  <Check size={14} className="mt-0.5 shrink-0 text-success" />
                ) : (
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-pink-600" />
                )}
                {status.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || uploading || !isAdmin || !configured}
              className="btn-pink w-full disabled:opacity-50"
            >
              <Upload size={15} />
              {saving ? "Publishing…" : "Publish design"}
            </button>
            <p className="mt-3 text-center text-xs font-medium text-ink/50">
              Images are stored in Supabase Storage.
            </p>
          </section>
        </aside>
      </form>
    </main>
  )
}

