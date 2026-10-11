"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  Heart,
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  LayoutGrid,
  Package,
  ChevronDown,
} from "lucide-react"
import { useAccounts } from "@/components/account-provider"
import { useOrders } from "@/components/orders-provider"
import { useCart } from "@/components/cart-provider"

const navLinks = [
  { label: "Dogs", href: "/products?category=dog" },
  { label: "Cats", href: "/products?category=cat" },
  { label: "New In", href: "/products?sort=new" },
  { label: "Sale", href: "/products?sort=discount" },
  { label: "Size Guide", href: "/size-guide" },
]

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAdmin, logout } = useAccounts()
  const { orders } = useOrders()
  const { count } = useCart()

  const [query, setQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMenuOpen(false)
    setAccountOpen(false)
  }, [pathname])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products")
    setMenuOpen(false)
  }

const activeOrders = orders.filter(
  (o) => o.status !== "delivered" && o.status !== "cancelled"
).length

  const shipQueue = orders.filter(
    (o) =>
      o.status === "placed" || o.status === "confirmed" || o.status === "packed"
  ).length

  return (
    <>
      {/* ticker */}
      <div className="overflow-hidden border-b-2 border-ink bg-pink-500 py-1.5">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex shrink-0 items-center gap-8 pr-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="flex shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white"
                >
                  <span className="animate-wiggle">✦</span>
                  {[
                    "Free shipping over ₹1,499",
                    "New in: festive edits",
                    "30-day easy returns",
                    "Sizes XXS–4XL",
                    "Designed by pet parents",
                    "Secure Stripe checkout",
                  ][i]}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b-2 border-ink bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="wrap flex h-[68px] items-center gap-3 lg:gap-6">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="-ml-2 p-2 lg:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link
            href="/"
            className="group flex shrink-0 items-center"
            aria-label="Doom — home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Doom"
              width={140}
              height={51}
              className="h-8 w-auto transition-transform duration-200 group-hover:scale-[1.06] sm:h-10"
            />
          </Link>

          <form onSubmit={submit} className="hidden min-w-0 flex-1 lg:block">
            <div className="flex max-w-xl items-center overflow-hidden rounded-full border-2 border-ink bg-pink-50">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are we wearing?"
                className="w-full min-w-0 bg-transparent px-5 py-2.5 text-sm font-medium placeholder:text-ink/50 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="shrink-0 border-l-2 border-ink bg-pink-500 px-4 py-2.5 text-white transition-colors hover:bg-pink-600"
              >
                <Search size={17} />
              </button>
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:gap-3">
            {/* wishlist */}
            <Link
              href="/products"
              className="hidden flex-col items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors hover:text-pink-500 md:flex"
            >
              <Heart size={20} />
              Wishlist
            </Link>

            {/* account */}
            <div ref={accountRef} className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setAccountOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full border-2 border-ink bg-white px-2.5 py-1.5 transition-shadow hover:shadow-sticker-sm"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-pink-100 text-sm">
                      {user.avatar}
                    </span>
                    <span className="hidden text-[11px] font-bold uppercase leading-tight sm:block">
                      {isAdmin ? "Admin" : (user.name ?? "buyer").split(" ")[0]}
                    </span>
                    <ChevronDown size={14} />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 animate-pop rounded-sticker border-2 border-ink bg-white shadow-sticker">
                      <div className="flex items-center gap-3 border-b-2 border-dashed border-ink/20 p-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-pink-100 text-xl">
                          {user.avatar}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{user.name}</p>
                          <p className="truncate text-[11px] text-ink/60">
                            {user.email}
                          </p>
                          <span className="tag mt-1 border-pink-500 text-pink-600">
                            {isAdmin ? "Studio Admin" : "Buyer"}
                          </span>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          href="/account"
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-pink-100"
                        >
                          <LayoutDashboard size={16} /> My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-pink-100"
                        >
                          <Package size={16} /> My Orders
                          {activeOrders > 0 && (
                            <span className="ml-auto rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
                              {activeOrders}
                            </span>
                          )}
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              href="/admin/orders"
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-pink-100"
                            >
                              <Package size={16} /> Fulfilment
                              {shipQueue > 0 && (
                                <span className="ml-auto rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                  {shipQueue}
                                </span>
                              )}
                            </Link>
                            <Link
                              href="/admin/catalogue"
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-pink-100"
                            >
                              <LayoutGrid size={16} /> Catalogue
                            </Link>
                            <Link
                              href="/admin/designs"
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-pink-100"
                            >
                              <span className="text-base leading-none">✦</span> Seller Studio
                            </Link>
                          </>
                        )}
                        <button
                          onClick={() => {
                            logout()
                            router.push("/")
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-pink-100"
                        >
                          <LogOut size={16} /> Log out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-full border-2 border-ink bg-pink-500 px-4 py-2 text-xs font-bold uppercase text-white shadow-sticker-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
              )}
            </div>

            {/* bag */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-full border-2 border-ink bg-white px-3.5 py-2 transition-shadow hover:shadow-sticker-sm"
            >
              <ShoppingBag size={19} />
              <span className="hidden text-[11px] font-bold uppercase sm:block">
                Bag
              </span>
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-ink bg-pink-500 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* mobile search */}
        <div className="wrap pb-3 lg:hidden">
          <form onSubmit={submit}>
            <div className="flex items-center overflow-hidden rounded-full border-2 border-ink bg-pink-50">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are we wearing?"
                className="w-full bg-transparent px-4 py-2.5 text-sm focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="border-l-2 border-ink bg-pink-500 px-4 py-2.5 text-white"
              >
                <Search size={17} />
              </button>
            </div>
          </form>
        </div>

        {/* category nav */}
        <nav className="hidden border-t-2 border-ink lg:block">
          <div className="wrap flex h-12 items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-pink-500"
              >
                {link.label}
              </Link>
            ))}
            <span className="ml-auto flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-pink-500" />
              Sale live now
            </span>
          </div>
        </nav>

        {/* mobile drawer */}
        {menuOpen && (
          <div className="animate-slide-up border-t-2 border-ink bg-pink-50 lg:hidden">
            <div className="wrap flex flex-col py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="border-b-2 border-dashed border-ink/15 py-3.5 text-sm font-bold uppercase tracking-widest"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="py-3.5 text-sm font-bold uppercase tracking-widest text-pink-600"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="py-3.5 text-sm font-bold uppercase tracking-widest text-pink-600"
                  >
                    My Orders
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="py-3.5 text-sm font-bold uppercase tracking-widest text-pink-600"
                >
                  Sign in / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}