export type Category = "dog" | "cat"
export type Garment =
  | "hoodie"
  | "sweater"
  | "raincoat"
  | "bandana"
  | "coat"
  | "dress"
  | "jacket"
  | "hat"
  | "tuxedo"

export type Product = {
  id: string
  brand: string
  name: string
  category: Category
  garment: Garment
  price: number
  mrp: number
  image: string
  gallery: string[]
  colors: { name: string; hex: string }[]
  sizes: string[]
  rating: number
  ratingCount: number
  description: string
  highlights: string[]
  fabric: string
  care: string
}

export type SizeChartRow = {
  size: string
  length: number
  chest: number
  neck: number
  breeds?: string
}

/**
 * DOOM size chart (inches) — the chart supplied with the product catalogue.
 * The same values are used by the size-guide page and the product page table.
 */
export const dogSizeChart: SizeChartRow[] = [
  {
    size: "XXS",
    length: 14,
    chest: 14,
    neck: 14,
    breeds: "Maltese, Yorkshire Terrier, Pekingese, Shih Tzu",
  },
  {
    size: "XS",
    length: 16,
    chest: 16,
    neck: 16,
    breeds: "Shih Tzu, Lhasa Apso, Pug, Dachshund",
  },
  {
    size: "S",
    length: 18,
    chest: 18,
    neck: 18,
    breeds: "Cocker Spaniel, Beagle, French Bulldog, Pomeranian",
  },
  {
    size: "M",
    length: 20,
    chest: 20,
    neck: 20,
    breeds: "Cocker Spaniel, Beagle, Frenchie, Indie, Pomeranian",
  },
  {
    size: "L",
    length: 24,
    chest: 24,
    neck: 24,
    breeds: "Retrievers, Labradors, Indies, German Shepherds",
  },
  {
    size: "XL",
    length: 26,
    chest: 26,
    neck: 26,
    breeds: "Labs, Retrievers, Boxer, Great Dane, Pitbull",
  },
]

/** Kept for cat listings added later; the launch catalogue is dog-only. */
export const catSizeChart: SizeChartRow[] = [
  { size: "S", length: 9, chest: 12, neck: 8 },
  { size: "M", length: 11, chest: 15, neck: 10 },
  { size: "L", length: 13, chest: 18, neck: 12 },
  { size: "XL", length: 15, chest: 21, neck: 14 },
]

export const measureGuide = [
  {
    label: "Back length",
    detail:
      "Measure from the base of the neck to the base of the tail, along the back.",
  },
  {
    label: "Chest",
    detail: "Measure around the widest part of your dog's chest.",
  },
  {
    label: "Neck",
    detail: "Measure around the base of your dog's neck.",
  },
]

export const sizeTips = [
  {
    title: "Measure before ordering",
    body: "For the best fit, always measure your pet before selecting a size.",
  },
  {
    title: "Allow extra room",
    body: "For small breeds take a minimum margin of 2 inches, and for large breeds take a minimum margin of 4 inches.",
  },
  {
    title: "Need a custom size?",
    body: "If your pet's size doesn't fit the chart above, reach out to us and we'll get the size customised for your furbaby.",
  },
]

export const sizeDisclaimer =
  "Please note that these measurements are approximate and may vary slightly depending on the style and fabric of the garment."

/**
 * The live DOOM catalogue, taken from DOOM_Product_Catalogue.xlsx.
 * `id` is the catalogue SKU, so product URLs read /products/DOOM-001 etc.
 *
 * Prices are launch placeholders: the supplied workbook has the price field
 * marked "ADD". They can be changed from Admin → Catalogue without a deploy.
 */
