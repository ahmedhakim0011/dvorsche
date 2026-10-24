export type Category = "fragrance" | "leather" | "home";
export type ArtType = "bottle" | "candle" | "tote" | "clutch" | "wallet" | "throw" | "vase";

export interface Variant {
  label: string;
  price: number;
  /** Units available. `undefined` means untracked (demo catalog). */
  stock?: number;
}

export interface Product {
  id?: string;
  slug: string;
  name: string;
  category: Category;
  tagline: string;
  description: string;
  price: number;
  variants?: Variant[];
  notes?: string[];
  details: string[];
  badge?: string;
  featured?: boolean;
  /** Units available for products without variants. `undefined` means untracked. */
  stock?: number;
  art: { type: ArtType; bg: [string, string]; c1: string; c2: string };
}

export const CATEGORIES: { slug: Category; label: string; blurb: string }[] = [
  { slug: "leather", label: "Wallets", blurb: "Understated wallets and card holders, marked by the Woven DV monogram." },
  { slug: "fragrance", label: "Fragrance", blurb: "Fragrance from D’Vorsche." },
  { slug: "home", label: "Accessories", blurb: "Considered accessories." },
];

/** Primary navigation. Only categories that currently hold products are listed, so future lines appear automatically. */
export function navFor(catalog: Product[]) {
  return [
    { href: "/shop", label: "Shop all" },
    ...CATEGORIES.filter((c) => catalog.some((p) => p.category === c.slug)).map((c) => ({ href: `/shop?category=${c.slug}`, label: c.label })),
    { href: "/about", label: "The House" },
  ];
}

/**
 * Seed data & offline demo catalog. PLACEHOLDER PRODUCTS: names, prices, colours and copy are stand-ins until
 * D’Vorsche supplies the real range (materials, dimensions and care details included). In production the catalog
 * lives in Supabase and is managed from /admin (see scripts/seed.mjs).
 */
export const products: Product[] = [
  {
    slug: "the-bifold",
    name: "The Bifold",
    category: "leather",
    tagline: "A wallet with one quiet signature.",
    description:
      "A classic bifold in leather, finished with the Woven DV monogram on the front. Placeholder copy: final materials, construction and dimensions to be supplied by D’Vorsche.",
    price: 150,
    variants: [
      { label: "Oxblood", price: 150 },
      { label: "Black", price: 150 },
    ],
    details: ["Woven DV monogram on the front", "Placeholder product — specifications to be confirmed"],
    featured: true,
    art: { type: "wallet", bg: ["#f1e8d6", "#d9ccb0"], c1: "#4b1622", c2: "#a98a52" },
  },
  {
    slug: "the-slim",
    name: "The Slim",
    category: "leather",
    tagline: "Pared back, for the pocket.",
    description:
      "A slimmer wallet for those who carry less. Placeholder copy: final materials, construction and dimensions to be supplied by D’Vorsche.",
    price: 150,
    variants: [
      { label: "Espresso", price: 150 },
      { label: "Black", price: 150 },
    ],
    details: ["Woven DV monogram on the front", "Placeholder product — specifications to be confirmed"],
    featured: true,
    art: { type: "wallet", bg: ["#ece2cd", "#d3c4a6"], c1: "#3b2419", c2: "#a98a52" },
  },
  {
    slug: "the-card-holder",
    name: "The Card Holder",
    category: "leather",
    tagline: "The essentials, nothing more.",
    description:
      "A compact card holder for everyday use. Placeholder copy: final materials, construction and dimensions to be supplied by D’Vorsche.",
    price: 95,
    variants: [
      { label: "Black", price: 95 },
      { label: "Oxblood", price: 95 },
    ],
    details: ["Woven DV monogram on the front", "Placeholder product — specifications to be confirmed"],
    featured: true,
    art: { type: "wallet", bg: ["#efe6d4", "#d6c8aa"], c1: "#1e1718", c2: "#a98a52" },
  },
];

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);
