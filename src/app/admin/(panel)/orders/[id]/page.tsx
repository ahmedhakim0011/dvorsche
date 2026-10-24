import Link from "next/link";
import { fmtDateTime } from "@/lib/format";
import { notFound } from "next/navigation";
import { getOrderFull, STATUSES } from "@/lib/admin-data";
import { updateOrder } from "../../../actions";
import { money } from "@/lib/products";
import ActionForm from "@/components/admin/ActionForm";
import StatusBadge from "@/components/admin/StatusBadge";

export const instant = false; // session-gated: always rendered per request

export const metadata = { title: "Order" };

export default async function OrderDetail({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const o = await getOrderFull(id);
  if (!o) notFound();
  const t = o.totals;
  const terminal = o.status === "cancelled" || o.status === "refunded";

  return (
    <>
      <header className="a-head">
        <div><p className="a-crumb"><Link href="/admin/orders">Orders</Link> /</p><h1>{o.id} <StatusBadge status={o.status} /></h1><p className="a-muted">Placed {fmtDateTime(o.createdAt)}</p></div>
        <Link href={`/order/${o.id}`} target="_blank" className="a-btn">Customer view ↗</Link>
      </header>
      <div className="a-grid-2 wide-left">
        <section className="a-card">
          <h2>Items</h2>
          <table className="a-table">
            <thead><tr><th>Product</th><th className="r">Unit</th><th className="r">Qty</th><th className="r">Total</th></tr></thead>
            <tbody>
              {t.lines.map((l) => (
                <tr key={l.slug + l.variant}><td><b>{l.name}</b>{l.variant && <span className="a-muted"> · {l.variant}</span>}</td><td className="r">{money(l.unit)}</td><td className="r">{l.qty}</td><td className="r">{money(l.total)}</td></tr>
              ))}
            </tbody>
          </table>
          <dl className="a-totals">
            <div><dt>Subtotal</dt><dd>{money(t.subtotal)}</dd></div>
            {t.discount > 0 && <div><dt>Discount {t.promoApplied && `(${t.promoApplied})`}</dt><dd>−{money(t.discount)}</dd></div>}
            <div><dt>Shipping ({o.shippingMethod})</dt><dd>{money(t.shipping)}</dd></div>
            <div><dt>Tax</dt><dd>{money(t.tax)}</dd></div>
            <div className="grand"><dt>Total</dt><dd>{money(t.total)}</dd></div>
          </dl>
        </section>
        <div className="a-stack">
          <section className="a-card">
            <h2>Fulfilment</h2>
            {terminal ? <p className="a-muted">This order is {o.status}. Items were returned to stock and the order is locked.</p> : (
              <ActionForm action={updateOrder} submit="Update order" className="a-form" btnClass="a-btn a-btn-primary">
                <input type="hidden" name="id" value={o.id} />
                <label>Status
                  <select name="status" defaultValue={o.status}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                </label>
                <label>Tracking number<input name="tracking" defaultValue={o.trackingNumber ?? ""} placeholder="Optional" /></label>
                <p className="a-muted">Cancelling or refunding automatically restocks the items.</p>
              </ActionForm>
            )}
          </section>
          <section className="a-card">
            <h2>Customer</h2>
            <p><b>{o.name}</b><br /><a href={`mailto:${o.email}`}>{o.email}</a></p>
            <p className="a-muted" style={{ marginTop: 12 }}>
              {o.address.line1}{o.address.line2 && <>, {o.address.line2}</>}<br />{o.address.city}, {o.address.region} {o.address.postal}<br />{o.address.country}
            </p>
            <p className="a-muted" style={{ marginTop: 12 }}>Card ending {o.paymentLast4}</p>
          </section>
        </div>
      </div>
    </>
  );
}
