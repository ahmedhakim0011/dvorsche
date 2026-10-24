import { listCustomers } from "@/lib/admin-data";
import { fmtDate } from "@/lib/format";
import { money } from "@/lib/products";

export const instant = false; // session-gated: always rendered per request

export const metadata = { title: "Customers" };

export default async function Customers() {
  const { customers, subscribers } = await listCustomers();
  const repeat = customers.filter((c) => c.orders > 1).length;
  return (
    <>
      <header className="a-head"><div><h1>Customers</h1><p className="a-muted">{customers.length} customers · {repeat} repeat · {subscribers.length} newsletter subscribers</p></div></header>
      <section className="a-card flush">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Customer</th><th className="r">Orders</th><th className="r">Lifetime spend</th><th>Last order</th></tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email}><td><b>{c.name}</b><br /><span className="a-muted">{c.email}</span></td><td className="r">{c.orders}</td><td className="r">{money(Math.round(c.spent * 100) / 100)}</td><td>{fmtDate(c.last)}</td></tr>
              ))}
              {customers.length === 0 && <tr><td colSpan={4} className="a-muted">No customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section className="a-card">
        <h2>Newsletter subscribers</h2>
        {subscribers.length === 0 ? <p className="a-muted">No subscribers yet.</p> : (
          <ul className="a-chips">{subscribers.map((s) => <li key={s.email}>{s.email}</li>)}</ul>
        )}
      </section>
    </>
  );
}
