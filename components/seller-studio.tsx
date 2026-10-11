"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Upload,
  Check,
  ImagePlus,
  Sparkles,
  AlertTriangle,
  Trash2,
  Images,
  ClipboardList,
} from "lucide-react"
import { useAccounts } from "@/components/account-provider"
import { formatRupees } from "@/lib/accounts"

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Could not read file"))
    reader.readAsDataURL(file)
  })
}

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

export default function SellerStudio() {
  const router = useRouter()
  const { user, isAdmin, hydrated, orders, designs, saveDesign, removeDesign } =
    useAccounts()

  const [tab, setTab] = useState<"upload" | "designs">("upload")
  const [brand, setBrand] = useState("")
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
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const sizeOptions = category === "dog" ? dogSizes : catSizes

  async function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setStatus({ tone: "error", text: "Please upload an image file." })
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setStatus({ tone: "error", text: "Image must be under 4 MB." })
      return
    }
    try {
      const url = await readAsDataUrl(file)
      setImageUrl(url)
      setPreview(url)
      setStatus(null)
    } catch {
      setStatus({ tone: "error", text: "Could not read that image file." })
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

    const payload = {
      brand: brand || "Doom",
      title,
      description,
      imageUrl: imageUrl || "/photos/dog-hoodie.jpg",
      category,
      garmentType: garment,
      sizes,
      colors: colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      price: Number(price),
      mrp: mrp ? Number(mrp) : null,
    }

    try {
      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (response.ok) {
        setStatus({ tone: "ok", text: `“${data.title}” is now live in the store.` })
        setTab("designs")
        resetForm()
        return
      }

      if (response.status === 401 || response.status === 403) {
        setStatus({
          tone: "error",
          text: "Studio admin access required to publish.",
        })
        return
      }

      // No database reachable — keep the listing locally so the draft is not lost
      saveDesign({
        brand: brand || null,
        title,
        description,
        imageUrl: payload.imageUrl,
        category,
        garmentType: garment,
        sizes,
        colors: colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        price: Number(price),
        mrp: mrp ? Number(mrp) : null,
      })
      setStatus({
        tone: "ok",
        text: `“${title}” saved as a draft — the database is not configured, so it is not live yet.`,
      })
      setTab("designs")
      resetForm()
    } catch {
      setStatus({ tone: "error", text: "Network error. Please try again." })
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
    setSaving(false)
  }

  const discount =
    price && mrp && Number(mrp) > Number(price)
      ? Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100)
      : 0

  if (!hydrated) {
    return (
      <main className="wrap py-20 text-center">
        <p className="font-bold uppercase tracking-widest text-ink/40">Loading…</p>
      </main>
    )
  }

  if (!user) {
    router.replace("/login")
    return null
  }

  return (
    <main className="wrap py-10">
      <nav className="mb-6 text-xs font-semibold text-ink/50">
        <ol className="flex items-center gap-2">
          <li>
            <a href="/" className="hover:text-pink-500">
              Home
            </a>
          </li>
          <span>/</span>
          <li className="text-ink">Seller studio</li>
        </ol>
      </nav>

      {/* admin banner */}
      {isAdmin && (
        <div className="relative mb-6 overflow-hidden rounded-sticker border-2 border-ink bg-pink-500 p-6 text-white shadow-sticker">
          <div className="halftone halftone-light absolute inset-0 opacity-25" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-white text-2xl">
                {user.avatar}
              </span>
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest">
                  <Sparkles size={12} /> Permanent admin
                </p>
                <p className="mt-0.5 text-lg font-bold">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div className="rounded-xl border-2 border-ink bg-white/15 px-4 py-2">
                <p className="font-display text-xl">{orders.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Orders
                </p>
              </div>
              <div className="rounded-xl border-2 border-ink bg-white/15 px-4 py-2">
                <p className="font-display text-xl">10</p>
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Listings
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-sticker border-2 border-ink bg-pink-100 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle size={22} className="shrink-0 text-pink-500" />
            <div>
              <p className="text-sm font-bold uppercase">
                Publishing needs the studio admin
              </p>
              <p className="text-xs font-medium text-ink/60">
                You can still submit below — it will be queued for review.
              </p>
            </div>
          </div>
          <a href="/login" className="btn-ink btn-sm shrink-0">
            Studio access
          </a>
        </div>
      )}

<header className="mb-8">
        <span className="tag border-pink-500 bg-pink-100 text-pink-600">
          Seller Studio
        </span>
        <h1 className="mt-3 text-3xl uppercase sm:text-4xl">Upload a new design</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-ink/60">
          Add a pet clothing design to the Doom catalogue. Keep the photography
          clean and the measurements accurate.
        </p>
      </header>

      {/* tabs */}
      <nav className="mb-6 flex flex-wrap gap-2 border-b-2 border-dashed border-ink/20 pb-4">
        <button
          onClick={() => setTab("upload")}
          className={`chip ${tab === "upload" ? "chip-on" : ""}`}
        >
          <ImagePlus size={14} /> New design
        </button>
        <button
          onClick={() => setTab("designs")}
          className={`chip ${tab === "designs" ? "chip-on" : ""}`}
        >
          <Images size={14} /> My designs
          {designs.length > 0 && (
            <span className="ml-0.5 text-xs opacity-70">({designs.length})</span>
          )}
        </button>
        <a href="/admin/orders" className="chip">
          <ClipboardList size={14} /> Fulfilment
          {orders.filter(
            (o) =>
              o.status === "placed" ||
              o.status === "confirmed" ||
              o.status === "packed"
          ).length > 0 && (
            <span className="ml-0.5 text-xs opacity-70">
              (
              {
                orders.filter(
                  (o) =>
                    o.status === "placed" ||
                    o.status === "confirmed" ||
                    o.status === "packed"
                ).length
              }
              )
            </span>
          )}
        </a>
      </nav>

      {tab === "designs" && (
        <section className="space-y-5">
          {designs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-sticker border-2 border-dashed border-ink/30 bg-pink-50 px-6 py-16 text-center">
              <span className="text-4xl">🖼️</span>
              <h2 className="text-lg uppercase">No designs yet</h2>
              <p className="max-w-sm text-sm font-medium text-ink/60">
                Upload your first custom design photo and it will show up here
                with its pricing and size range.
              </p>
              <button onClick={() => setTab("upload")} className="btn-pink btn-sm mt-2">
                <ImagePlus size={14} /> Add a design
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {designs.map((design) => (
                  <div
                    key={design.id}
                    className="group overflow-hidden rounded-sticker border-2 border-ink bg-white shadow-sticker transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-pink-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={design.imageUrl}
                        alt={design.title}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => removeDesign(design.id)}
                        aria-label={`Delete ${design.title}`}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-white opacity-0 transition-all hover:bg-ink hover:text-white group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="border-t-2 border-ink p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-pink-600">
                        {design.brand || "Doom"}
                      </p>
                      <h3 className="mt-0.5 line-clamp-1 text-sm font-bold">
                        {design.title}
                      </h3>
                      <p className="mt-1 text-[11px] font-medium capitalize text-ink/55">
                        {design.category} · {design.garmentType}
                      </p>
                      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-bold">
                          {formatRupees(design.price)}
                        </span>
                        {design.mrp && design.mrp > design.price && (
                          <span className="text-xs font-medium text-ink/45 line-through">
                            {formatRupees(design.mrp)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {design.sizes.slice(0, 5).map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-ink/25 px-1.5 py-0.5 text-[9px] font-bold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setTab("upload")} className="btn-white">
                <ImagePlus size={15} /> Add another design
              </button>
            </>
          )}
        </section>
      )}

      {tab === "upload" && (
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
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
                  placeholder="Doom"
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
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink/50">
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
              <a
                href="/size-guide"
                className="mt-2 inline-block text-[11px] font-bold uppercase tracking-widest text-pink-600 hover:underline"
              >
                View size chart
              </a>
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

        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <section className="sticker p-6">
            <h2 className="mb-4 text-lg uppercase">Product image</h2>

            {preview ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-sticker border-2 border-ink bg-pink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
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
                  handleFiles(e.dataTransfer.files)
                }}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sticker border-2 border-dashed px-4 py-12 text-center transition-all ${
                  dragOver
                    ? "border-pink-500 bg-pink-100"
                    : "border-ink/25 hover:border-pink-500 hover:bg-pink-50"
                }`}
              >
                <ImagePlus size={30} className="text-pink-500" />
                <span className="text-sm font-bold">Drop an image here</span>
                <span className="text-xs font-medium text-ink/50">
                  or click to browse · PNG or JPG up to 4 MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
            )}

            <div className="mt-4">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                Or paste an image URL
              </label>
              <input
                value={imageUrl.startsWith("blob:") ? "" : imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  setPreview(e.target.value || null)
                }}
                placeholder="https://… or /photos/dog-hoodie.jpg"
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
              disabled={saving}
              className="btn-pink w-full disabled:opacity-50"
            >
              <Upload size={15} />
              {saving ? "Publishing…" : "Publish design"}
            </button>
            <p className="mt-3 text-center text-xs font-medium text-ink/50">
              Designs are usually reviewed within 24 hours.
            </p>
          </section>
        </aside>
      </form>
      )}
    </main>
  )
}