import Link from "next/link";
import { fmtDateTime } from "@/lib/format";
import { getDashboard } from "@/lib/admin-data";
import { money } from "@/lib/products";
import { RevenueChart, HBars, Delta } from "@/components/admin/Charts";
import StatusBadge from "@/components/admin/StatusBadge";

export const instant = false; // session-gated: always rendered per request

export const metadata = { title: "Overview" };

export default async function Overview() {
  const d = await getDashboard(30);
  const stat = (label: string, value: string, extra?: React.ReactNode) => (
    <div className="a-stat"><p>{label}</p><strong>{value}</strong>{extra}</div>
  );
  return (
    <>
      <header className="a-head">
        <div><h1>Overview</h1><p className="a-muted">Last {d.days} days</p></div>
        <Link href="/admin/products/new" className="a-btn a-btn-primary">+ New product</Link>
      </header>

      <section className="a-stats">
        {stat("Revenue", money(d.revenue), <Delta cur={d.revenue} prev={d.prevRevenue} />)}
        {stat("Orders", String(d.orders), <Delta cur={d.orders} prev={d.prevOrders} />)}
        {stat("Avg. order value", money(Math.round(d.aov * 100) / 100), <Delta cur={d.aov} prev={d.prevAov} />)}
        {stat("Units sold", String(d.units))}
        {stat("Needs fulfilment", String(d.actionNeeded), <Link href="/admin/orders?status=paid" className="a-link">Review →</Link>)}
        {stat("Inventory value", money(Math.round(d.inventoryValue)), <span className="a-muted">{d.inventoryUnits} units on hand</span>)}
      </section>

      <div className="a-grid-2">
        <section className="a-card"><h2>Daily revenue</h2><RevenueChart data={d.series} /></section>
        <section className="a-card">
          <h2>Orders by status</h2>
          {Object.keys(d.statusCounts).length === 0 ? <p className="a-muted">No orders yet.</p> : (
            <ul className="a-status-list">
              {Object.entries(d.statusCounts).map(([s, n]) => (
                <li key={s}><Link href={`/admin/orders?status=${s}`}><StatusBadge status={s} /><b>{n}</b></Link></li>
              ))}
            </ul>
          )}
          <h2 style={{ marginTop: 28 }}>Revenue by category</h2>
          <HBars rows={d.byCategory.map((c) => ({ label: c.category, value: c.revenue }))} />
        </section>
      </div>

      <div className="a-grid-2">
        <section className="a-card">
          <h2>Top products</h2>
          <HBars rows={d.topProducts.map((p) => ({ label: p.name, value: p.revenue, sub: `${p.units} sold` }))} />
        </section>
        <section className="a-card">
          <div className="a-row"><h2>Low stock</h2><Link href="/admin/inventory" className="a-link">Manage inventory →</Link></div>
          {d.lowStock.length === 0 ? <p className="a-muted">Every variant is healthy.</p> : (
            <table className="a-table">
              <tbody>
                {d.lowStock.slice(0, 8).map((l) => (
                  <tr key={l.variantId}>
                    <td><Link href={`/admin/products/${l.productId}`}>{l.product}</Link> <span className="a-muted">{l.label !== "Standard" && l.label}</span></td>
                    <td className="r"><span className={`a-badge ${l.stock === 0 ? "s-cancelled" : "s-pending"}`}>{l.stock === 0 ? "Out" : `${l.stock} left`}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className="a-card">
        <div className="a-row"><h2>Recent orders</h2><Link href="/admin/orders" className="a-link">All orders →</Link></div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th className="r">Total</th><th>Placed</th></tr></thead>
            <tbody>
              {d.recent.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/orders/${o.id}`}>{o.id}</Link></td>
                  <td>{o.name}<br /><span className="a-muted">{o.email}</span></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="r">{money(Number(o.total))}</td>
                  <td>{fmtDateTime(o.created_at)}</td>
                </tr>
              ))}
              {d.recent.length === 0 && <tr><td colSpan={5} className="a-muted">No orders yet — place a test order in the storefront.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
