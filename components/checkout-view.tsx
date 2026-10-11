"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  ChevronLeft,
  CreditCard,
  Lock,
  Smartphone,
  Wallet,
  Landmark,
  ShieldCheck,
  UserCog,
} from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useAccounts } from "@/components/account-provider"
import { formatPrice } from "@/lib/products"

const SHIPPING_FEE = 79
const FREE_SHIPPING_THRESHOLD = 1499

const paymentMethods = [
  { id: "Card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "UPI", label: "UPI", icon: Smartphone },
  { id: "Net Banking", label: "Net Banking", icon: Landmark },
  { id: "Wallet", label: "Wallet", icon: Wallet },
]

export default function CheckoutView() {
  const router = useRouter()
  const { lines, subtotal, savings, clear } = useCart()
  const { user, hydrated, placeOrder } = useAccounts()

  const [step, setStep] = useState<1 | 2>(1)
  const [payment, setPayment] = useState("Card")
  const [processing, setProcessing] = useState(false)
  const [promo, setPromo] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  })

  // prefill from the signed-in profile
  useEffect(() => {
    if (!user) return
    setAddress((current) => ({
      ...current,
      fullName: current.fullName || user.name,
      phone: current.phone || user.phone || "",
    }))
  }, [user])

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE
  const promoDiscount = promoApplied ? Math.round(subtotal * 0.1) : 0
  const taxed = subtotal - promoDiscount
  const tax = Math.round(taxed * 0.08)
  const total = taxed + shipping + tax

  const addressValid = Boolean(
    address.fullName.trim() &&
      address.phone.trim() &&
      address.line1.trim() &&
      address.city.trim() &&
      address.zip.trim()
  )

  async function placeOrderNow() {
    if (!user) {
      router.push("/login")
      return
    }
    setProcessing(true)

    const order = placeOrder({
      items: lines.map((line) => ({
        productId: line.productId,
        name: line.name,
        brand: line.brand,
        image: line.image,
        price: line.price,
        mrp: line.mrp,
        size: line.size,
        color: line.color,
        quantity: line.quantity,
      })),
      subtotal,
      shipping,
      tax,
      discount: savings + promoDiscount,
      address,
      paymentMethod: payment,
    })

    // try Stripe first; fall back to the local demo flow when unconfigured
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((line) => ({
            name: `${line.name} (${line.size} / ${line.color})`,
            price: line.price,
            quantity: line.quantity,
          })),
          customerEmail: user.email,
          shippingAddress: address,
        }),
      })
      const data = await response.json()
      if (response.ok && data.url) {
        window.location.href = data.url
        return
      }
    } catch {
      /* Stripe unavailable — continue with the demo flow */
    }

    await new Promise((resolve) => setTimeout(resolve, 900))
    clear()
    router.push(`/checkout/success?order=${order?.id ?? ""}`)
    setProcessing(false)
  }

  if (!hydrated) {
    return (
      <main className="wrap py-20 text-center">
        <p className="font-bold uppercase tracking-widest text-ink/40">Loading…</p>
      </main>
    )
  }

  if (lines.length === 0) {
    return (
      <main className="wrap py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <span className="text-5xl">🧾</span>
          <h1 className="text-2xl uppercase">Nothing to check out</h1>
          <p className="text-sm font-medium text-ink/60">
            Your bag is empty. Add something first.
          </p>
          <Link href="/products" className="btn-pink mt-2">
            Browse products
          </Link>
        </div>
      </main>
    )
  }

  const steps = ["Address", "Payment"]

  return (
    <main className="wrap py-8">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-ink/55 hover:text-pink-600"
      >
        <ChevronLeft size={16} /> Back to bag
      </Link>

      {/* steps */}
      <ol className="mb-8 flex flex-wrap items-center gap-3">
        {steps.map((label, i) => {
          const n = i + 1
          const active = step === n
          const done = step > n
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink text-xs font-bold ${
                  active
                    ? "bg-pink-500 text-white"
                    : done
                      ? "bg-success text-white"
                      : "bg-white text-ink/40"
                }`}
              >
                {done ? <Check size={14} /> : n}
              </span>
              <span
                className={`text-sm uppercase ${active ? "font-display" : "font-bold text-ink/45"}`}
              >
                {label}
              </span>
              {i === 0 && <span className="h-0.5 w-10 bg-ink/20 sm:w-20" />}
            </li>
          )
        })}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {/* sign-in nudge */}
          {!user && (
            <div className="flex flex-col items-start gap-3 rounded-sticker border-2 border-ink bg-pink-500 p-5 text-white shadow-sticker sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-pink-500">
                  <UserCog size={19} />
                </span>
                <div>
                  <p className="text-sm font-bold uppercase">
                    Sign in to place your order
                  </p>
                  <p className="text-xs font-medium text-white/85">
                    You need a profile so you can track this order later.
                  </p>
                </div>
              </div>
              <Link href="/login" className="btn-white btn-sm shrink-0">
                Sign in
              </Link>
            </div>
          )}

          {user && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-sticker border-2 border-ink bg-pink-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-white text-lg">
                  {user.avatar}
                </span>
                <div>
                  <p className="text-sm font-bold">Ordering as {user.name}</p>
                  <p className="text-xs font-medium text-ink/55">{user.email}</p>
                </div>
              </div>
              <Link
                href="/account"
                className="text-[11px] font-bold uppercase tracking-widest text-pink-600 hover:underline"
              >
                Switch profile
              </Link>
            </div>
          )}

          {/* address */}
          {step === 1 && (
            <section className="sticker p-6">
              <h2 className="mb-5 text-lg uppercase">Delivery address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["fullName", "Full name", "text"],
                    ["phone", "Phone", "tel"],
                  ] as const
                ).map(([key, label, type]) => (
                  <div key={key}>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={address[key]}
                      onChange={(e) =>
                        setAddress({ ...address, [key]: e.target.value })
                      }
                      className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                ))}

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                    Address line 1
                  </label>
                  <input
                    value={address.line1}
                    onChange={(e) =>
                      setAddress({ ...address, line1: e.target.value })
                    }
                    className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                    Address line 2 <span className="font-medium">(optional)</span>
                  </label>
                  <input
                    value={address.line2}
                    onChange={(e) =>
                      setAddress({ ...address, line2: e.target.value })
                    }
                    className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
                  />
                </div>

                {(
                  [
                    ["city", "City"],
                    ["state", "State"],
                    ["zip", "PIN code"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                      {label}
                    </label>
                    <input
                      value={address[key]}
                      onChange={(e) =>
                        setAddress({ ...address, [key]: e.target.value })
                      }
                      className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!addressValid}
                className="btn-pink mt-6 w-full disabled:opacity-40"
              >
                Continue to payment
              </button>
              {!addressValid && (
                <p className="mt-2 text-center text-xs font-semibold text-ink/50">
                  Fill in name, phone, address, city and PIN code to continue.
                </p>
              )}
            </section>
          )}

          {/* payment */}
          {step === 2 && (
            <>
              <section className="sticker p-6">
                <h2 className="mb-5 text-lg uppercase">Payment method</h2>
                <div className="space-y-3">
                  {paymentMethods.map(({ id, label, icon: Icon }) => (
                    <label
                      key={id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                        payment === id
                          ? "border-pink-500 bg-pink-100 shadow-sticker-sm"
                          : "border-ink/25 bg-white hover:border-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={id}
                        checked={payment === id}
                        onChange={() => setPayment(id)}
                        className="h-4 w-4 accent-[#ff2e88]"
                      />
                      <Icon size={18} className="text-pink-500" />
                      <span className="text-sm font-bold">{label}</span>
                      {payment === id && (
                        <Check size={16} className="ml-auto text-pink-500" />
                      )}
                    </label>
                  ))}
                </div>

                {payment === "Card" && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                        Card number
                      </label>
                      <input
                        placeholder="4242 4242 4242 4242"
                        className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                        Expiry
                      </label>
                      <input
                        placeholder="MM / YY"
                        className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink/50">
                        CVV
                      </label>
                      <input
                        placeholder="123"
                        className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-3 text-sm focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <p className="mt-6 flex items-start gap-2 rounded-xl border-2 border-ink bg-pink-50 p-3 text-xs font-medium">
                  <Lock size={14} className="mt-0.5 shrink-0 text-pink-500" />
                  Your payment details are encrypted end to end and never stored
                  on our servers.
                </p>
              </section>

              <section className="sticker p-6">
                <h2 className="mb-4 text-lg uppercase">Delivery preference</h2>
                <div className="space-y-3">
                  {[
                    {
                      id: "standard",
                      label: "Standard Delivery",
                      eta: "4–6 business days",
                      price: 0,
                    },
                    {
                      id: "express",
                      label: "Express Delivery",
                      eta: "2–3 business days",
                      price: 199,
                    },
                  ].map((method, i) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                        i === 0
                          ? "border-pink-500 bg-pink-100"
                          : "border-ink/25 bg-white hover:border-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        defaultChecked={i === 0}
                        className="h-4 w-4 accent-[#ff2e88]"
                      />
                      <span className="flex-1">
                        <span className="block text-sm font-bold">
                          {method.label}
                        </span>
                        <span className="block text-xs font-medium text-ink/55">
                          {method.eta}
                        </span>
                      </span>
                      <span className="text-sm font-bold">
                        {method.price === 0 ? "Free" : formatPrice(method.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        {/* summary */}
        <aside className="h-fit rounded-sticker border-2 border-ink bg-white p-6 shadow-sticker lg:sticky lg:top-32">
          <h2 className="mb-5 text-lg uppercase">Order summary</h2>

          <ul className="mb-5 max-h-64 space-y-3 overflow-y-auto">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-3">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-pink-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={line.image}
                    alt={line.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-ink bg-pink-500 px-1 text-[10px] font-bold text-white">
                    {line.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{line.name}</p>
                  <p className="text-[11px] font-medium text-ink/55">
                    {line.size} · {line.color}
                  </p>
                </div>
                <p className="text-xs font-bold">
                  {formatPrice(line.price * line.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mb-5 flex gap-2">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value.toUpperCase())}
              placeholder="PAWFIRST10"
              className="w-full rounded-full border-2 border-ink bg-pink-50 px-4 py-2.5 text-xs font-bold uppercase focus:border-pink-500 focus:outline-none"
            />
            <button
              onClick={() => setPromoApplied(promo.trim() === "PAWFIRST10")}
              className="btn-ink btn-sm shrink-0"
            >
              Apply
            </button>
          </div>
          {promoApplied && (
            <p className="mb-4 text-xs font-bold text-success">
              PAWFIRST10 applied — 10% off
            </p>
          )}

          <dl className="space-y-2.5 border-t-2 border-dashed border-ink/20 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="font-medium text-ink/55">Total MRP</dt>
              <dd className="font-medium text-ink/55 line-through">
                {formatPrice(subtotal + savings)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-ink/55">Discount</dt>
              <dd className="font-bold text-success">− {formatPrice(savings)}</dd>
            </div>
            {promoApplied && (
              <div className="flex justify-between">
                <dt className="font-medium text-ink/55">Coupon</dt>
                <dd className="font-bold text-success">
                  − {formatPrice(promoDiscount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="font-medium text-ink/55">Shipping</dt>
              <dd className={shipping === 0 ? "font-bold text-success" : "font-bold"}>
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-ink/55">GST (8%)</dt>
              <dd className="font-bold">{formatPrice(tax)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t-2 border-dashed border-ink/20 pt-3">
              <dt className="font-display text-base uppercase">Total payable</dt>
              <dd className="font-display text-xl">{formatPrice(total)}</dd>
            </div>
          </dl>

          {step === 2 ? (
            <button
              onClick={placeOrderNow}
              disabled={processing || !user}
              className="btn-pink mt-6 w-full disabled:opacity-45"
            >
              {processing
                ? "Processing…"
                : user
                  ? `Pay ${formatPrice(total)}`
                  : "Sign in to pay"}
            </button>
          ) : (
            <button
              onClick={() => setStep(2)}
              disabled={!addressValid}
              className="btn-pink mt-6 w-full disabled:opacity-40"
            >
              Continue to payment
            </button>
          )}

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-ink/50">
            <ShieldCheck size={13} className="text-success" />
            Secured by Stripe · 100% protected
          </p>
        </aside>
      </div>
    </main>
  )
}