"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, AtSign, Check, Eye, EyeOff, Lock, Phone, User } from "lucide-react"
import { useAccounts } from "@/components/account-provider"
import { AVATARS } from "@/lib/accounts"

export default function RegisterPage() {
  const router = useRouter()
  const { registerBuyer, user, hydrated } = useAccounts()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (hydrated && user) router.replace("/account")
  }, [hydrated, user, router])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setBusy(true)

    void (async () => {
      await new Promise((resolve) => setTimeout(resolve, 350))
      const result = await registerBuyer({ name, email, password, avatar, phone })
      if (result.ok) router.push("/account")
      else setError(result.error ?? "Could not create your profile.")
      setBusy(false)
    })()
  }

  const valid =
    name.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 6

  return (
    <main className="wrap py-14">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        <div className="sticker p-7 sm:p-9">
          <span className="tag border-pink-500 text-pink-600">New here</span>
          <h1 className="mt-3 text-3xl uppercase">Create your profile</h1>
          <p className="mt-2 text-sm font-medium text-ink/60">
            One profile per pet parent. Track orders, save addresses, and keep
            your bag ready for next time.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest">
                Your name
              </label>
              <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-pink-50 px-4 focus-within:border-pink-500">
                <User size={16} className="shrink-0 text-ink/40" />
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ananya Sharma"
                  className="w-full bg-transparent py-3 text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-pink-50 px-4 focus-within:border-pink-500">
                <AtSign size={16} className="shrink-0 text-ink/40" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent py-3 text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest">
                Phone <span className="font-medium text-ink/40">(optional)</span>
              </label>
              <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-pink-50 px-4 focus-within:border-pink-500">
                <Phone size={16} className="shrink-0 text-ink/40" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-transparent py-3 text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest">
                Password
              </label>
              <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-pink-50 px-4 focus-within:border-pink-500">
                <Lock size={16} className="shrink-0 text-ink/40" />
                <input
                  required
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-transparent py-3 text-sm font-medium focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="shrink-0 text-ink/40 hover:text-pink-500"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="mt-1.5 pl-4 text-xs font-bold text-pink-600">
                  {6 - password.length} more character
                  {6 - password.length === 1 ? "" : "s"} needed
                </p>
              )}
            </div>

            {/* avatar picker */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest">
                Pick an avatar
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAvatar(option)}
                    aria-label={`Avatar ${option}`}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink text-xl transition-all ${
                      avatar === option
                        ? "bg-pink-500 shadow-sticker-sm"
                        : "bg-white hover:bg-pink-100"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="rounded-full border-2 border-ink bg-pink-100 px-4 py-2.5 text-sm font-bold">
                {error}
              </p>
            )}

            <button type="submit" disabled={!valid || busy} className="btn-pink w-full">
              {busy ? "Creating profile…" : "Create Profile"}
              {!busy && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-5 text-center text-sm font-medium text-ink/65">
            Already have a profile?{" "}
            <Link href="/login" className="font-bold text-pink-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* preview */}
        <div className="flex flex-col gap-5">
          <div className="relative overflow-hidden rounded-sticker border-2 border-ink bg-pink-100 p-7 shadow-sticker">
            <div className="halftone absolute inset-0 opacity-40" />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-600">
                Profile preview
              </p>
              <div className="mt-5 flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink bg-white text-3xl shadow-sticker-sm">
                  {avatar}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xl uppercase">
                    {name.trim() || "Your Name"}
                  </p>
                  <p className="truncate text-sm font-medium text-ink/60">
                    {email.trim() || "you@example.com"}
                  </p>
                  <span className="tag mt-1.5 border-pink-500 bg-white text-pink-600">
                    Buyer
                  </span>
                </div>
              </div>

              <ul className="mt-6 space-y-2.5 text-sm font-medium text-ink/70">
                {[
                  "Track every order from placed to delivered",
                  "See your full purchase history any time",
                  "Save multiple delivery addresses",
                  "Reorder your furbaby's favourites in one tap",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0 text-pink-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sticker flex-1 p-6">
            <h3 className="text-base uppercase">Want to sell instead?</h3>
            <p className="mt-2 text-sm font-medium text-ink/65">
              The studio admin account is permanent and can post new products
              any time — no sign-up needed.
            </p>
            <Link href="/login" className="btn-ink btn-sm mt-5">
              Studio Access
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}