import Link from "next/link";
import { CATEGORIES, collectionPath } from "@/lib/products";
import { getCatalog } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import ProductArt from "@/components/ProductArt";
import Newsletter from "@/components/Newsletter";
import { Logo, WovenMark } from "@/components/Brand";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import JsonLd from "@/components/JsonLd";
import { navigationLd, organizationLd, websiteLd } from "@/lib/seo";
import { PILLARS, STANDARD, TAGLINE } from "@/lib/brand-story";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "D’Vorsche — The Luxury Wallets" },
  description: "Quiet authority. Lasting character. Nothing unnecessary. Luxury wallets from D’Vorsche, marked by the Woven DV monogram. Complimentary shipping over $250.",
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
      <JsonLd data={[organizationLd(), websiteLd(), navigationLd()]} />
      <section className="hero on-dark" aria-label="Introduction">
        <WovenMark className="hero-mark" />
        <div className="hero-in">
          <div className="hero-copy">
            <p className="eyebrow">Luxury leather wallets</p>
            <h1 className="serif">
              Not made to follow.
              <br />
              <em>Made to endure.</em>
            </h1>
            <p className="lede">Quiet authority. Lasting character. Nothing unnecessary. Leather wallets marked by a single signature: the Woven DV monogram.</p>
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

      <section className="manifesto reveal" aria-label="Philosophy">
        <p className="eyebrow">The Philosophy</p>
        <p className="manifesto-text serif">
          True distinction doesn’t need to announce itself. It is the difference between owning something expensive and owning something <em>exceptional.</em>
        </p>
        <Link href="/story" className="link-u">Read our story</Link>
      </section>

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

      <section className="chapter reveal" aria-labelledby="chapter-title">
        <p className="eyebrow">Our First Chapter</p>
        <h2 className="serif" id="chapter-title">The wallet.</h2>
        <p className="chapter-copy">
          Small enough to carry everywhere, personal enough to use every day, and practical enough that every design decision matters. Not another accessory
          designed only to look impressive in a photograph. An essential designed to earn its place in your everyday life.
        </p>
        <Link href="/about#first-chapter" className="link-u">Read the chapter</Link>
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
        <div className="values four">
          {PILLARS.map((p) => (
            <div key={p.title} className="value reveal"><h3 className="serif">{p.title}</h3><p>{p.body}</p></div>
          ))}
        </div>
      </section>

      <section className="standard on-dark reveal" aria-labelledby="standard-title">
        <p className="eyebrow">The D’Vorsche Standard</p>
        <h2 className="serif" id="standard-title">Every product must answer three questions.</h2>
        <ol className="standard-list">
          {STANDARD.map((q, i) => (
            <li key={q}><span className="numeral serif">{["I", "II", "III"][i]}</span><span className="serif">{q}</span></li>
          ))}
        </ol>
        <p className="tagline serif">{TAGLINE}</p>
      </section>

      <Newsletter />
    </>
  );
}
