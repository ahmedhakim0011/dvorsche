import Link from "next/link";
import { CATEGORIES, collectionPath, type CategoryInfo } from "@/lib/products";
import { getCatalog } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";

const SORTS = [
  { v: "featured", l: "Featured" },
  { v: "price-asc", l: "Price: low to high" },
  { v: "price-desc", l: "Price: high to low" },
  { v: "name", l: "Name" },
];

type SP = Record<string, string | string[] | undefined>;

/** Shared by /shop (all products) and /collections/[handle]. Filter chips link to clean collection URLs; only sort and search use query strings. */
export default async function ShopListing({ searchParams, category }: { searchParams: Promise<SP>; category?: CategoryInfo }) {
  const sp = await searchParams;
  const products = await getCatalog();
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const sort = one(sp.sort) || "featured";
  const q = one(sp.q).trim().toLowerCase();
  const base = category ? collectionPath(category) : "/shop";

  let list = products.filter((p) => (!category || p.category === category.slug) && (!q || `${p.name} ${p.tagline} ${p.category}`.toLowerCase().includes(q)));
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

  const href = (o: { sort?: string; q?: string }) => {
    const u = new URLSearchParams();
    const next = { sort: sort === "featured" ? "" : sort, q, ...o };
    Object.entries(next).forEach(([k, v]) => v && u.set(k, v));
    const s = u.toString();
    return s ? `${base}?${s}` : base;
  };

  return (
    <div className="page">
      <header className="page-head center">
        <p className="eyebrow">{category ? "Collection" : "The full collection"}</p>
        <h1 className="serif">{category ? (category.slug === "leather" ? "The luxury wallets" : category.label) : "All pieces"}</h1>
        <p className="muted">{category?.intro ?? "Every piece in the D’Vorsche collection."}</p>
      </header>

      <div className="toolbar">
        <nav className="filters" aria-label="Categories">
          <Link href="/shop" className={`chip${!category ? " on" : ""}`}>All</Link>
          {CATEGORIES.filter((c) => products.some((p) => p.category === c.slug)).map((c) => (
            <Link key={c.slug} href={collectionPath(c)} className={`chip${category?.slug === c.slug ? " on" : ""}`}>
              {c.label}
            </Link>
          ))}
        </nav>
        <form action={base} className="search">
          <input id="search" type="search" name="q" defaultValue={q} placeholder="Search the collection" aria-label="Search products" />
        </form>
        <div className="sorts">
          {SORTS.map((s) => (
            <Link key={s.v} href={href({ sort: s.v === "featured" ? "" : s.v })} className={sort === s.v ? "on" : ""} rel="nofollow">
              {s.l}
            </Link>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <p className="serif">Nothing matches your search.</p>
          <Link href={base} className="btn btn-ghost">Clear filters</Link>
        </div>
      ) : (
        <div className="grid">
          {list.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
