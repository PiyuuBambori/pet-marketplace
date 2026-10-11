"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    src: "/photos/banner-winter.jpg",
    alt: "Golden retriever in winter, up to 60% off warm coats",
    href: "/products?q=coat",
    eyebrow: "End of Season Sale",
    title: "Winter Warmth",
    accent: "Up to 60% off",
    blurb: "Fleece-lined, weather-ready, sized to fit.",
    cta: "Shop coats",
  },
  {
    src: "/photos/banner-cats.jpg",
    alt: "Cat in soft knitwear, new season arrivals",
    href: "/products?category=cat",
    eyebrow: "New In For Cats",
    title: "Fresh Fits for",
    accent: "Cats & Kittens",
    blurb: "Soft knits, light dresses, zero fuss.",
    cta: "Shop cats",
  },
]

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = useCallback((next: number) => {
    setIndex((prev) => (next + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    timer.current = setInterval(() => go(index + 1), 6500)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [index, go])

  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-pink-100">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`transition-opacity duration-500 ${
            i === index ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <div className="relative min-h-[420px] w-full sm:min-h-[460px] lg:min-h-[520px]">
            {/* photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />

            {/* readability scrim */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent" />

            {/* halftone texture, moodboard style */}
            <div className="halftone halftone-light absolute inset-0 opacity-[0.18]" />

            {/* copy */}
            <div className="relative flex min-h-[420px] items-center sm:min-h-[460px] lg:min-h-[520px]">
              <div className="wrap">
                <div className="max-w-xl">
                  <span className="inline-block -rotate-2 rounded-full border-2 border-ink bg-pink-500 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sticker-sm">
                    {slide.eyebrow}
                  </span>

                  <h2 className="mt-5 font-display text-4xl uppercase leading-[0.95] text-white drop-shadow-[3px_3px_0_#0B0B0B] sm:text-5xl lg:text-6xl">
                    {slide.title}
                    <br />
                    <span className="text-pink-500">{slide.accent}</span>
                  </h2>

                  <p className="mt-4 max-w-sm text-sm font-semibold text-white/90 sm:text-base">
                    {slide.blurb}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link href={slide.href} className="btn-pink">
                      {slide.cta}
                    </Link>
                    <Link href="/products" className="btn-white">
                      All products
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-white transition-all hover:bg-pink-500 hover:text-white sm:flex"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-white transition-all hover:bg-pink-500 hover:text-white sm:flex"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 rounded-full border-2 border-ink transition-all duration-300 ${
              i === index ? "w-9 bg-pink-500" : "w-3.5 bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  )
}