import {
  Circle,
  CircleDot,
  HeartHandshake,
  MoveHorizontal,
  Ruler,
  Scissors,
} from "lucide-react"
import {
  catSizeChart,
  dogSizeChart,
  measureGuide,
  sizeTips,
  type SizeChartRow,
} from "@/lib/products"

const tipIcons = [Ruler, Scissors, HeartHandshake]

const measurements = [
  { label: "Back length", Icon: MoveHorizontal },
  { label: "Chest", Icon: Circle },
  { label: "Neck", Icon: CircleDot },
]

function Measurements() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {measurements.map(({ label, Icon }) => (
        <div
          key={label}
          className="rounded-xl border border-[#f4cf9a]/40 bg-[#f8e8cf] px-2 py-3 text-center text-[#5e1830]"
        >
          <Icon size={18} className="mx-auto" />
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs">
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}

export function DogSizeChart() {
  return (
    <section className="overflow-hidden rounded-sticker border-2 border-ink bg-[#8f1d3f] shadow-sticker-lg">
      <div className="relative p-5 sm:p-8">
        <div className="halftone halftone-light pointer-events-none absolute inset-0 opacity-[0.08]" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f4cf9a]">
              DOOM / Sizing
            </p>
            <h2 className="mt-1 font-display text-4xl uppercase leading-none text-[#f8e8cf] sm:text-5xl">
              Size{" "}
              <span className="font-serif text-3xl font-normal italic tracking-normal text-[#f4cf9a] sm:text-4xl">
                Chart
              </span>
            </h2>
            <p className="mt-2 max-w-md text-sm font-medium text-[#f8e8cf]/80">
              Measure your dog, then match the closest row. All measurements are
              in inches.
            </p>
          </div>
          <span className="w-fit rounded-full border-2 border-[#f4cf9a]/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#f8e8cf]">
            All sizes in inches
          </span>
        </div>

        <div className="relative mt-6 hidden sm:block">
          <Measurements />
        </div>

        <div className="relative mt-6 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr className="border-b-2 border-[#f4cf9a]/70 text-left text-[10px] font-bold uppercase tracking-widest text-[#f4cf9a]">
                <th className="px-2 py-3">Size</th>
                <th className="px-3 py-3">Back length</th>
                <th className="px-3 py-3">Chest</th>
                <th className="px-3 py-3">Neck</th>
                <th className="px-3 py-3">Best for</th>
              </tr>
            </thead>
            <tbody>
              {dogSizeChart.map((row) => (
                <tr
                  key={row.size}
                  className="border-b border-[#f4cf9a]/25 last:border-0 hover:bg-white/5"
                >
                  <td className="whitespace-nowrap px-2 py-3.5 font-display text-lg uppercase text-[#f8e8cf]">
                    <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#ff9fc4]" />
                    {row.size}
                  </td>
                  <td className="px-3 py-3.5 text-sm font-bold text-[#f4cf9a]">
                    {row.length}in
                  </td>
                  <td className="px-3 py-3.5 text-sm font-bold text-[#f4cf9a]">
                    {row.chest}in
                  </td>
                  <td className="px-3 py-3.5 text-sm font-bold text-[#f4cf9a]">
                    {row.neck}in
                  </td>
                  <td className="px-3 py-3.5 text-xs font-medium italic leading-relaxed text-[#f8e8cf]/85">
                    {row.breeds}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="relative mt-4 text-xs font-medium text-[#f8e8cf]/70">
          Breeds listed are a starting guide. Always go by the measurements, and
          size up when your dog falls between two sizes.
        </p>
      </div>
    </section>
  )
}

function SimpleChart({
  title,
  rows,
  caption,
}: {
  title: string
  rows: SizeChartRow[]
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
              {["Size", "Back length", "Chest", "Neck"].map((head) => (
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
                <td className="px-5 py-3.5 text-sm font-bold">{row.length}&quot;</td>
                <td className="px-5 py-3.5 text-sm font-bold">{row.chest}&quot;</td>
                <td className="px-5 py-3.5 text-sm font-bold">{row.neck}&quot;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs font-medium text-ink/55">{caption}</p>
    </section>
  )
}

export function CatSizeChart() {
  return (
    <SimpleChart
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
