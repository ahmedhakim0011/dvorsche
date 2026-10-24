"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { money, type Product } from "@/lib/products";
import { track, toItem } from "@/lib/analytics";

export default function AddToBag({ product }: { product: Product }) {
  const { add } = useCart();
  const [variant, setVariant] = useState(product.variants?.[0]?.label);
  const [qty, setQty] = useState(1);
  const current = product.variants?.find((v) => v.label === variant);
  const price = current?.price ?? product.price;
  const stock = current ? current.stock : product.stock; // undefined = untracked
  const soldOut = stock !== undefined && stock <= 0;
  const max = Math.min(10, stock ?? 10);
  const q = Math.min(qty, Math.max(1, max));

  return (
    <div className="buybox">
      <p className="pdp-price">{money(price)}</p>
      {product.variants && product.variants.length > 1 && (
        <fieldset className="variants">
          <legend className="eyebrow">{product.category === "fragrance" ? "Size" : "Colour"}</legend>
          <div>
            {product.variants.map((v) => (
              <button
                key={v.label}
                type="button"
                className={`chip${v.label === variant ? " on" : ""}`}
                aria-pressed={v.label === variant}
                onClick={() => setVariant(v.label)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {stock !== undefined && stock > 0 && stock <= 5 && <p className="low-stock">Only {stock} left</p>}
      <div className="buy-row">
        <div className="qty">
          <button aria-label="Decrease quantity" disabled={soldOut} onClick={() => setQty(Math.max(1, q - 1))}>−</button>
          <span aria-live="polite">{q}</span>
          <button aria-label="Increase quantity" disabled={soldOut} onClick={() => setQty(Math.min(max, q + 1))}>+</button>
        </div>
        <button className="btn btn-dark btn-grow" disabled={soldOut} onClick={() => {
            add(product.slug, variant, q);
            track("add_to_cart", { currency: "USD", value: price * q, items: [toItem(product.slug, product.name, price, variant, q)] });
          }}>
          {soldOut ? "Sold out" : `Add to bag — ${money(price * q)}`}
        </button>
      </div>
    </div>
  );
}
