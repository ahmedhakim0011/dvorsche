import Link from "next/link";
import { money, type Product } from "@/lib/products";
import { inStock } from "@/lib/catalog-utils";
import ProductArt from "./ProductArt";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/product/${p.slug}`} className="card">
      <div className="card-media">
        <ProductArt art={p.art} label={p.name} />
        {!inStock(p) ? <span className="badge">Sold out</span> : p.badge && <span className="badge">{p.badge}</span>}
        <span className="card-cta">View piece</span>
      </div>
      <div className="card-body">
        <h3 className="serif">{p.name}</h3>
        <p className="muted small">{p.tagline}</p>
        <p className="price">{p.variants && new Set(p.variants.map((v) => v.price)).size > 1 ? `From ${money(p.price)}` : money(p.price)}</p>
      </div>
    </Link>
  );
}
