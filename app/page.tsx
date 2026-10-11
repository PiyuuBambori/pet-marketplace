import { Suspense } from "react"
import Link from "next/link"
import HeroCarousel from "@/components/hero-carousel"
import HomeContent from "@/components/home-content"
import ProductRail, { DealRail } from "@/components/product-rail"
import { getProducts } from "@/lib/catalog"

// The catalogue is read from Postgres at request time. Forcing dynamic
// rendering avoids prerendering pages whose data cannot be known at build.
export const dynamic = "force-dynamic"

export default async function Home() {
  const { products } = await getProducts()

  const trending = products.filter((p) => p.rating >= 4.6).slice(0, 10)
  const dogPicks = products.filter((p) => p.category === "dog").slice(0, 10)
  const catPicks = products.filter((p) => p.category === "cat").slice(0, 10)

  // keep the rails populated even with a small catalogue
  const trendingRail = trending.length >= 4 ? trending : products.slice(0, 10)
  const dogRail = dogPicks.length >= 4 ? dogPicks : products.slice(0, 10)
  const catRail = catPicks.length >= 4 ? catPicks : products.slice(0, 10)

  return (
    <main>
      <Suspense fallback={<div className="aspect-[16/8] w-full bg-pink-100" />}>
        <HeroCarousel />
      </Suspense>

      <HomeContent />

      <DealRail products={products} />

      <div className="border-y-2 border-ink bg-pink-100">
        <ProductRail
          title="Trending Now"
          subtitle="Loved by pet parents this week"
          href="/products?sort=rating"
          items={trendingRail}
          tone="tinted"
        />
      </div>

      <ProductRail
        title="Dog Essentials"
        subtitle="Built for walks, weather and zoomies"
        href="/products?category=dog"
        items={dogRail}
      />

      <div className="border-y-2 border-ink bg-pink-100">
        <ProductRail
          title="Cat Style"
          subtitle="Soft, light and completely unbothered"
          href="/products?category=cat"
          items={catRail}
          tone="tinted"
        />
      </div>

      {/* editorial */}
      <section className="wrap py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Measure once, order right",
              body: "Our size chart uses neck, chest and length so your pet's fit is right the first time.",
              href: "/size-guide",
              cta: "Open Size Guide",
            },
            {
              title: "Independent designers",
              body: "Every design is uploaded by a seller and reviewed before it reaches your cart.",
              href: "/register",
              cta: "Sell Your Design",
            },
            {
              title: "30-day easy returns",
              body: "If the fit is not right, send it back within 30 days. We cover the return shipping.",
              href: "/checkout",
              cta: "Read Return Policy",
            },
          ].map((item) => (
            <div key={item.title} className="sticker transition-all hover:-translate-y-1">
              <h3 className="text-lg uppercase">{item.title}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-ink/65">
                {item.body}
              </p>
              <Link
                href={item.href}
                className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-pink-600 hover:underline"
              >
                {item.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}