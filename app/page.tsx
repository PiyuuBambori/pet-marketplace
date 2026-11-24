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

  const collectionRail = products.slice(0, 10)
  const dogRail = products.filter((p) => p.category === "dog").slice(0, 10)

  return (
    <main>
      <Suspense fallback={<div className="aspect-[16/8] w-full bg-pink-100" />}>
        <HeroCarousel />
      </Suspense>

      <HomeContent products={products} />

      <DealRail products={products} />

      <div className="border-y-2 border-ink bg-pink-100">
        <ProductRail
          title="The Debut Collection"
          subtitle="Five prints, made to order in sizes XXS–XL"
          href="/products"
          items={collectionRail}
          tone="tinted"
        />
      </div>

      <ProductRail
        title="Dog Dresses"
        subtitle="Fitted bodice, sleeveless shape, a very good flared skirt"
        href="/products?category=dog"
        items={dogRail}
      />

      {/* editorial */}
      <section className="wrap py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Measure once, order right",
              body: "Our size chart uses back length, chest and neck so your dog's fit is right the first time.",
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