export const products: Product[] = [
  {
    id: "DOOM-001",
    brand: "Doom",
    name: "Paw print Club",
    category: "dog",
    garment: "dress",
    price: 1299,
    mrp: 1999,
    image: "/photos/doom-001-paw-print-club.jpg",
    gallery: [
      "/photos/catalogue/doom-001-paw-print-club-1.jpg",
      "/photos/catalogue/doom-001-paw-print-club-2.jpg",
      "/photos/catalogue/doom-001-paw-print-club-3.jpg",
      "/photos/catalogue/doom-001-paw-print-club-4.jpg",
    ],
    colors: [{ name: "Green Print", hex: "#2E9B4F" }],
    sizes: ["XXS", "XS", "S", "M", "L", "XL"],
    rating: 0,
    ratingCount: 0,
    description:
      "A playful green animal-print dog dress with a fitted sleeveless bodice and a flared skirt.",
    highlights: [
      "Bold green-and-dark print",
      "Sleeveless fitted bodice",
      "Flared skirt",
    ],
    fabric: "Composition to be confirmed with supplier",
    care: "Refer to the care label",
  },
  {
    id: "DOOM-002",
    brand: "Doom",
    name: "Cherry Bandit",
    category: "dog",
    garment: "dress",
    price: 1299,
    mrp: 1999,
    image: "/photos/doom-002-cherry-bandit.jpg",
    gallery: [
      "/photos/catalogue/doom-002-cherry-bandit-1.jpg",
      "/photos/catalogue/doom-002-cherry-bandit-2.jpg",
      "/photos/catalogue/doom-002-cherry-bandit-3.jpg",
      "/photos/catalogue/doom-002-cherry-bandit-4.jpg",
    ],
    colors: [{ name: "Red Bandana", hex: "#B3262E" }],
    sizes: ["XXS", "XS", "S", "M", "L", "XL"],
    rating: 0,
    ratingCount: 0,
    description:
      "A statement red paisley-print dog dress with a fitted sleeveless bodice and a flared skirt.",
    highlights: [
      "Red bandana-inspired paisley print",
      "Sleeveless fitted bodice",
      "Flared skirt",
    ],
    fabric: "Composition to be confirmed with supplier",
    care: "Refer to the care label",
  },
  {
    id: "DOOM-003",
    brand: "Doom",
    name: "Foxy Lady",
    category: "dog",
    garment: "dress",
    price: 1299,
    mrp: 1999,
    image: "/photos/doom-003-foxy-lady.jpg",
    gallery: [
      "/photos/catalogue/doom-003-foxy-lady-1.jpg",
      "/photos/catalogue/doom-003-foxy-lady-2.jpg",
      "/photos/catalogue/doom-003-foxy-lady-3.jpg",
      "/photos/catalogue/doom-003-foxy-lady-4.jpg",
    ],
    colors: [{ name: "Pink Fox", hex: "#F06A9A" }],
    sizes: ["XXS", "XS", "S", "M", "L", "XL"],
    rating: 0,
    ratingCount: 0,
    description:
      "A fun pink fox-print dog dress with a fitted sleeveless bodice and a flared skirt.",
    highlights: [
      "Pink fox motif",
      "Sleeveless fitted bodice",
      "Flared skirt",
    ],
    fabric: "Composition to be confirmed with supplier",
    care: "Refer to the care label",
  },
  {
    id: "DOOM-004",
    brand: "Doom",
    name: "Sunny Side Up",
    category: "dog",
    garment: "dress",
    price: 1299,
    mrp: 1999,
    image: "/photos/doom-004-sunny-side-up.jpg",
    gallery: [
      "/photos/catalogue/doom-004-sunny-side-up-1.jpg",
      "/photos/catalogue/doom-004-sunny-side-up-2.jpg",
      "/photos/catalogue/doom-004-sunny-side-up-3.jpg",
      "/photos/catalogue/doom-004-sunny-side-up-4.jpg",
    ],
    colors: [{ name: "Yellow Check", hex: "#F2C94C" }],
    sizes: ["XXS", "XS", "S", "M", "L", "XL"],
    rating: 0,
    ratingCount: 0,
    description:
      "A cheerful yellow checkered dog dress with a fitted sleeveless bodice and a flared skirt.",
    highlights: [
      "Yellow check pattern",
      "Sleeveless fitted bodice",
      "Flared skirt",
    ],
    fabric: "Composition to be confirmed with supplier",
    care: "Refer to the care label",
  },
  {
    id: "DOOM-005",
    brand: "Doom",
    name: "Dotty About You",
    category: "dog",
    garment: "dress",
    price: 1299,
    mrp: 1999,
    image: "/photos/doom-005-dotty-about-you.jpg",
    gallery: [
      "/photos/catalogue/doom-005-dotty-about-you-1.jpg",
      "/photos/catalogue/doom-005-dotty-about-you-2.jpg",
      "/photos/catalogue/doom-005-dotty-about-you-3.jpg",
      "/photos/catalogue/doom-005-dotty-about-you-4.jpg",
    ],
    colors: [{ name: "Grey & Yellow", hex: "#B9B9B9" }],
    sizes: ["XXS", "XS", "S", "M", "L", "XL"],
    rating: 0,
    ratingCount: 0,
    description:
      "A bright grey-and-yellow polka-dot dog dress with a fitted sleeveless bodice and a flared skirt.",
    highlights: [
      "Grey base with yellow dots",
      "Sleeveless fitted bodice",
      "Flared skirt",
    ],
    fabric: "Composition to be confirmed with supplier",
    care: "Refer to the care label",
  },
]

export const brands = Array.from(new Set(products.map((p) => p.brand))).sort()

export function getProduct(id: string) {
  return products.find((p) => p.id === id)
}

export function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`
}

export function discount(price: number, mrp: number) {
  return Math.round(((mrp - price) / mrp) * 100)
}
