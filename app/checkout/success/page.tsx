import { Suspense } from "react"
import SuccessView from "@/components/success-view"

export const metadata = {
  title: "Order Confirmed | Doom",
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="wrap py-20 text-center">
          <p className="font-bold uppercase tracking-widest text-ink/40">Loading…</p>
        </main>
      }
    >
      <SuccessView />
    </Suspense>
  )
}