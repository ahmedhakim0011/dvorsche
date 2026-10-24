"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/products";
import { FREE_SHIPPING_THRESHOLD, unitPrice } from "@/lib/pricing";
import ProductArt from "./ProductArt";
import { WovenMark } from "./Brand";

export default function CartDrawer() {
  const { lines, open, setOpen, subtotal, setQty, remove, count, product } = useCart();

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className={`drawer-root${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div className="scrim" onClick={() => setOpen(false)} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Shopping bag">
        <div className="drawer-head">
          <h2>Your bag {count > 0 && <span>({count})</span>}</h2>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close bag">
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <WovenMark className="mark-sm" />
            <p className="serif">Your bag is empty.</p>
            <p className="muted">Discover something worth keeping.</p>
            <Link href="/shop" className="btn btn-dark" onClick={() => setOpen(false)}>
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="ship-meter">
              <p>
                {remaining > 0 ? (
                  <>
                    You are <strong>{money(remaining)}</strong> away from complimentary shipping
                  </>
                ) : (
                  <>You have unlocked <strong>complimentary shipping</strong></>
                )}
              </p>
              <div className="meter">
                <i style={{ width: `${pct}%` }} />
              </div>
            </div>
            <ul className="drawer-lines">
              {lines.map((l) => {
                const p = product(l.slug);
                if (!p) return null;
                return (
                  <li key={l.slug + l.variant}>
                    <div className="thumb">
                      <ProductArt art={p.art} label={p.name} />
                    </div>
                    <div className="line-info">
                      <Link href={`/product/${p.slug}`} onClick={() => setOpen(false)} className="serif line-name">
                        {p.name}
                      </Link>
                      {l.variant && <span className="muted small">{l.variant}</span>}
                      <div className="qty small">
                        <button aria-label="Decrease" onClick={() => setQty(l.slug, l.variant, l.qty - 1)}>−</button>
                        <span>{l.qty}</span>
                        <button aria-label="Increase" onClick={() => setQty(l.slug, l.variant, l.qty + 1)}>+</button>
                      </div>
                    </div>
                    <div className="line-price">
                      <span>{money(unitPrice(p, l.variant) * l.qty)}</span>
                      <button className="link-btn" onClick={() => remove(l.slug, l.variant)}>
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="drawer-foot">
              <div className="row">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <p className="muted small">Shipping and taxes calculated at checkout.</p>
              <Link href="/checkout" className="btn btn-dark btn-block" onClick={() => setOpen(false)}>
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
