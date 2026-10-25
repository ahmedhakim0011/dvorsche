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

export interface CategoryInfo {
  slug: Category;
  /** Public URL handle: /collections/{handle}. Kept separate from the database slug so URLs can be descriptive. */
  handle: string;
  label: string;
  blurb: string;
  /** SEO: <title> (the site name is appended by the title template) and meta description. Claims here must stay verifiable. */
  metaTitle: string;
  metaDescription: string;
  /** Short unique introduction shown at the top of the collection page. */
  intro: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: "leather",
    handle: "wallets",
    label: "Wallets",
    blurb: "Understated wallets, marked by the Woven DV monogram.",
    metaTitle: "The Luxury Wallets",
    metaDescription: "Shop D’Vorsche, the luxury wallets: understated design marked by the Woven DV monogram. Complimentary shipping over $250.",
    intro: "Luxury wallets with quiet proportions and a single signature, the Woven DV monogram. Choose by size and colour; each piece page lists its details.",
  },
  {
    slug: "fragrance",
    handle: "fragrance",
    label: "Fragrance",
    blurb: "Fragrance from D’Vorsche.",
    metaTitle: "Fragrance",
    metaDescription: "Fragrance from D’Vorsche.",
    intro: "Fragrance from D’Vorsche.",
  },
  {
    slug: "home",
    handle: "accessories",
    label: "Accessories",
    blurb: "Considered accessories.",
    metaTitle: "Accessories",
    metaDescription: "Considered accessories from D’Vorsche.",
    intro: "Considered accessories from D’Vorsche.",
  },
];

export const categoryByHandle = (h: string) => CATEGORIES.find((c) => c.handle === h);
export const categoryBySlug = (s: string) => CATEGORIES.find((c) => c.slug === s);
export const collectionPath = (c: CategoryInfo) => `/collections/${c.handle}`;

/** Primary navigation. Only categories that currently hold products are listed, so future lines appear automatically. */
export function navFor(catalog: Product[]) {
  return [
    { href: "/shop", label: "Shop all" },
    ...CATEGORIES.filter((c) => catalog.some((p) => p.category === c.slug)).map((c) => ({ href: collectionPath(c), label: c.label })),
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
    tagline: "One quiet signature.",
    description:
      "The wallet, considered. A bifold of quiet proportions, marked by a single signature: the Woven DV monogram. Nothing added to impress, nothing missing when it counts.",
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
    tagline: "Carry less. Choose well.",
    description:
      "For those who carry less, and choose it well. A slimmer wallet where every line has a reason to exist, carried by the Woven DV monogram alone.",
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
      "The essentials, nothing more. A card holder small enough to carry everywhere and considered enough to use every day, marked once, quietly.",
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
