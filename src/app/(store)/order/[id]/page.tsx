import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrder } from "@/lib/orders";
import { money } from "@/lib/products";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default function OrderPage({ params }: PageProps<"/order/[id]">) {
  return (
    <Suspense fallback={<div className="page prose-page"><p className="eyebrow">Loading your order…</p></div>}>
      <OrderContent params={params} />
    </Suspense>
  );
}

async function OrderContent({ params }: { params: PageProps<"/order/[id]">["params"] }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  const t = order.totals;

  return (
    <div className="page prose-page">
      <header className="page-head">
        <p className="eyebrow">Order {order.id}</p>
        <h1 className="serif">Thank you, <em>{order.name.split(" ")[0]}.</em></h1>
        <span className="status-pill">{order.status}</span>
        <p className="muted">A confirmation has been sent to {order.email}. Your order will ship within two business days.</p>
      </header>

      <div className="receipt deco">
        <ul>
          {t.lines.map((l) => (
            <li key={l.slug + l.variant}>
              <span>
                <Link href={`/product/${l.slug}`} className="serif">{l.name}</Link>
                {l.variant && <small className="muted"> · {l.variant}</small>}
                <small className="muted"> × {l.qty}</small>
              </span>
              <span>{money(l.total)}</span>
            </li>
          ))}
        </ul>
        <dl className="totals">
          <div><dt>Subtotal</dt><dd>{money(t.subtotal)}</dd></div>
          {t.discount > 0 && <div><dt>Discount</dt><dd>−{money(t.discount)}</dd></div>}
          <div><dt>Shipping</dt><dd>{t.shipping ? money(t.shipping) : "Complimentary"}</dd></div>
          <div><dt>Tax</dt><dd>{money(t.tax)}</dd></div>
          <div className="grand"><dt>Total</dt><dd>{money(t.total)}</dd></div>
        </dl>
        <div className="three receipt-meta">
          <div>
            <p className="eyebrow">Ship to</p>
            <p>{order.name}<br />{order.address.line1}{order.address.line2 && <>, {order.address.line2}</>}<br />{order.address.city}, {order.address.region} {order.address.postal}<br />{order.address.country}</p>
          </div>
          <div>
            <p className="eyebrow">Delivery</p>
            <p>{order.shippingMethod === "express" ? "Express · next business day" : "Standard · 3–5 days"}</p>
          </div>
          <div>
            <p className="eyebrow">Payment</p>
            <p>Card ending {order.paymentLast4}</p>
          </div>
        </div>
      </div>

      <Link href="/shop" className="btn btn-dark">Continue shopping</Link>
    </div>
  );
}
