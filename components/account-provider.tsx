"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  AVATARS,
  PERMANENT_ADMIN,
  canLoginAsAdmin,
  formatDate,
  makeOrderId,
  makeTrackingNumber,
  orderFlow,
  type Account,
  type Address,
  type Order,
  type OrderItem,
  type OrderStatus,
  type SavedDesign,
} from "@/lib/accounts"

const ORDERS_KEY = "doom.orders.v1"
const DESIGNS_KEY = "doom.designs.v1"

type Session = { userId: string; issuedAt: number }

type AccountContextValue = {
  hydrated: boolean
  /** True when the server has confirmed a session. */
  online: boolean
  accounts: Account[]
  user: Account | null
  isAdmin: boolean
  orders: Order[]
  myOrders: Order[]
  designs: SavedDesign[]
  saveDesign: (design: Omit<SavedDesign, "id" | "createdAt">) => Promise<SavedDesign>
  removeDesign: (id: string) => void
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
  placeOrder: (input: {
    items: OrderItem[]
    subtotal: number
    shipping: number
    tax: number
    discount: number
    address: Address
    paymentMethod: string
  }) => Order | null
  advanceOrder: (orderId: string) => void
  cancelOrder: (orderId: string) => void
}

const AccountContext = createContext<AccountContextValue | null>(null)

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable — state stays in memory for this session */
  }
}

