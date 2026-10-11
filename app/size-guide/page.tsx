import Link from "next/link"
import {
  CatSizeChart,
  DogSizeChart,
  MeasureGuide,
  SizeTips,
} from "@/components/size-guide"

export const metadata = {
  title: "Size Guide | Doom",
  description:
    "Dog and cat clothing size charts in inches, plus how to measure your pet correctly before ordering.",
}

export default function SizeGuidePage() {
  return (
    <main className="wrap py-10">
      <nav className="mb-6 text-xs font-semibold text-ink/50">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-pink-500">
              Home
            </Link>
          </li>
          <span>/</span>
          <li className="text-ink">Size guide</li>
        </ol>
      </nav>

      <header className="relative mb-10 overflow-hidden rounded-sticker border-2 border-ink bg-pink-500 px-7 py-10 text-center shadow-sticker-lg">
        <div className="halftone halftone-light absolute inset-0 opacity-25" />
        <div className="relative">
          <span className="tag border-ink bg-white text-pink-600">
            Measure before you order
          </span>
          <h1 className="mt-4 text-4xl uppercase text-white sm:text-5xl">
            Pet clothing size guide
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-white/90">
            Every measurement below is in inches and refers to the garment body,
            not your pet&apos;s full body length.
          </p>
        </div>
      </header>

      <div className="space-y-12">
        <DogSizeChart />
        <CatSizeChart />
        <MeasureGuide />
        <SizeTips />

        <section className="halftone rounded-sticker border-2 border-ink bg-pink-100 p-8 text-center">
          <p className="font-display text-xl uppercase text-pink-600">
            Handmade for every furbaby
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-ink/70">
            Please note that these measurements are approximate and may vary
            slightly depending on the style and fabric of the garment.
          </p>
          <p className="mt-5 font-display text-lg uppercase">
            Need help? We&apos;re here for you.
          </p>
          <Link href="/products" className="btn-pink mt-5">
            Browse all products
          </Link>
        </section>
      </div>
    </main>
  )
}