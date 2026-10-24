import Link from "next/link";
import { CATEGORIES, collectionPath } from "@/lib/products";
import { getCatalog } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import ProductArt from "@/components/ProductArt";
import Newsletter from "@/components/Newsletter";
import { Logo, WovenMark } from "@/components/Brand";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import JsonLd from "@/components/JsonLd";
import { organizationLd, websiteLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "D’Vorsche — Luxury Leather Wallets & Card Holders" },
  description: "Understated leather wallets and card holders from D’Vorsche, marked by the Woven DV monogram. Complimentary shipping over $250.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const products = await getCatalog();
  const hero = products.find((p) => p.featured) ?? products[0];
  const featured = (products.filter((p) => p.featured).length ? products.filter((p) => p.featured) : products).slice(0, 4);
  const cats = CATEGORIES.filter((c) => products.some((p) => p.category === c.slug));
  if (!hero)
    return (
      <div className="page empty">
        <WovenMark className="mark-sm" />
        <h1 className="serif">The collection is being prepared.</h1>
      </div>
    );

  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd()]} />
      <section className="hero on-dark" aria-label="Introduction">
        <WovenMark className="hero-mark" />
        <div className="hero-in">
          <div className="hero-copy">
            <p className="eyebrow">Luxury leather wallets</p>
            <h1 className="serif">
              Made to be carried,
              <br />
              <em>never announced.</em>
            </h1>
            <p className="lede">Leather wallets and card holders with quiet proportions and a single signature: the Woven DV monogram.</p>
            <div className="hero-cta">
              <Link href="/collections/wallets" className="btn btn-light">Shop wallets</Link>
              <Link href={`/product/${hero.slug}`} className="btn btn-ghost">Discover {hero.name}</Link>
            </div>
          </div>
          <div className="hero-art deco">
            <div className="frame-art">
              <ProductArt art={hero.art} label={hero.name} />
            </div>
            <div className="hero-tag">
              <span className="eyebrow">Featured</span>
              <strong className="serif">{hero.name}</strong>
              <span className="muted small">{hero.tagline}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="principles">
        <ul>
          <li>Complimentary shipping over ${FREE_SHIPPING_THRESHOLD}</li>
          <li>30-day returns</li>
          <li>Gift-wrapped as standard</li>
        </ul>
      </div>

      {cats.length > 1 && (
        <section className="section">
          <div className="section-head center">
            <p className="eyebrow">The Collection</p>
            <h2 className="serif">Choose your category</h2>
          </div>
          <div className="cat-grid">
            {cats.map((c) => {
              const first = products.find((p) => p.category === c.slug) ?? hero;
              return (
                <Link key={c.slug} href={collectionPath(c)} className="cat">
                  <ProductArt art={first.art} label={c.label} />
                  <div className="cat-label">
                    <h3 className="serif">{c.label}</h3>
                    <p>{c.blurb}</p>
                    <span className="arrow">Shop {c.label.toLowerCase()} →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head row-between">
          <div>
            <p className="eyebrow">The Collection</p>
            <h2 className="serif">Signature pieces</h2>
          </div>
          <Link href="/shop" className="link-u">View all</Link>
        </div>
        <div className="grid">
          {featured.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </section>

      <section className="story on-dark" aria-labelledby="story-title">
        <div className="story-in">
          <div className="story-plaque deco">
            <Logo variant="stacked" tone="ivory" alt="D’Vorsche, Woven DV monogram" />
          </div>
          <div className="story-copy">
            <p className="eyebrow">The House</p>
            <h2 className="serif" id="story-title">
              Luxury should be felt <em>before</em> it is seen.
            </h2>
            <p>
              D’Vorsche is built on restraint. Each wallet carries one signature, the Woven DV monogram, in which the V passes under and over the D. It is the only
              ornament, and it is enough.
            </p>
            <Link href="/about" className="btn btn-ghost">Our philosophy</Link>
          </div>
        </div>
        <div className="values">
          <div className="value"><h3 className="serif">Proportion</h3><p>Balanced margins and clean lines, so that nothing is louder than it needs to be.</p></div>
          <div className="value"><h3 className="serif">Material</h3><p>Leather chosen to age with its owner, in a palette of oxblood, black and brown.</p></div>
          <div className="value"><h3 className="serif">Detail</h3><p>A single mark, placed with care. Considered details over decoration.</p></div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
