import Link from "next/link"
import { Truck, RotateCcw, ShieldCheck, Headphones, PawPrint } from "lucide-react"

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Dog Apparel", href: "/products?category=dog" },
      { label: "Cat Apparel", href: "/products?category=cat" },
      { label: "New Arrivals", href: "/products?sort=new" },
      { label: "Sale", href: "/products?sort=discount" },
      { label: "Size Guide", href: "/size-guide" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/login" },
      { label: "Create Profile", href: "/register" },
      { label: "My Orders", href: "/account/orders" },
      { label: "My Bag", href: "/cart" },
      { label: "Wishlist", href: "/products" },
    ],
  },
  {
    title: "Sell",
    links: [
      { label: "Seller Studio", href: "/admin/designs" },
      { label: "Upload a Design", href: "/admin/designs" },
      { label: "Payouts", href: "/admin/designs" },
      { label: "Seller Guide", href: "/admin/designs" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "How to Measure", href: "/size-guide#measure" },
      { label: "Shipping", href: "/checkout" },
      { label: "Returns", href: "/checkout" },
      { label: "Track Order", href: "/account/orders" },
      { label: "Contact", href: "/" },
    ],
  },
]

const promises = [
  { icon: Truck, title: "Free Shipping", body: "On orders above ₹1,499" },
  { icon: RotateCcw, title: "30-Day Returns", body: "No questions asked" },
  { icon: ShieldCheck, title: "Secure Payments", body: "Powered by Stripe" },
  { icon: Headphones, title: "Pet Parent Support", body: "Mon–Sat, 10am–7pm" },
]

const socials = [
  {
    label: "Instagram",
    path: (
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.8.07-1.1.05-1.7.24-2.1.4-.5.2-.9.44-1.2.76-.3.3-.6.7-.8 1.2-.2.4-.3 1-.4 2.1C2.6 9.3 2.6 9.7 2.6 12s0 2.7.1 4c0 1.1.2 1.7.4 2.1.2.5.5.9.8 1.2.3.3.7.6 1.2.8.4.2 1 .3 2.1.4 1.3.05 1.7.06 4.8.06s3.5 0 4.8-.06c1.1-.05 1.7-.24 2.1-.4.5-.2.9-.44 1.2-.76.3-.3.6-.7.8-1.2.2-.4.3-1 .4-2.1.05-1.3.06-1.7.06-4s0-2.7-.06-4c-.05-1.1-.24-1.7-.4-2.1a3.1 3.1 0 0 0-.76-1.2 3.1 3.1 0 0 0-1.2-.8c-.4-.2-1-.3-2.1-.4C15.5 4 15.1 4 12 4zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.2-3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
    ),
  },
  {
    label: "Facebook",
    path: (
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v2.1h2.78l-.45 2.9h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94z" />
    ),
  },
  {
    label: "X",
    path: (
      <path d="M18.9 2H22l-7.1 8.1L23.2 22h-6.6l-5.2-6.8L5.5 22H2.4l7.6-8.7L1.2 2h6.8l4.7 6.2L18.9 2zm-1.1 18h1.7L6.5 3.9H4.7L17.8 20z" />
    ),
  },
  {
    label: "YouTube",
    path: (
      <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 3.9 12 3.9 12 3.9s-7.5 0-9.4.5A3 3 0 0 0 .5 6.5C0 8.4 0 12 0 12s0 3.6.5 5.5a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.5.5-5.5s0-3.6-.5-5.5zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z" />
    ),
  },
]

export function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-ink bg-white">
      {/* promises */}
      <div className="halftone border-b-2 border-ink bg-pink-100 py-8">
        <div className="wrap grid grid-cols-2 gap-6 lg:grid-cols-4">
          {promises.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-pink-500 text-white">
                <Icon size={19} />
              </span>
              <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="text-xs font-medium text-ink/60">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* columns */}
      <div className="wrap grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-4 inline-block border-b-2 border-pink-500 pb-1 font-display text-sm uppercase">
              {column.title}
            </h3>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-ink/70 transition-colors hover:text-pink-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* big wordmark */}
      <div className="relative overflow-hidden border-y-2 border-ink bg-pink-500 py-10">
        <div className="halftone halftone-light absolute inset-0 opacity-25" />
        <div className="relative flex items-center justify-center px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-inverse.svg"
            alt="Doom"
            width={760}
            height={277}
            className="w-full max-w-[560px]"
          />
        </div>
      </div>

      {/* social + legal */}
      <div className="wrap flex flex-col items-center justify-between gap-6 py-8 sm:flex-row">
        <div className="flex items-center gap-3">
          {socials.map(({ label, path }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-white transition-all hover:-translate-y-0.5 hover:bg-pink-500 hover:text-white hover:shadow-sticker-sm"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {path}
              </svg>
            </a>
          ))}
        </div>
        <p className="flex items-center gap-2 text-center text-xs font-semibold text-ink/60">
          <PawPrint size={14} className="text-pink-500" />
          © {new Date().getFullYear()} Doom — handmade for every furbaby
        </p>
      </div>
    </footer>
  )
}