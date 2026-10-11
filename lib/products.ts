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

export const dogSizeChart = [
  { size: "XXS", neck: 10, chest: 14, length: 10 },
  { size: "XS", neck: 12, chest: 17, length: 12 },
  { size: "S", neck: 14, chest: 20, length: 14 },
  { size: "M", neck: 16, chest: 24, length: 16 },
  { size: "L", neck: 18, chest: 27, length: 18 },
  { size: "XL", neck: 20, chest: 32, length: 20 },
  { size: "2XL", neck: 22, chest: 34, length: 22 },
  { size: "3XL", neck: 26, chest: 38, length: 24 },
  { size: "4XL", neck: 28, chest: 42, length: 26 },
]

export const catSizeChart = [
  { size: "S", neck: 8, chest: 12, length: 9 },
  { size: "M", neck: 10, chest: 15, length: 11 },
  { size: "L", neck: 12, chest: 18, length: 13 },
  { size: "XL", neck: 14, chest: 21, length: 15 },
]

export const measureGuide = [
  {
    label: "Neck",
    detail: "Measure around the base of your dog's neck.",
  },
  {
    label: "Chest",
    detail: "Measure around the widest part of your dog's chest.",
  },
  {
    label: "Length",
    detail: "Measure from the base of the neck to the base of the tail.",
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

const dogSizes = dogSizeChart.map((r) => r.size)
const catSizes = catSizeChart.map((r) => r.size)

export const products: Product[] = [
  {
    id: "1",
    brand: "Doom",
    name: "Cozy Fleece-Lined Dog Hoodie",
    category: "dog",
    garment: "hoodie",
    price: 1299,
    mrp: 2499,
    image: "/photos/dog-hoodie.jpg",
    gallery: ["/photos/dog-hoodie.jpg"],
    colors: [
      { name: "Midnight Navy", hex: "#2F3A56" },
      { name: "Charcoal", hex: "#3A3A3A" },
      { name: "Cocoa", hex: "#7B4B32" },
      { name: "Blush", hex: "#F2C4C4" },
    ],
    sizes: dogSizes,
    rating: 4.6,
    ratingCount: 1284,
    description:
      "The everyday hoodie your dog will actually keep on. Soft brushed fleece inside, a lined hood that holds its shape, and a treat pocket sized for the good stuff.",
    highlights: [
      "Brushed fleece lining for warmth without bulk",
      "Treat pocket with reinforced stitching",
      "Adjustable drawstring hood",
      "Ribbed cuffs that stay put",
    ],
    fabric: "80% cotton, 20% polyester fleece",
    care: "Machine wash cold, tumble dry low, do not bleach",
  },
  {
    id: "2",
    brand: "Nuzzle Knit",
    name: "Merino Blend Cat Sweater",
    category: "cat",
    garment: "sweater",
    price: 899,
    mrp: 1599,
    image: "/photos/cat-sweater.jpg",
    gallery: ["/photos/cat-sweater.jpg"],
    colors: [
      { name: "Blush Pink", hex: "#F5C6D0" },
      { name: "Powder Blue", hex: "#BBD7EA" },
      { name: "Lavender", hex: "#C9B8E8" },
      { name: "Cream", hex: "#F5EFE0" },
    ],
    sizes: catSizes,
    rating: 4.8,
    ratingCount: 942,
    description:
      "Fine merino knit with a gentle stretch so nothing pinches when they stretch out for a nap. Ribbed trim that springs back after every wash.",
    highlights: [
      "Fine-gauge merino wool blend",
      "Four-way stretch, no itch",
      "Ribbed neck and hem",
      "Machine washable",
    ],
    fabric: "60% merino wool, 40% acrylic",
    care: "Hand wash cool or wool cycle, dry flat",
  },
  {
    id: "3",
    brand: "Storm Paws",
    name: "Hi-Vis Waterproof Raincoat",
    category: "dog",
    garment: "raincoat",
    price: 1499,
    mrp: 2699,
    image: "/photos/dog-raincoat.jpg",
    gallery: ["/photos/dog-raincoat.jpg"],
    colors: [
      { name: "Safety Yellow", hex: "#F2C230" },
      { name: "Ocean Blue", hex: "#2C6E9B" },
      { name: "Signal Orange", hex: "#E8703A" },
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.5,
    ratingCount: 613,
    description:
      "Night walks sorted. Fully taped seams, a reflective chest stripe that catches headlights, and straps that adjust without cutting off the air supply.",
    highlights: [
      "Fully taped waterproof seams",
      "Reflective striping for night visibility",
      "Adjustable neck and chest straps",
      "Dries in minutes",
    ],
    fabric: "TPU-coated polyester shell",
    care: "Rinse clean, air dry, no fabric softener",
  },
  {
    id: "4",
    brand: "Doom",
    name: "Everyday Cotton Bandana",
    category: "dog",
    garment: "bandana",
    price: 399,
    mrp: 799,
    image: "/photos/dog-bandana.jpg",
    gallery: ["/photos/dog-bandana.jpg"],
    colors: [
      { name: "Cherry Red", hex: "#C6362F" },
      { name: "Denim Blue", hex: "#4A6B8A" },
      { name: "Fern Green", hex: "#4C7A52" },
      { name: "Butter Yellow", hex: "#F0D264" },
    ],
    sizes: ["One Size"],
    rating: 4.4,
    ratingCount: 2310,
    description:
      "The one-siz-fits-most bandana that actually survives the washing machine. Snap tie closure, breathable cotton, and a double-stitched edge.",
    highlights: [
      "Snap tie closure, no dangling ends",
      "Double-stitched edges",
      "Breathable cotton weave",
      "One size fits most dogs",
    ],
    fabric: "100% combed cotton",
    care: "Machine wash warm with like colours",
  },
  {
    id: "5",
    brand: "North Paw",
    name: "Thermal Winter Coat",
    category: "dog",
    garment: "coat",
    price: 1899,
    mrp: 3499,
    image: "/photos/dog-winter-coat.jpg",
    gallery: ["/photos/dog-winter-coat.jpg"],
    colors: [
      { name: "Deep Navy", hex: "#243B5A" },
      { name: "Jet Black", hex: "#222222" },
      { name: "Bordeaux", hex: "#7A2233" },
      { name: "Stone Grey", hex: "#9B9B9B" },
    ],
    sizes: ["S", "M", "L", "XL", "2XL"],
    rating: 4.7,
    ratingCount: 1580,
    description:
      "Built for actual cold. Recycled thermal fill, a fleece-lined collar that sits soft against the jaw, and a leash hole that threads through a reinforced webbing loop.",
    highlights: [
      "Recycled thermal insulation",
      "Fleece-lined collar",
      "Reinforced leash loop",
      "Wind-resistant outer shell",
    ],
    fabric: "Recycled polyester fill, cotton-blend shell",
    care: "Machine wash cold, dry on low heat",
  },
  {
    id: "6",
    brand: "Sunbeam Pets",
    name: "Cotton Cat Bandana",
    category: "cat",
    garment: "bandana",
    price: 1099,
    mrp: 1899,
    image: "/photos/cat-bandana.jpg",
    gallery: ["/photos/cat-bandana.jpg"],
    colors: [
      { name: "Daisy White", hex: "#F7F4EC" },
      { name: "Lavender", hex: "#C9B8E8" },
      { name: "Sage", hex: "#B7CBB0" },
    ],
    sizes: catSizes,
    rating: 4.6,
    ratingCount: 487,
    description:
      "A light cotton bandana for cats, cut small so it sits comfortably on a slender neck. Tie it loose, or knot it once for a scarf finish.",
    highlights: [
      "Soft cotton weave, no itch",
      "Generous tie length for a neat knot",
      "Cut for slim cat necks",
      "Machine washable",
    ],
    fabric: "100% cotton poplin",
    care: "Machine wash cold, line dry",
  },
  {
    id: "7",
    brand: "Rustic Denim",
    name: "Quilted Dog Jacket",
    category: "dog",
    garment: "jacket",
    price: 1599,
    mrp: 2999,
    image: "/photos/dog-jacket.jpg",
    gallery: ["/photos/dog-jacket.jpg"],
    colors: [
      { name: "Mid Indigo", hex: "#3E5C76" },
      { name: "Faded Black", hex: "#33383D" },
      { name: "Vintage Blue", hex: "#6D8AA6" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.3,
    ratingCount: 392,
    description:
      "A light quilted jacket that slides on without fuss. Soft lining, a full-length zip and rib cuffs keep it warm without restricting the shoulders.",
    highlights: [
      "Lightweight quilted shell",
      "Fleece lining at the collar",
      "Full-length zip with a chin guard",
      "Rib cuffs and hem",
    ],
    fabric: "Recycled polyester shell, cotton lining",
    care: "Wash inside out, cold, line dry",
  },
  {
    id: "8",
    brand: "Wild West Co.",
    name: "Occasion Pet Hat",
    category: "dog",
    garment: "hat",
    price: 699,
    mrp: 1299,
    image: "/photos/dog-hat.jpg",
    gallery: ["/photos/dog-hat.jpg"],
    colors: [
      { name: "Blush Pink", hex: "#E3B7B7" },
      { name: "Buttercup", hex: "#F0D264" },
      { name: "Charcoal", hex: "#3A3A3A" },
    ],
    sizes: ["S", "M", "L"],
    rating: 4.5,
    ratingCount: 271,
    description:
      "The photo-worthy accessory. A structured brim with a stitched floral band and an adjustable chin strap so it stays on through photos and walks.",
    highlights: [
      "Structured brim with a stitched floral band",
      "Adjustable chin strap with a buckle",
      "Lightweight cotton twill",
      "Sized S to L",
    ],
    fabric: "100% cotton twill",
    care: "Spot clean only",
  },
  {
    id: "9",
    brand: "Black Tie Pets",
    name: "Velvet Tuxedo & Bow Tie",
    category: "cat",
    garment: "tuxedo",
    price: 1199,
    mrp: 2199,
    image: "/photos/cat-tuxedo.jpg",
    gallery: ["/photos/cat-tuxedo.jpg"],
    colors: [
      { name: "Onyx", hex: "#1A1A1A" },
      { name: "Pearl White", hex: "#F2F2F2" },
    ],
    sizes: catSizes,
    rating: 4.7,
    ratingCount: 356,
    description:
      "Sharp black velvet with a satin bow tie that clips on without fuss. For weddings, birthdays, and any occasion where your cat deserves the spotlight.",
    highlights: [
      "Soft velvet body with satin trim",
      "Breakaway bow tie clip",
      "Elasticated back for a snug fit",
      "Hand wash only",
    ],
    fabric: "Polyester velvet, satin trim",
    care: "Spot clean, do not machine wash",
  },
  {
    id: "10",
    brand: "Hollywoof",
    name: "Festive Fair Isle Sweater",
    category: "dog",
    garment: "sweater",
    price: 1399,
    mrp: 2499,
    image: "/photos/dog-festive-sweater.jpg",
    gallery: ["/photos/dog-festive-sweater.jpg"],
    colors: [
      { name: "Christmas Red", hex: "#A8232B" },
      { name: "Forest", hex: "#1F4A3C" },
    ],
    sizes: dogSizes,
    rating: 4.8,
    ratingCount: 1104,
    description:
      "Knitted fair isle pattern with a ribbed collar that holds its shape. Warm enough for the porch, photogenic enough for the family album.",
    highlights: [
      "Jacquard fair isle knit",
      "Ribbed collar and cuffs",
      "Non-shedding yarn",
      "Warm without bulk",
    ],
    fabric: "Acrylic wool blend knit",
    care: "Hand wash cool, dry flat",
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
