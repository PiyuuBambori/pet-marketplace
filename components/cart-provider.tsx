"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { Product } from "@/lib/products"

export type CartLine = {
  key: string
  productId: string
  name: string
  brand: string
  image: string
  price: number
  mrp: number
  size: string
  color: string
  quantity: number
}

export type AddInput = {
  product: Product
  size: string
  color: string
  quantity: number
}

type CartContextValue = {
  lines: CartLine[]
  count: number
  subtotal: number
  savings: number
  addItem: (input: AddInput) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "doom.cart.v1"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setLines(JSON.parse(raw))
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // storage full or unavailable
    }
  }, [lines, hydrated])

  const addItem = useCallback((input: AddInput) => {
    const { product, size, color, quantity } = input
    const key = `${product.id}__${size}__${color}`

    setLines((current) => {
      const existing = current.find((line) => line.key === key)
      if (existing) {
        return current.map((line) =>
          line.key === key
            ? { ...line, quantity: Math.min(10, line.quantity + quantity) }
            : line
        )
      }
      return [
        ...current,
        {
          key,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          image: product.image,
          price: product.price,
          mrp: product.mrp,
          size,
          color,
          quantity,
        },
      ]
    })
  }, [])

  const removeItem = useCallback((key: string) => {
    setLines((current) => current.filter((line) => line.key !== key))
  }, [])

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      current
        .map((line) =>
          line.key === key
            ? { ...line, quantity: Math.max(0, Math.min(10, quantity)) }
            : line
        )
        .filter((line) => line.quantity > 0)
    )
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0)
    const subtotal = lines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0
    )
    const savings = lines.reduce(
      (sum, line) => sum + (line.mrp - line.price) * line.quantity,
      0
    )
    return {
      lines,
      count,
      subtotal,
      savings,
      addItem,
      removeItem,
      updateQuantity,
      clear,
    }
  }, [lines, addItem, removeItem, updateQuantity, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used inside CartProvider")
  }
  return context
}