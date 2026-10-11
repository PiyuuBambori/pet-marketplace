"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Images,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react"

type DesignRow = {
  id: string
  brand: string | null
  title: string
  description: string | null
  imageUrl: string
  category: string
  garmentType: string
  sizes: string[]
  colors: { name: string; hex: string }[]
  price: number
  mrp: number | null
  isActive: boolean
  rating: number
  createdAt: string
}

const CATEGORIES = [
  { id: "dog", label: "Dog" },
  { id: "cat", label: "Cat" },
]

const GARMENTS = [
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

const ALL_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "One Size"]

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`

const BLANK = {
  brand: "Doom",
  title: "",
  description: "",
  imageUrl: "",
  category: "dog",
  garmentType: "hoodie",
  sizes: ["S", "M", "L"] as string[],
  colors: "",
  price: "",
  mrp: "",
}

export default function AdminCatalogue() {
  const [designs, setDesigns] = useState<DesignRow[]>([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [editing, setEditing] = useState<DesignRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/designs?all=${showInactive}`, {
        cache: "no-store",
      })
      if (res.status === 401 || res.status === 403) {
        setAuthError("Sign in with the studio admin account to manage the catalogue.")
        setDesigns([])
        return
      }
      if (!res.ok) throw new Error("failed")
      const data: DesignRow[] = await res.json()
      setDesigns(
        data.map((d) => ({
          ...d,
          sizes: Array.isArray(d.sizes) ? d.sizes : [],
          colors: Array.isArray(d.colors) ? d.colors : [],
        }))
      )
      setAuthError(null)
    } catch {
      setAuthError("Could not reach the catalogue API. Is the database configured?")
    } finally {
      setLoading(false)
    }
  }, [showInactive])

  useEffect(() => {
    load()
  }, [load])

  const visible = designs.filter((d) =>
    query.trim()
      ? `${d.title} ${d.brand ?? ""} ${d.garmentType}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      : true
  )

  function startCreate() {
    setEditing(null)
    setForm({ ...BLANK })
    setNotice(null)
    setCreating(true)
  }

  function startEdit(d: DesignRow) {
    setCreating(false)
    setNotice(null)
    setForm({
      brand: d.brand ?? "Doom",
      title: d.title,
      description: d.description ?? "",
      imageUrl: d.imageUrl,
      category: d.category,
      garmentType: d.garmentType,
      sizes: d.sizes,
      colors: (d.colors ?? []).map((c) => c.name).join(", "),
      price: String(d.price),
      mrp: d.mrp ? String(d.mrp) : "",
    })
    setEditing(d)
  }

  async function save() {
    setSaving(true)
    setNotice(null)
    try {
      const payload = {
        ...form,
        colors: form.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
          .map((name) => ({ name, hex: "#FF2E88" })),
        price: Number(form.price),
        mrp: form.mrp ? Number(form.mrp) : null,
      }

      const res = await fetch(
        editing ? `/api/designs/${editing.id}` : "/api/designs",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json()

      if (!res.ok) {
        setNotice({ tone: "error", text: data.error ?? "Could not save." })
        return
      }

      setNotice({
        tone: "ok",
        text: editing ? `Updated “${data.title}”.` : `Published “${data.title}”.`,
      })
      setCreating(false)
      setEditing(null)
      setForm({ ...BLANK })
      load()
    } catch {
      setNotice({ tone: "error", text: "Network error." })
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(d: DesignRow) {
    try {
      const res = await fetch(`/api/designs/${d.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !d.isActive }),
      })
      if (!res.ok) throw new Error()
      load()
    } catch {
      setNotice({ tone: "error", text: "Could not change visibility." })
    }
  }

  async function remove(d: DesignRow) {
    if (!window.confirm(`Remove “${d.title}” from the catalogue? Past orders keep it.`)) {
      return
    }
    try {
      const res = await fetch(`/api/designs/${d.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setNotice({ tone: "ok", text: `Removed “${d.title}”.` })
      load()
    } catch {
      setNotice({ tone: "error", text: "Could not remove that listing." })
    }
  }

  const panelOpen = creating || editing !== null

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
          <li className="text-ink">Catalogue</li>
        </ol>
      </nav>

      <header className="relative mb-7 overflow-hidden rounded-sticker border-2 border-ink bg-pink-500 p-7 text-white shadow-sticker-lg">
        <div className="halftone halftone-light absolute inset-0 opacity-25" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="tag border-ink bg-white text-pink-600">✦ Admin</span>
            <h1 className="mt-3 text-3xl uppercase sm:text-4xl">Catalogue</h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-white/85">
              Add, edit, hide or remove anything in the storefront. Removing is a
              soft delete so existing orders keep their history.
            </p>
          </div>
          <button onClick={startCreate} className="btn-white btn-sm">
            <Plus size={14} /> New listing
          </button>
        </div>
      </header>

      {notice && (
        <div
          className={`mb-5 flex items-start gap-2 rounded-full border-2 border-ink px-4 py-2.5 text-sm font-bold ${
            notice.tone === "ok" ? "bg-pink-100" : "bg-white"
          }`}
        >
          {notice.tone === "ok" ? (
            <Check size={16} className="mt-0.5 shrink-0 text-success" />
          ) : (
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-pink-600" />
          )}
          {notice.text}
        </div>
      )}

      {authError && (
        <div className="mb-6 flex flex-col items-center gap-3 rounded-sticker border-2 border-dashed border-ink/30 bg-pink-50 px-6 py-14 text-center">
          <AlertTriangle size={32} className="text-pink-500" />
          <h2 className="text-lg uppercase">Cannot reach the catalogue</h2>
          <p className="max-w-md text-sm font-medium text-ink/60">{authError}</p>
          <Link href="/login" className="btn-pink btn-sm mt-1">
            Studio access
          </Link>
        </div>
      )}

      {/* editor */}
      {panelOpen && (
        <section className="sticker mb-7 animate-pop p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg uppercase">
              <Images size={18} className="text-pink-500" />
              {editing ? `Edit “${editing.title}”` : "New listing"}
            </h2>
            <button
              onClick={() => {
                setCreating(false)
                setEditing(null)
              }}
              aria-label="Close editor"
              className="p-1 text-ink/50 hover:text-ink"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                Brand
              </label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-2xl border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                Image URL
              </label>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="/photos/dog-hoodie.jpg"
                className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                Pet type
              </label>
              <div className="flex gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setForm({ ...form, category: c.id })}
                    className={`chip flex-1 ${form.category === c.id ? "chip-on" : ""}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                Garment
              </label>
              <select
                value={form.garmentType}
                onChange={(e) => setForm({ ...form, garmentType: e.target.value })}
                className="w-full rounded-full border-2 border-ink bg-white px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
              >
                {GARMENTS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                Available sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() =>
                      setForm({
                        ...form,
                        sizes: form.sizes.includes(size)
                          ? form.sizes.filter((s) => s !== size)
                          : [...form.sizes, size],
                      })
                    }
                    className={`chip h-10 min-w-[3rem] px-3 text-xs ${
                      form.sizes.includes(size) ? "chip-on" : ""
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                Colours (comma separated)
              </label>
              <input
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                placeholder="Midnight Navy, Blush"
                className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  Price ₹
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  MRP ₹
                </label>
                <input
                  type="number"
                  value={form.mrp}
                  onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                  className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving || !form.title || !form.price}
            className="btn-pink mt-6"
          >
            <Upload size={15} />
            {saving ? "Saving…" : editing ? "Save changes" : "Publish listing"}
          </button>
        </section>
      )}

      {/* toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-pink-50 px-4">
          <Search size={16} className="shrink-0 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, brand or garment"
            className="w-full bg-transparent py-2.5 text-sm font-medium focus:outline-none sm:w-64"
          />
        </div>
        <button
          onClick={() => setShowInactive((v) => !v)}
          className={`chip ${showInactive ? "chip-on" : ""}`}
        >
          {showInactive ? <Eye size={14} /> : <EyeOff size={14} />}
          {showInactive ? "Showing all" : "Live only"}
        </button>
        <span className="ml-auto text-sm font-semibold text-ink/55">
          {visible.length} listing{visible.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm font-bold uppercase tracking-widest text-ink/40">
          Loading…
        </p>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-sticker border-2 border-dashed border-ink/30 bg-pink-50 px-6 py-16 text-center">
          <span className="text-4xl">🖼️</span>
          <h2 className="text-lg uppercase">
            {designs.length === 0 ? "Database catalogue is empty" : "No matches"}
          </h2>
          <p className="max-w-md text-sm font-medium text-ink/60">
            {designs.length === 0
              ? "Run npm run db:seed to load the bundled designs, or add one above. Until then the storefront serves its bundled fallback."
              : "Nothing matched that search."}
          </p>
          <button onClick={startCreate} className="btn-pink btn-sm mt-1">
            <Plus size={14} /> Add a listing
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((d) => (
            <div
              key={d.id}
              className={`overflow-hidden rounded-sticker border-2 border-ink shadow-sticker transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none ${
                d.isActive ? "bg-white" : "bg-ink/5"
              }`}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-pink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.imageUrl}
                  alt={d.title}
                  className={`h-full w-full object-cover ${d.isActive ? "" : "grayscale opacity-50"}`}
                />
                <span
                  className={`absolute left-2.5 top-2.5 -rotate-6 rounded-full border-2 border-ink px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-sticker-sm ${
                    d.isActive ? "bg-pink-500" : "bg-ink/50"
                  }`}
                >
                  {d.isActive ? "Live" : "Hidden"}
                </span>
              </div>

              <div className="border-t-2 border-ink p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-600">
                  {d.brand ?? "Doom"}
                </p>
                <h3 className="mt-0.5 line-clamp-1 text-sm font-bold">{d.title}</h3>
                <p className="mt-1 text-[11px] font-medium capitalize text-ink/55">
                  {d.category} · {d.garmentType}
                </p>

                <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-bold">{rupees(d.price)}</span>
                  {d.mrp && d.mrp > d.price && (
                    <span className="text-xs font-medium text-ink/45 line-through">
                      {rupees(d.mrp)}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {d.sizes.slice(0, 5).map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-ink/25 px-1.5 py-0.5 text-[9px] font-bold"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => startEdit(d)} className="btn-white btn-sm flex-1">
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => toggleActive(d)}
                    aria-label={d.isActive ? "Hide listing" : "Show listing"}
                    className="btn btn-sm border-ink/30 bg-white"
                  >
                    {d.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    onClick={() => remove(d)}
                    aria-label="Remove listing"
                    className="btn btn-sm border-ink/30 bg-white hover:bg-ink hover:text-white"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <Link
                  href={`/products/${d.id}`}
                  className="mt-2 block text-center text-[11px] font-bold uppercase tracking-widest text-pink-600 hover:underline"
                >
                  View in store
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}