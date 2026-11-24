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
    default: "Doom | Dog Dresses, Made to Order",
    template: "%s | Doom",
  },
  description:
    "Shop the DOOM debut collection: five dog dresses in sizes XXS–XL. Fitted bodices, flared skirts, honest sizing and 30-day returns.",
  applicationName: "Doom",
  keywords: [
    "dog dresses",
    "dog clothes",
    "pet apparel",
    "dog dress India",
    "made to order dog clothes",
    "dog size chart",
    "dog birthday outfit",
  ],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Doom",
    title: "Doom | Dog Dresses, Made to Order",
    description:
      "Five dog dresses. Fitted bodices, flared skirts, sizes XXS–XL. Made to order in India.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doom | Dog Dresses, Made to Order",
    description:
      "Five dog dresses. Fitted bodices, flared skirts, sizes XXS–XL. Made to order in India.",
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