import Link from "next/link";
import { fmtDateTime } from "@/lib/format";
import { listInventory } from "@/lib/admin-data";
import { adjustStock } from "../../actions";
import { money } from "@/lib/products";
import ActionForm from "@/components/admin/ActionForm";

export const instant = false; // session-gated: always rendered per request

export const metadata = { title: "Inventory" };

export default async function Inventory({ searchParams }: PageProps<"/admin/inventory">) {
  const sp = await searchParams;
  const view = (Array.isArray(sp.view) ? sp.view[0] : sp.view) ?? "all";
  const { rows, movements } = await listInventory();
  const low = rows.filter((r) => r.stock <= r.threshold);
  const shown = view === "low" ? low : rows;
  const units = rows.reduce((s, r) => s + r.stock, 0);
  const value = rows.reduce((s, r) => s + r.stock * r.price, 0);

  return (
    <>
      <header className="a-head"><div><h1>Inventory</h1><p className="a-muted">{units} units · {money(Math.round(value))} at retail · {low.length} need attention</p></div></header>
      <nav className="a-tabs" style={{ marginBottom: 16 }}>
        <Link href="/admin/inventory" className={view !== "low" ? "on" : ""}>All variants</Link>
        <Link href="/admin/inventory?view=low" className={view === "low" ? "on" : ""}>Low &amp; out of stock ({low.length})</Link>
      </nav>
      <section className="a-card flush">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Product</th><th>SKU</th><th className="r">Price</th><th className="r">On hand</th><th>Adjust stock</th></tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td><Link href={`/admin/products/${r.productId}`}><b>{r.product}</b></Link>{r.label !== "Standard" && <span className="a-muted"> · {r.label}</span>}{!r.active && <span className="a-badge s-refunded" style={{ marginLeft: 8 }}>Hidden</span>}</td>
                  <td className="a-muted">{r.sku || "—"}</td>
                  <td className="r">{money(r.price)}</td>
                  <td className="r"><span className={`a-badge ${r.stock === 0 ? "s-cancelled" : r.stock <= r.threshold ? "s-pending" : "s-delivered"}`}>{r.stock}</span></td>
                  <td>
                    <ActionForm action={adjustStock} submit="Apply" className="a-inline" btnClass="a-btn sm">
                      <input type="hidden" name="variant" value={r.id} />
                      <input name="delta" type="number" step="1" placeholder="+10 / −3" aria-label="Quantity change" required />
                      <input name="reason" placeholder="Reason (e.g. restock, damaged)" aria-label="Reason" />
                    </ActionForm>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={5} className="a-muted">Nothing to show.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="a-card">
        <h2>Recent stock movements</h2>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>When</th><th>Item</th><th>Reason</th><th className="r">Change</th><th className="r">After</th></tr></thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>{fmtDateTime(m.created_at)}</td>
                  <td>{m.product_variants?.products?.name} <span className="a-muted">{m.product_variants?.label !== "Standard" && m.product_variants?.label}</span></td>
                  <td>{m.reason}{m.order_id && <> · <Link href={`/admin/orders/${m.order_id}`}>{m.order_id}</Link></>}</td>
                  <td className="r" style={{ color: m.delta < 0 ? "var(--a-err)" : "var(--a-ok)" }}>{m.delta > 0 ? "+" : ""}{m.delta}</td>
                  <td className="r">{m.stock_after}</td>
                </tr>
              ))}
              {movements.length === 0 && <tr><td colSpan={5} className="a-muted">No movements yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
