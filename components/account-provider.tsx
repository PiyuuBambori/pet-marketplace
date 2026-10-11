"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { createClient } from "@/lib/supabase/client"
import type { Account, Address } from "@/lib/accounts"

type AccountContextValue = {
  hydrated: boolean
  user: Account | null
  isAdmin: boolean
  configured: boolean
  refresh: () => Promise<void>
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>
  registerBuyer: (input: {
    name: string
    email: string
    password: string
    avatar: string
    phone: string
  }) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (patch: Partial<Account>) => Promise<void>
  addAddress: (address: Address) => void
  removeAddress: (index: number) => void
}

const AccountContext = createContext<AccountContextValue | null>(null)

/**
 * Auth state comes entirely from Supabase.
 *
 * There is deliberately no localStorage fallback: an offline sign-in path
 * would have to trust client-side credentials, which is an auth bypass, and
 * it would put passwords in browser storage. If Supabase is unreachable the
 * honest answer is "you cannot sign in right now".
 */
export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [configured, setConfigured] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setConfigured(Boolean(supabase))
  }, [supabase])

  const refresh = useCallback(async () => {
    if (!supabase) {
      setUser(null)
      return
    }

    try {
      const res = await fetch("/api/session", { cache: "no-store" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    }
  }, [supabase])

  useEffect(() => {
    if (!supabase) {
      setHydrated(true)
      return
    }

    let active = true

    // getSession() here is only for knowing whether a cookie exists.
    // Authorisation always re-verifies server-side via auth.getUser().
    supabase.auth.getSession().then(() => {
      if (!active) return
      void refresh()
      setHydrated(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (active) void refresh()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase, refresh])

  const login = useCallback<AccountContextValue["login"]>(
    async (email, password) => {
      if (!supabase) {
        return { ok: false, error: "Sign-in is not configured on this deployment." }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        return {
          ok: false,
          error:
            error.message === "Invalid login credentials"
              ? "Incorrect email or password."
              : error.message,
        }
      }

      await refresh()
      return { ok: true }
    },
    [supabase, refresh]
  )

  const registerBuyer = useCallback<AccountContextValue["registerBuyer"]>(
    async (input) => {
      // Goes through /api/session rather than supabase.auth.signUp: the server
      // creates the confirmed account without sending an email, which is what
      // keeps registration off Supabase's mail rate limit.
      let response: Response
      try {
        response = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "register",
            name: input.name.trim(),
            email: input.email.trim(),
            password: input.password,
            avatar: input.avatar,
            phone: input.phone.trim(),
          }),
        })
      } catch {
        return { ok: false, error: "Could not reach the server. Check your connection." }
      }

      let payload: { user?: unknown; error?: string } = {}
      try {
        payload = await response.json()
      } catch {
        // fall through to the generic message below
      }

      if (!response.ok) {
        return {
          ok: false,
          error: payload.error ?? "Could not create your account.",
        }
      }

      await refresh()
      return { ok: true }
    },
    [refresh]
  )

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }, [supabase])

  const updateProfile = useCallback<AccountContextValue["updateProfile"]>(
    async (patch) => {
      if (!supabase || !user) return

      const { id, role, ...safe } = patch
      void id
      void role

      const { error } = await supabase.auth.updateUser({
        data: {
          name: safe.name ?? undefined,
          phone: safe.phone ?? undefined,
          avatar: safe.avatar ?? undefined,
        },
      })
      if (error) throw new Error(error.message)

      await refresh()
    },
    [supabase, user, refresh]
  )

  // Addresses are not part of the auth profile; keep them in memory for the
  // session so checkout can reuse them.
  const [addresses, setAddresses] = useState<Address[]>([])

  const addAddress = useCallback((address: Address) => {
    setAddresses((current) => [...current, address])
  }, [])

  const removeAddress = useCallback((index: number) => {
    setAddresses((current) => current.filter((_, i) => i !== index))
  }, [])

  const withAddresses = useMemo(
    () => (user ? { ...user, addresses } : null),
    [user, addresses]
  )

  const value = useMemo<AccountContextValue>(
    () => ({
      hydrated,
      user: withAddresses,
      isAdmin: withAddresses?.role === "admin",
      configured,
      refresh,
      login,
      registerBuyer,
      logout,
      updateProfile,
      addAddress,
      removeAddress,
    }),
    [
      hydrated,
      withAddresses,
      configured,
      refresh,
      login,
      registerBuyer,
      logout,
      updateProfile,
      addAddress,
      removeAddress,
    ]
  )

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  )
}

export function useAccounts() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error("useAccounts must be used inside AccountProvider")
  return ctx
}
