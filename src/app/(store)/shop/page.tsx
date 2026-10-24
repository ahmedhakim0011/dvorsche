import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/products";
import { getCatalog } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = { title: "Shop" };

const SORTS = [
  { v: "featured", l: "Featured" },
  { v: "price-asc", l: "Price: low to high" },
  { v: "price-desc", l: "Price: high to low" },
  { v: "name", l: "Name" },
];

export default function Shop({ searchParams }: PageProps<"/shop">) {
  return (
    <Suspense fallback={<div className="page"><header className="page-head"><p className="eyebrow">The full collection</p><h1 className="serif">All pieces</h1></header></div>}>
      <ShopContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ShopContent({ searchParams }: { searchParams: PageProps<"/shop">["searchParams"] }) {
  const sp = await searchParams;
  const products = await getCatalog();
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const category = one(sp.category);
  const sort = one(sp.sort) || "featured";
  const q = one(sp.q).trim().toLowerCase();

  let list = products.filter((p) => (!category || p.category === category) && (!q || `${p.name} ${p.tagline} ${p.category}`.toLowerCase().includes(q)));
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

  const href = (o: Record<string, string>) => {
    const u = new URLSearchParams();
    const next = { category, sort: sort === "featured" ? "" : sort, q, ...o };
    Object.entries(next).forEach(([k, v]) => v && u.set(k, v));
    const s = u.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  const current = CATEGORIES.find((c) => c.slug === category);

  return (
    <div className="page">
      <header className="page-head center">
        <p className="eyebrow">{current ? "Collection" : "The full collection"}</p>
        <h1 className="serif">{current?.label ?? "All pieces"}</h1>
        <p className="muted">{current?.blurb ?? "Every piece in the D’Vorsche collection."}</p>
      </header>

      <div className="toolbar">
        <nav className="filters" aria-label="Categories">
          <Link href={href({ category: "" })} className={`chip${!category ? " on" : ""}`}>All</Link>
          {CATEGORIES.filter((c) => products.some((p) => p.category === c.slug)).map((c) => (
            <Link key={c.slug} href={href({ category: c.slug })} className={`chip${category === c.slug ? " on" : ""}`}>
              {c.label}
            </Link>
          ))}
        </nav>
        <form action="/shop" className="search">
          {category && <input type="hidden" name="category" value={category} />}
          <input id="search" type="search" name="q" defaultValue={q} placeholder="Search the collection" aria-label="Search products" />
        </form>
        <div className="sorts">
          {SORTS.map((s) => (
            <Link key={s.v} href={href({ sort: s.v === "featured" ? "" : s.v })} className={sort === s.v ? "on" : ""}>
              {s.l}
            </Link>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <p className="serif">Nothing matches your search.</p>
          <Link href="/shop" className="btn btn-ghost">Clear filters</Link>
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
