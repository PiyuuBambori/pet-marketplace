"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  AtSign,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useAccounts } from "@/components/account-provider"

export default function LoginPage() {
  const router = useRouter()
  const { login, user, hydrated, configured } = useAccounts()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (hydrated && user) router.replace("/account")
  }, [hydrated, user, router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setBusy(true)
    const result = await login(email, password)
    if (result.ok) router.push("/account")
    else setError(result.error ?? "Could not sign in.")
    setBusy(false)
  }

  return (
    <main className="wrap py-14">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        {/* form */}
        <div className="sticker p-7 sm:p-9">
          <div className="mb-7">
            <span className="tag border-pink-500 text-pink-600">Welcome back</span>
            <h1 className="mt-3 text-3xl uppercase">Sign in</h1>
            <p className="mt-2 text-sm font-medium text-ink/60">
              Pick up where you left off — your bag and orders are waiting.
            </p>
          </div>

          {!configured && (
            <p className="mb-5 rounded-full border-2 border-ink bg-pink-100 px-4 py-2.5 text-sm font-bold">
              Supabase is not configured, so sign-in is unavailable.
            </p>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-pink-50 px-4 focus-within:border-pink-500">
                <AtSign size={16} className="shrink-0 text-ink/40" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            {error && (
              <p className="rounded-full border-2 border-ink bg-pink-100 px-4 py-2.5 text-sm font-bold">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !configured}
              className="btn-pink w-full"
            >
              {busy ? "Signing in…" : "Sign In"}
              {!busy && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-0.5 flex-1 bg-ink/15" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
              or
            </span>
            <span className="h-0.5 flex-1 bg-ink/15" />
          </div>

          <p className="text-center text-sm font-medium text-ink/65">
            New to Doom?{" "}
            <Link href="/register" className="font-bold text-pink-600 hover:underline">
              Create a profile
            </Link>
          </p>
        </div>

        {/* explainer */}
        <div className="flex flex-col gap-5">
          <div className="relative overflow-hidden rounded-sticker border-2 border-ink bg-pink-500 p-7 text-white shadow-sticker-lg">
            <div className="halftone halftone-light absolute inset-0 opacity-25" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-pink-600">
                <Sparkles size={12} /> Studio Access
              </span>
              <h2 className="mt-4 text-2xl uppercase leading-tight">
                One permanent admin profile
              </h2>
              <p className="mt-2 text-sm font-medium text-white/90">
                The studio account is managed in Supabase Auth and can never be
                deleted. It is the only profile that can post products or manage
                fulfilment.
              </p>
              <p className="mt-4 rounded-xl border-2 border-ink bg-white/15 p-4 text-xs font-medium">
                Its credentials are intentionally not shown here. If you need the
                admin email or to reset the password, use the
                <span className="font-bold"> npm run db:seed </span>
                script or the Supabase dashboard.
              </p>
            </div>
          </div>

          <div className="sticker flex-1 p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-pink-100">
                <ShieldCheck size={17} className="text-pink-500" />
              </span>
              <h3 className="text-base uppercase">How profiles work</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm font-medium text-ink/70">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-pink-500" />
                <span>
                  <strong className="text-ink">Admin</strong> — permanent, can
                  post and edit listings and manage fulfilment.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-pink-300" />
                <span>
                  <strong className="text-ink">Buyer profiles</strong> — create
                  as many as you like. Each keeps its own order history and
                  addresses.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-pink-200" />
                <span>
                  Accounts live in Supabase, so orders follow you across devices
                  and survive a cache clear.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}