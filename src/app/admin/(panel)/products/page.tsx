import Link from "next/link";
import { listProductsAdmin } from "@/lib/admin-data";
import { setProductActive } from "../../actions";
import { money } from "@/lib/products";

export const instant = false; // session-gated: always rendered per request

export const metadata = { title: "Products" };

export default async function Products() {
  const products = await listProductsAdmin();
  return (
    <>
      <header className="a-head"><div><h1>Products</h1><p className="a-muted">{products.length} products</p></div><Link href="/admin/products/new" className="a-btn a-btn-primary">+ New product</Link></header>
      <section className="a-card flush">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Product</th><th>Category</th><th className="r">Price</th><th className="r">Stock</th><th>Status</th><th /></tr></thead>
            <tbody>
              {products.map((p) => {
                const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                const prices = p.variants.map((v) => v.price);
                const lo = Math.min(...prices), hi = Math.max(...prices);
                return (
                  <tr key={p.id}>
                    <td><Link href={`/admin/products/${p.id}`}><b>{p.name}</b></Link><br /><span className="a-muted">/{p.slug}</span></td>
                    <td style={{ textTransform: "capitalize" }}>{p.category}</td>
                    <td className="r">{lo === hi ? money(lo) : `${money(lo)} – ${money(hi)}`}</td>
                    <td className="r"><span className={`a-badge ${stock === 0 ? "s-cancelled" : p.variants.some((v) => v.stock <= v.low_stock_threshold) ? "s-pending" : "s-delivered"}`}>{stock}</span></td>
                    <td>{p.active ? <span className="a-badge s-delivered">Live</span> : <span className="a-badge s-refunded">Hidden</span>}{p.featured && <span className="a-badge s-paid" style={{ marginLeft: 6 }}>Featured</span>}</td>
                    <td className="r">
                      <form action={setProductActive} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={p.id} /><input type="hidden" name="active" value={String(!p.active)} />
                        <button className="a-link">{p.active ? "Hide" : "Publish"}</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && <tr><td colSpan={6} className="a-muted">No products yet. Run <code>npm run db:seed</code> or create one.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
