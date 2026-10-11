"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Check,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  Trash2,
  Upload,
  LayoutDashboard,
  ClipboardList,
  LayoutGrid,
} from "lucide-react"
import { useAccounts } from "@/components/account-provider"
import OrderCard from "@/components/order-card"
import { useOrders } from "@/components/orders-provider"
import { AVATARS, formatDate, formatRupees, type Address } from "@/lib/accounts"

type Tab = "overview" | "orders" | "addresses" | "settings"

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Settings", icon: Pencil },
]

export default function AccountDashboard() {
  const router = useRouter()
  const {
    user,
    isAdmin,
    hydrated,
    logout,
    updateProfile,
    addAddress,
    removeAddress,
  } = useAccounts()
  const { myOrders, loading, advanceOrder, cancelOrder } = useOrders()

  const [tab, setTab] = useState<Tab>("overview")

  useEffect(() => {
    if (hydrated && !user) router.replace("/login")
  }, [hydrated, user, router])

  if (!hydrated) {
    return (
      <main className="wrap py-20 text-center">
        <p className="font-bold uppercase tracking-widest text-ink/40">Loading…</p>
      </main>
    )
  }

  if (!user) return null

  const active = myOrders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  )
  const past = myOrders.filter(
    (o) => o.status === "delivered" || o.status === "cancelled"
  )
  const lifetime = myOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0)
  const units = myOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((n, o) => n + o.items.reduce((s, i) => s + i.quantity, 0), 0)

  return (
    <main className="wrap py-10">
      {/* profile header */}
      <header className="relative overflow-hidden rounded-sticker border-2 border-ink bg-pink-500 p-7 text-white shadow-sticker-lg">
        <div className="halftone halftone-light absolute inset-0 opacity-25" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="animate-bob flex h-20 w-20 items-center justify-center rounded-full border-2 border-ink bg-white text-4xl shadow-sticker">
              {user.avatar}
            </span>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-pink-600">
                {isAdmin ? "✦ Studio Admin" : "Buyer Profile"}
              </span>
              <h1 className="mt-2 truncate text-3xl uppercase">{user.name}</h1>
              <p className="truncate text-sm font-medium text-white/85">
                {user.email}
                {user.phone && ` · ${user.phone}`}
              </p>
              {!isAdmin && (
                <p className="mt-1 text-xs font-semibold text-white/70">
                  Member since {formatDate(user.createdAt)}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            {isAdmin && (
              <>
                <Link href="/admin/orders" className="btn-white btn-sm">
                  <ClipboardList size={14} /> Fulfilment
                </Link>
                <Link href="/admin/catalogue" className="btn-white btn-sm">
                  <LayoutGrid size={14} /> Catalogue
                </Link>
                <Link href="/admin/designs" className="btn-white btn-sm">
                  <Upload size={14} /> Seller Studio
                </Link>
              </>
            )}
            <button
              onClick={() => {
                void logout()
                router.push("/")
              }}
              className="btn btn-sm border-white/50 bg-transparent text-white hover:bg-white hover:text-ink"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>
      </header>

      {/* stat cards */}
      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Orders", value: myOrders.length, tone: "bg-pink-100" },
          { label: "In Transit", value: active.length, tone: "bg-pink-200" },
          { label: "Items Bought", value: units, tone: "bg-pink-300" },
          {
            label: "Lifetime Spend",
            value: formatRupees(lifetime),
            tone: "bg-pink-500 text-white",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-sticker border-2 border-ink p-5 shadow-sticker-sm ${stat.tone}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-2xl uppercase sm:text-3xl">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* tabs */}
      <nav className="mt-8 flex flex-wrap gap-2 border-b-2 border-dashed border-ink/20 pb-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`chip ${tab === id ? "chip-on" : ""}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="space-y-6">
            <section>
              <h2 className="mb-4 text-xl uppercase">Current orders</h2>
              {active.length === 0 ? (
                <EmptyState
                  title="Nothing on the way"
                  body="When you place an order it will show up here with live tracking."
                  href="/products"
                  cta="Start shopping"
                />
              ) : (
                <div className="space-y-5">
                  {active.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      viewerRole={isAdmin ? "admin" : "buyer"}
                      onAdvance={isAdmin ? advanceOrder : undefined}
                      onCancel={isAdmin ? cancelOrder : undefined}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-xl uppercase">Past orders</h2>
              {past.length === 0 ? (
                <EmptyState
                  title="No purchase history yet"
                  body="Your completed and cancelled orders will be archived here."
                  href="/products"
                  cta="Browse products"
                />
              ) : (
                <div className="space-y-5">
                  {past.slice(0, 3).map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-5">
            <h2 className="text-xl uppercase">All orders</h2>
            {myOrders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                body="Place your first order and track it from packed to delivered."
                href="/products"
                cta="Start shopping"
              />
            ) : (
              myOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  viewerRole={isAdmin ? "admin" : "buyer"}
                  onAdvance={isAdmin ? advanceOrder : undefined}
                  onCancel={isAdmin ? cancelOrder : undefined}
                />
              ))
            )}
          </div>
        )}

        {tab === "addresses" && (
          <AddressManager
            addresses={user.addresses}
            onAdd={addAddress}
            onRemove={removeAddress}
          />
        )}

        {tab === "settings" && (
          <SettingsPanel
            isAdmin={isAdmin}
            name={user.name ?? ""}
            email={user.email}
            phone={user.phone ?? ""}
            avatar={user.avatar}
            onSave={updateProfile}
          />
        )}
      </div>
    </main>
  )
}

function EmptyState({
  title,
  body,
  href,
  cta,
}: {
  title: string
  body: string
  href: string
  cta: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-sticker border-2 border-dashed border-ink/30 bg-pink-50 px-6 py-14 text-center">
      <span className="text-4xl">🐾</span>
      <h3 className="text-lg uppercase">{title}</h3>
      <p className="max-w-sm text-sm font-medium text-ink/60">{body}</p>
      <Link href={href} className="btn-pink btn-sm mt-2">
        {cta}
      </Link>
    </div>
  )
}

function AddressManager({
  addresses,
  onAdd,
  onRemove,
}: {
  addresses: Address[]
  onAdd: (address: Address) => void
  onRemove: (index: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Address>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  })

  const valid =
    draft.fullName.trim() &&
    draft.phone.trim() &&
    draft.line1.trim() &&
    draft.city.trim() &&
    draft.zip.trim()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl uppercase">Saved addresses</h2>
        <button onClick={() => setOpen((v) => !v)} className="btn-pink btn-sm">
          {open ? <Check size={14} /> : <Plus size={14} />}
          {open ? "Close" : "Add address"}
        </button>
      </div>

      {open && (
        <div className="sticker animate-pop p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["fullName", "Full name"],
                ["phone", "Phone"],
                ["line1", "Address line 1"],
                ["line2", "Address line 2 (optional)"],
                ["city", "City"],
                ["state", "State"],
                ["zip", "PIN code"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest">
                  {label}
                </label>
                <input
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-2.5 text-sm font-medium focus:border-pink-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
          <button
            disabled={!valid}
            onClick={() => {
              onAdd(draft)
              setDraft({
                fullName: "",
                phone: "",
                line1: "",
                line2: "",
                city: "",
                state: "",
                zip: "",
                country: "India",
              })
              setOpen(false)
            }}
            className="btn-pink mt-5"
          >
            Save address
          </button>
        </div>
      )}

      {addresses.length === 0 ? (
        <EmptyState
          title="No saved addresses"
          body="Save an address to check out faster next time."
          href="#"
          cta="Add your first"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address, i) => (
            <div key={i} className="sticker p-5">
              <p className="text-sm font-bold">{address.fullName}</p>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-ink/60">
                {address.line1}
                {address.line2 && <>, {address.line2}</>}
                <br />
                {address.city}, {address.state} {address.zip}
                <br />
                {address.country}
              </p>
              <p className="mt-2 text-xs font-semibold">{address.phone}</p>
              <button
                onClick={() => onRemove(i)}
                className="mt-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-ink/45 transition-colors hover:text-pink-600"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SettingsPanel({
  isAdmin,
  name,
  email,
  phone,
  avatar,
  onSave,
}: {
  isAdmin: boolean
  name: string
  email: string
  phone: string
  avatar: string
  onSave: (patch: { name?: string; phone?: string; avatar?: string }) => void
}) {
  const [draftName, setDraftName] = useState(name)
  const [draftPhone, setDraftPhone] = useState(phone)
  const [draftAvatar, setDraftAvatar] = useState(avatar)
  const [saved, setSaved] = useState(false)

  const dirty =
    draftName !== name || draftPhone !== phone || draftAvatar !== avatar

  return (
    <div className="max-w-2xl space-y-6">
      <div className="sticker p-6">
        <h2 className="text-xl uppercase">Profile details</h2>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest">
              Name
            </label>
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest">
              Email
            </label>
            <input
              value={email}
              disabled
              className="w-full rounded-full border-2 border-ink/25 bg-ink/5 px-4 py-3 text-sm font-semibold text-ink/50"
            />
            <p className="mt-1.5 text-xs font-medium text-ink/45">
              {isAdmin
                ? "The permanent admin email cannot be changed."
                : "Email cannot be changed in this demo."}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest">
              Phone
            </label>
            <input
              value={draftPhone}
              onChange={(e) => setDraftPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest">
              Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((option) => (
                <button
                  key={option}
                  onClick={() => setDraftAvatar(option)}
                  aria-label={`Avatar ${option}`}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink text-xl transition-all ${
                    draftAvatar === option
                      ? "bg-pink-500 shadow-sticker-sm"
                      : "bg-white hover:bg-pink-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!dirty}
            onClick={() => {
              onSave({ name: draftName, phone: draftPhone, avatar: draftAvatar })
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
            }}
            className="btn-pink"
          >
            {saved ? "Saved ✓" : "Save changes"}
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="relative overflow-hidden rounded-sticker border-2 border-ink bg-pink-500 p-6 text-white">
          <div className="halftone halftone-light absolute inset-0 opacity-25" />
          <div className="relative">
            <h3 className="text-lg uppercase">Permanent admin</h3>
            <p className="mt-2 text-sm font-medium text-white/85">
              This profile is always available, cannot be deleted or demoted, and
              is the only account with access to the Seller Studio where new
              products are posted.
            </p>
            <Link href="/admin/designs" className="btn-white btn-sm mt-5">
              <Upload size={14} /> Open Seller Studio
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}