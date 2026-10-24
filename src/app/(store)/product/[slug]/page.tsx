import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products as seed, categoryBySlug, collectionPath } from "@/lib/products";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, productLd } from "@/lib/seo";
import { getCatalog, getProductBySlug } from "@/lib/catalog";
import ProductArt from "@/components/ProductArt";
import ProductCard from "@/components/ProductCard";
import AddToBag from "@/components/AddToBag";
import ViewItem from "@/components/ViewItem";

export async function generateStaticParams() {
  try {
    const list = await getCatalog();
    if (list.length) return list.map((p) => ({ slug: p.slug }));
  } catch {}
  return seed.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  const description = `${p.tagline} ${p.description}`.replace(/\s+/g, " ").trim().slice(0, 300);
  const path = `/product/${p.slug}`;
  return { title: p.name, description, alternates: { canonical: path }, openGraph: { title: `${p.name} · D’Vorsche`, description, url: path } };
}

// Unknown slugs stream a 404 page with a noindex tag (Next.js adds it); see docs/seo for the status-code note.
export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<div className="page" aria-busy="true"><p className="eyebrow">Loading…</p></div>}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: PageProps<"/product/[slug]">["params"] }) {
  const { slug } = await params;
  const [p, products] = await Promise.all([getProductBySlug(slug), getCatalog()]);
  if (!p) notFound();
  const related = products.filter((x) => x.slug !== p.slug && x.category === p.category).concat(products.filter((x) => x.category !== p.category)).slice(0, 4);

  const cat = categoryBySlug(p.category);
  const path = `/product/${p.slug}`;
  return (
    <div className="page">
      <JsonLd
        data={[
          productLd(p, path),
          breadcrumbLd([{ name: "Home", path: "/" }, ...(cat ? [{ name: cat.label, path: collectionPath(cat) }] : []), { name: p.name, path }]),
        ]}
      />
      <ViewItem slug={p.slug} name={p.name} price={p.price} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / {cat ? <><Link href={collectionPath(cat)}>{cat.label}</Link> / </> : null}<span aria-current="page">{p.name}</span>
      </nav>

      <div className="pdp">
        <div className="pdp-media deco">
          <div className="frame-art">
            <ProductArt art={p.art} label={`${p.name} by D’Vorsche`} />
            {p.badge && <span className="badge">{p.badge}</span>}
          </div>
        </div>

        <div className="pdp-info">
          <p className="eyebrow">{cat?.label ?? p.category}</p>
          <h1 className="serif">{p.name}</h1>
          <p className="pdp-tag serif">{p.tagline}</p>
          <p className="pdp-desc">{p.description}</p>

          <AddToBag product={p} />

          <ul className="assure">
            <li>Complimentary shipping over $250</li>
            <li>Gift-wrapped as standard</li>
            <li>30-day returns</li>
          </ul>

          {p.notes && (
            <details open>
              <summary>Notes</summary>
              <ul>
                {p.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </details>
          )}
          <details open={!p.notes}>
            <summary>Details</summary>
            <ul>
              {p.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </details>
          <details>
            <summary>Shipping &amp; returns</summary>
            <p>Orders ship within 2 business days. Standard delivery takes 3–5 days; express arrives next business day. Returns are free within 30 days for unused items.</p>
          </details>
        </div>
      </div>

      <section className="section tight">
        <div className="section-head">
          <p className="eyebrow">Also in the collection</p>
          <h2 className="serif">You may also like</h2>
        </div>
        <div className="grid">
          {related.map((r) => (
            <ProductCard key={r.slug} p={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
