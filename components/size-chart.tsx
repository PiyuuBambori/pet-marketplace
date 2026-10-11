"use client"

import { ChevronDown, Ruler } from "lucide-react"
import { catSizeChart, dogSizeChart, type Product } from "@/lib/products"

export default function SizeChart({
  product,
  selectedSize,
  onSelectSize,
  compact = false,
}: {
  product: Product
  selectedSize?: string
  onSelectSize?: (size: string) => void
  compact?: boolean
}) {
  const isDog = product.category === "dog"
  const rows = isDog ? dogSizeChart : catSizeChart
  const inStock = new Set(product.sizes)

  return (
    <div className={compact ? "" : "space-y-3"}>
      {!compact && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Ruler size={14} className="text-pink-500" /> Size Chart
          </h3>
          <span className="tag border-pink-500 bg-pink-500 text-white">
            {isDog ? "Dog Sizing" : "Cat Sizing"}
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-sticker border-2 border-ink">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="bg-pink-500 text-white">
              {["Size", "Neck", "Chest", "Length"].map((head) => (
                <th
                  key={head}
                  className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const available = inStock.has(row.size)
              const isSelected = selectedSize === row.size
              return (
                <tr
                  key={row.size}
                  onClick={() => available && onSelectSize?.(row.size)}
                  className={`border-b-2 border-dashed border-ink/15 last:border-0 ${
                    isSelected
                      ? "bg-pink-200"
                      : available
                        ? "bg-white hover:bg-pink-50"
                        : "bg-ink/5 text-ink/40"
                  } ${available && onSelectSize ? "cursor-pointer" : ""}`}
                >
                  <td className="px-4 py-2.5 font-display uppercase">
                    {row.size}
                    {isSelected && (
                      <span className="ml-2 rounded-full bg-pink-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                        Picked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{row.neck}&quot;</td>
                  <td className="px-4 py-2.5 font-medium">{row.chest}"</td>
                  <td className="px-4 py-2.5 font-medium">{row.length}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs font-medium leading-relaxed text-ink/55">
        All sizes are in inches. Small breeds need at least{" "}
        <strong className="text-ink">2 inches</strong> of margin, large breeds{" "}
        <strong className="text-ink">4 inches</strong>.
      </p>

      {onSelectSize && (
        <details className="group rounded-sticker border-2 border-ink bg-pink-50">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest">
            Full measurement guide
            <ChevronDown
              size={16}
              className="transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="space-y-3 border-t-2 border-dashed border-ink/20 px-4 py-4">
            {[
              ["Neck", "Measure around the base of your dog's neck."],
              ["Chest", "Measure around the widest part of your dog's chest."],
              [
                "Length",
                "Measure from the base of the neck to the base of the tail.",
              ],
            ].map(([label, detail]) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-600">
                  {label}
                </p>
                <p className="mt-0.5 text-sm font-medium text-ink/65">{detail}</p>
              </div>
            ))}
            <p className="text-xs italic font-medium text-ink/50">
              Please note that these measurements are approximate and may vary
              slightly depending on the style and fabric of the garment.
            </p>
          </div>
        </details>
      )}
    </div>
  )
}