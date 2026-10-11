import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Footer } from "@/components/footer"
import Header from "@/components/header"
import { CartProvider } from "@/components/cart-provider"
import { AccountProvider } from "@/components/account-provider"
import { OrdersProvider } from "@/components/orders-provider"
import "./globals.css"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Doom | Pet Clothes Marketplace",
    template: "%s | Doom",
  },
  description:
    "Shop hoodies, sweaters, raincoats and accessories for dogs and cats. Honest sizing, free shipping over ₹1,499, 30-day returns.",
  applicationName: "Doom",
  keywords: [
    "dog clothes",
    "cat clothes",
    "pet apparel",
    "dog hoodie",
    "cat sweater",
    "pet raincoat",
    "pet bandana",
    "dog size chart",
  ],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Doom",
    title: "Doom | Pet Clothes Marketplace",
    description:
      "Dress your pet in style. Honest sizing, free shipping over ₹1,499, 30-day returns.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doom | Pet Clothes Marketplace",
    description:
      "Dress your pet in style. Honest sizing, free shipping over ₹1,499, 30-day returns.",
  },
  robots: { index: true, follow: true },
}

// NOTE: OrdersProvider reads auth state itself via useAccounts() rather than
// taking it as props. Passing anything from this Server Component (including
// function results) across the boundary is what broke prerendering earlier.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:border-2 focus:border-ink focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
        >
          Skip to content
        </a>
        <AccountProvider>
          <OrdersProvider>
            <CartProvider>
              <Suspense fallback={null}>
                <Header />
              </Suspense>
              <main id="main" className="flex-1">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </OrdersProvider>
        </AccountProvider>
      </body>
    </html>
  )
}