import { Ruler, Scissors, HeartHandshake } from "lucide-react"
import { catSizeChart, dogSizeChart, measureGuide, sizeTips } from "@/lib/products"

const tipIcons = [Ruler, Scissors, HeartHandshake]

function Chart({
  title,
  rows,
  caption,
}: {
  title: string
  rows: { size: string; neck: number; chest: number; length: number }[]
  caption: string
}) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl uppercase">{title}</h2>
        <span className="tag border-pink-500 bg-pink-500 text-white">
          All sizes in inches
        </span>
      </div>

      <div className="overflow-x-auto rounded-sticker border-2 border-ink shadow-sticker">
        <table className="w-full min-w-[440px] border-collapse">
          <thead>
            <tr className="bg-pink-500 text-white">
              {["Size", "Neck", "Chest", "Length"].map((head) => (
                <th
                  key={head}
                  className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-widest"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.size}
                className="border-b-2 border-dashed border-ink/15 bg-white last:border-0 even:bg-pink-50 hover:bg-pink-100"
              >
                <td className="px-5 py-3.5 font-display uppercase">{row.size}</td>
                <td className="px-5 py-3.5 text-sm font-bold">{row.neck}&quot;</td>
                <td className="px-5 py-3.5 text-sm font-bold">{row.chest}</td>
                <td className="px-5 py-3.5 text-sm font-bold">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs font-medium text-ink/55">{caption}</p>
    </section>
  )
}

export function DogSizeChart() {
  return (
    <Chart
      title="Dog size chart"
      rows={dogSizeChart}
      caption="Dog measurements follow the neck, chest and length standard used across pet apparel. If your dog falls between two sizes, size up for room to move."
    />
  )
}

export function CatSizeChart() {
  return (
    <Chart
      title="Cat size chart"
      rows={catSizeChart}
      caption="Cats have a narrower chest than most dogs. Measure with a soft tape and keep two fingers of slack for comfort."
    />
  )
}

export function MeasureGuide() {
  return (
    <section id="measure">
      <h2 className="mb-5 text-2xl uppercase">How to measure</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {measureGuide.map((item, i) => (
          <div key={item.label} className="sticker p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-pink-500 font-display text-sm text-white">
              {i + 1}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-pink-600">
              {item.label}
            </p>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink/65">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function SizeTips() {
  return (
    <section>
      <h2 className="mb-5 text-2xl uppercase">Before you order</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {sizeTips.map((tip, i) => {
          const Icon = tipIcons[i] ?? Ruler
          return (
            <div
              key={tip.title}
              className="rounded-sticker border-2 border-ink bg-pink-100 p-5 shadow-sticker-sm"
            >
              <Icon size={22} className="mb-3 text-pink-500" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-ink">
                {tip.title}
              </p>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink/65">
                {tip.body}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}