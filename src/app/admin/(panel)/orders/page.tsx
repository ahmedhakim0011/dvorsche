import Link from "next/link";
import { fmtDateTime } from "@/lib/format";
import { listOrders, STATUSES } from "@/lib/admin-data";
import { money } from "@/lib/products";
import StatusBadge from "@/components/admin/StatusBadge";

export const instant = false; // session-gated: always rendered per request

export const metadata = { title: "Orders" };

export default async function Orders({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const status = one(sp.status);
  const q = one(sp.q);
  const orders = await listOrders({ status, q });
  const total = orders.reduce((s, o) => s + (["cancelled", "refunded"].includes(o.status) ? 0 : Number(o.total)), 0);

  return (
    <>
      <header className="a-head"><div><h1>Orders</h1><p className="a-muted">{orders.length} shown · {money(Math.round(total))} in sales</p></div></header>
      <div className="a-toolbar">
        <nav className="a-tabs">
          <Link href="/admin/orders" className={!status ? "on" : ""}>All</Link>
          {STATUSES.map((s) => <Link key={s} href={`/admin/orders?status=${s}`} className={status === s ? "on" : ""}>{s}</Link>)}
        </nav>
        <form className="a-search">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Search order, name, email…" aria-label="Search orders" />
        </form>
      </div>
      <section className="a-card flush">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Shipping</th><th className="r">Total</th><th>Placed</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/orders/${o.id}`}>{o.id}</Link></td>
                  <td>{o.name}<br /><span className="a-muted">{o.email}</span></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{o.shipping_method}</td>
                  <td className="r">{money(Number(o.total))}</td>
                  <td>{fmtDateTime(o.created_at)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={6} className="a-muted">No orders match.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