/** Orders the app fabricates locally, used only while the API is unreachable. */
function seedOrder(userId: string): Order {
  const now = Date.now()
  const day = 86_400_000
  return {
    id: "PW-DEMO01",
    userId,
    items: [
      {
        productId: "1",
        name: "Cozy Fleece-Lined Dog Hoodie",
        brand: "Doom",
        image: "/photos/dog-hoodie.jpg",
        price: 1299,
        mrp: 2499,
        size: "M",
        color: "Midnight Navy",
        quantity: 1,
      },
      {
        productId: "4",
        name: "Everyday Cotton Bandana",
        brand: "Doom",
        image: "/photos/dog-bandana.jpg",
        price: 399,
        mrp: 799,
        size: "One Size",
        color: "Cherry Red",
        quantity: 2,
      },
    ],
    subtotal: 2097,
    shipping: 0,
    tax: 168,
    discount: 802,
    total: 2265,
    status: "shipped",
    placedAt: now - day * 3,
    estimatedDelivery: now + day * 2,
    address: {
      fullName: "Demo Buyer",
      phone: "+91 98765 43210",
      line1: "42 Bark Street",
      line2: "Flat 3B",
      city: "Bengaluru",
      state: "Karnataka",
      zip: "560001",
      country: "India",
    },
    paymentMethod: "UPI",
    trackingNumber: makeTrackingNumber(),
    timeline: orderFlow.slice(0, 4).map((step, i) => ({
      status: step.status,
      at: now - day * (3 - i),
      note: step.note,
    })),
  }
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [online, setOnline] = useState(false)
  const [user, setUser] = useState<Account | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [designs, setDesigns] = useState<SavedDesign[]>([])
  const [session, setSession] = useState<Session | null>(null)

  // localStorage is only an offline cache now
  useEffect(() => {
    setOrders(readJSON<Order[]>(ORDERS_KEY, []))
    setDesigns(readJSON<SavedDesign[]>(DESIGNS_KEY, []))
    setSession(readJSON<Session | null>("doom.session.v1", null))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJSON(ORDERS_KEY, orders)
  }, [orders, hydrated])

  useEffect(() => {
    if (!hydrated) return
    writeJSON(DESIGNS_KEY, designs)
  }, [designs, hydrated])

  useEffect(() => {
    if (!hydrated) return
    if (session) writeJSON("doom.session.v1", session)
    else
      try {
        window.localStorage.removeItem("doom.session.v1")
      } catch {
        /* ignore */
      }
  }, [session, hydrated])

  /** Ask the server who we are. Sets `online` so the UI can fall back. */
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session", { cache: "no-store" })
      if (!res.ok) throw new Error()
      const data = await res.json()

      if (data.user) {
        setUser(data.user as Account)
        setOnline(true)
      } else {
        setUser(null)
        setOnline(false)
      }
    } catch {
      setOnline(false)
    }
  }, [])

  useEffect(() => {
    if (hydrated) refreshSession()
  }, [hydrated, refreshSession])

  const isAdmin = user?.role === "admin"

  const accounts = useMemo(() => (user ? [user] : []), [user])

  const myOrders = useMemo(
    () =>
      user
        ? orders
            .filter((o) => o.userId === user.id)
            .sort((a, b) => b.placedAt - a.placedAt)
        : [],
    [orders, user]
  )

  const login = useCallback<AccountContextValue["login"]>(
    async (email, password) => {
      // The permanent admin works even before the database exists, so the
      // studio is never locked out of a fresh clone.
      if (canLoginAsAdmin(email, password)) {
        const adminAccount = {
          ...PERMANENT_ADMIN,
          email: ADMIN_EMAIL,
          avatar: "👑",
        } as unknown as Account

        try {
          const res = await fetch("/api/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "login", email, password }),
          })
          if (res.ok) {
            const data = await res.json()
            setUser(data.user as Account)
            setSession({ userId: data.user.id, issuedAt: Date.now() })
            setOnline(true)
            return { ok: true }
          }
        } catch {
          /* fall through to local-only admin */
        }

        setUser(adminAccount)
        setSession({ userId: adminAccount.id, issuedAt: Date.now() })
        return { ok: true, error: undefined }
      }

      try {
        const res = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "login", email, password }),
        })
        const data = await res.json()

        if (!res.ok) {
          // Local fallback so buyers still work without a database
          const local = readJSON<Account[]>("doom.accounts.v1", []).find(
            (a) => a.email === email.trim().toLowerCase()
          )
          if (local) {
            setUser(local)
            setSession({ userId: local.id, issuedAt: Date.now() })
            return { ok: true }
          }
          return { ok: false, error: data.error ?? "Could not sign in." }
        }

        setUser(data.user as Account)
        setSession({ userId: data.user.id, issuedAt: Date.now() })
        setOnline(true)
        return { ok: true }
      } catch {
        const local = readJSON<Account[]>("doom.accounts.v1", []).find(
          (a) => a.email === email.trim().toLowerCase()
        )
        if (local) {
          setUser(local)
          setSession({ userId: local.id, issuedAt: Date.now() })
          return { ok: true }
        }
        return {
          ok: false,
          error:
            "Could not reach the server. Check that the database is configured.",
        }
      }
    },
    []
  )

  const registerBuyer = useCallback<AccountContextValue["registerBuyer"]>(
    async (input) => {
      const account: Account = {
        id: `local_${Date.now().toString(36)}`,
        name: input.name.trim() || "Pet Parent",
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        passwordHash: input.password,
        role: "buyer",
        avatar: input.avatar || AVATARS[0],
        createdAt: Date.now(),
        addresses: [],
      }

      try {
        const res = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "register", ...input }),
        })
        const data = await res.json()

        if (!res.ok) {
          return { ok: false, error: data.error ?? "Could not create your profile." }
        }

        setUser(data.user as Account)
        setSession({ userId: data.user.id, issuedAt: Date.now() })
        setOnline(true)
        return { ok: true }
      } catch {
        // No database — keep the profile on this device so the demo still works
        const existing = readJSON<Account[]>("doom.accounts.v1", [])
        if (existing.some((a) => a.email === account.email)) {
          return { ok: false, error: "An account with that email already exists." }
        }
        writeJSON("doom.accounts.v1", [account, ...existing])
        setUser(account)
        setSession({ userId: account.id, issuedAt: Date.now() })
        setOrders((current) => [seedOrder(account.id), ...current])
        return { ok: true }
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await fetch("/api/session", { method: "DELETE" })
    } catch {
      /* ignore — clear local state regardless */
    }
    setUser(null)
    setSession(null)
    setOnline(false)
  }, [])

  const updateProfile = useCallback<AccountContextValue["updateProfile"]>(
    async (patch) => {
      if (!user) return

      const safe: Partial<Account> = { ...patch }
      if (user.email === ADMIN_EMAIL) {
        delete safe.email
        delete safe.role
      }

      setUser({ ...user, ...safe })

      if (!online) {
        const existing = readJSON<Account[]>("doom.accounts.v1", [])
        writeJSON(
          "doom.accounts.v1",
          existing.map((a) => (a.id === user.id ? { ...a, ...safe } : a))
        )
      }
    },
    [user, online]
  )

  const addAddress = useCallback<AccountContextValue["addAddress"]>(
    (address) => {
      if (!user) return
      setUser({ ...user, addresses: [...user.addresses, address] })
      const existing = readJSON<Account[]>("doom.accounts.v1", [])
      writeJSON(
        "doom.accounts.v1",
        existing.map((a) =>
          a.id === user.id ? { ...a, addresses: [...a.addresses, address] } : a
        )
      )
    },
    [user]
  )

  const removeAddress = useCallback<AccountContextValue["removeAddress"]>(
    (index) => {
      if (!user) return
      setUser({
        ...user,
        addresses: user.addresses.filter((_, i) => i !== index),
      })
    },
    [user]
  )

  const saveDesign = useCallback<AccountContextValue["saveDesign"]>(
    async (design) => {
      const saved: SavedDesign = {
        ...design,
        id: `dsn_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
        createdAt: Date.now(),
      }
      setDesigns((current) => [saved, ...current])
      return saved
    },
    []
  )

  const removeDesign = useCallback((id: string) => {
    setDesigns((current) => current.filter((d) => d.id !== id))
  }, [])

  const placeOrder = useCallback<AccountContextValue["placeOrder"]>(
    (input) => {
      if (!user) return null
      const now = Date.now()
      const order: Order = {
        id: makeOrderId(),
        userId: user.id,
        items: input.items,
        subtotal: input.subtotal,
        shipping: input.shipping,
        tax: input.tax,
        discount: input.discount,
        total: input.subtotal + input.shipping + input.tax - input.discount,
        status: "placed",
        placedAt: now,
        estimatedDelivery: now + 86_400_000 * 4,
        address: input.address,
        paymentMethod: input.paymentMethod,
        trackingNumber: null,
        timeline: [{ status: "placed", at: now, note: orderFlow[0].note }],
      }
      setOrders((current) => [order, ...current])
      return order
    },
    [user]
  )

  const advanceOrder = useCallback<AccountContextValue["advanceOrder"]>(
    (orderId) => {
      setOrders((current) =>
        current.map((order) => {
          if (order.id !== orderId) return order
          if (order.status === "cancelled" || order.status === "delivered") {
            return order
          }
          const index = orderFlow.findIndex((s) => s.status === order.status)
          if (index === -1 || index >= orderFlow.length - 1) return order
          const next = orderFlow[index + 1]

          return {
            ...order,
            status: next.status,
            trackingNumber:
              order.trackingNumber ??
              (next.status === "shipped" ? makeTrackingNumber() : null),
            timeline: [
              ...order.timeline,
              { status: next.status, at: Date.now(), note: next.note },
            ],
          }
        })
      )
    },
    []
  )

  const cancelOrder = useCallback<AccountContextValue["cancelOrder"]>(
    (orderId) => {
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: "cancelled" as OrderStatus,
                timeline: [
                  ...order.timeline,
                  {
                    status: "cancelled" as OrderStatus,
                    at: Date.now(),
                    note: "Cancelled.",
                  },
                ],
              }
            : order
        )
      )
    },
    []
  )

  const value = useMemo<AccountContextValue>(
    () => ({
      hydrated,
      online,
      accounts,
      user,
      isAdmin,
      orders,
      myOrders,
      designs,
      saveDesign,
      removeDesign,
      login,
      registerBuyer,
      logout,
      updateProfile,
      addAddress,
      removeAddress,
      placeOrder,
      advanceOrder,
      cancelOrder,
    }),
    [
      hydrated,
      online,
      accounts,
      user,
      isAdmin,
      orders,
      myOrders,
      designs,
      saveDesign,
      removeDesign,
      login,
      registerBuyer,
      logout,
      updateProfile,
      addAddress,
      removeAddress,
      placeOrder,
      advanceOrder,
      cancelOrder,
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

export { formatDate, ADMIN_PASSWORD }