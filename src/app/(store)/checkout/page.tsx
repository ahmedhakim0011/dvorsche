"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/products";
import type { Totals, ShippingMethod } from "@/lib/pricing";
import ProductArt from "@/components/ProductArt";
import { WovenMark } from "@/components/Brand";

type Errors = Record<string, string>;

export default function Checkout() {
  const router = useRouter();
  const { lines, ready, clear, product } = useCart();
  const [shipping, setShipping] = useState<ShippingMethod>("standard");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState("");
  const [totals, setTotals] = useState<Totals | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState({ email: "", name: "", line1: "", line2: "", city: "", region: "", postal: "", country: "United States", cardNumber: "", exp: "", cvc: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!ready || lines.length === 0) return;
    const ctl = new AbortController();
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines, shipping, promo }),
      signal: ctl.signal,
    })
      .then((r) => r.json())
      .then(setTotals)
      .catch(() => {});
    return () => ctl.abort();
  }, [lines, shipping, promo, ready]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const r = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines,
        shipping,
        promo,
        email: form.email,
        name: form.name,
        cardNumber: form.cardNumber,
        address: { line1: form.line1, line2: form.line2, city: form.city, region: form.region, postal: form.postal, country: form.country },
      }),
    }).catch(() => null);
    const data = await r?.json().catch(() => null);
    setBusy(false);
    if (r?.ok && data?.id) {
      clear();
      router.push(`/order/${data.id}`);
    } else {
      setErrors(data?.errors ?? { form: data?.error ?? "Something went wrong. Please try again." });
    }
  }

  if (!ready) return <div className="page" />;
  if (lines.length === 0)
    return (
      <div className="page empty">
        <WovenMark className="mark-sm" />
        <h1 className="serif">Your bag is empty</h1>
        <Link href="/shop" className="btn btn-dark">Shop the collection</Link>
      </div>
    );

  const field = (k: keyof typeof form, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className={`field${errors[k] ? " has-err" : ""}`}>
      <span>{label}</span>
      <input value={form[k]} onChange={set(k)} {...extra} />
      {errors[k] && <em className="err">{errors[k]}</em>}
    </label>
  );

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Secure checkout</p>
        <h1 className="serif">Complete your order</h1>
      </header>

      <form className="checkout" onSubmit={submit} noValidate>
        <div className="co-main">
          <fieldset>
            <legend className="serif">Contact</legend>
            {field("email", "Email", { type: "email", autoComplete: "email" })}
          </fieldset>

          <fieldset>
            <legend className="serif">Delivery</legend>
            {field("name", "Full name", { autoComplete: "name" })}
            {field("line1", "Address", { autoComplete: "address-line1" })}
            {field("line2", "Apartment, suite (optional)", { autoComplete: "address-line2" })}
            <div className="two">
              {field("city", "City", { autoComplete: "address-level2" })}
              {field("region", "State / Region", { autoComplete: "address-level1" })}
            </div>
            <div className="two">
              {field("postal", "Postal code", { autoComplete: "postal-code" })}
              {field("country", "Country", { autoComplete: "country-name" })}
            </div>
            <div className="ship-opts" role="radiogroup" aria-label="Shipping method">
              {(["standard", "express"] as const).map((m) => (
                <label key={m} className={`opt${shipping === m ? " on" : ""}`}>
                  <input type="radio" name="ship" checked={shipping === m} onChange={() => setShipping(m)} />
                  <span>
                    <strong>{m === "standard" ? "Standard · 3–5 days" : "Express · next business day"}</strong>
                    <small>{m === "standard" ? "Complimentary over $250, otherwise $14" : "$28"}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="serif">Payment</legend>
            <p className="notice">Demo store — no payment is processed. Use any card number, e.g. 4242 4242 4242 4242.</p>
            {field("cardNumber", "Card number", { inputMode: "numeric", autoComplete: "cc-number", placeholder: "4242 4242 4242 4242" })}
            <div className="two">
              {field("exp", "Expiry (MM/YY)", { autoComplete: "cc-exp", placeholder: "MM/YY" })}
              {field("cvc", "CVC", { autoComplete: "cc-csc", inputMode: "numeric" })}
            </div>
          </fieldset>
          {errors.form && <p className="err">{errors.form}</p>}
        </div>

        <aside className="co-summary deco">
          <h2 className="serif">Order summary</h2>
          <ul>
            {lines.map((l) => {
              const p = product(l.slug);
              if (!p) return null;
              const priced = totals?.lines.find((x) => x.slug === l.slug && x.variant === l.variant);
              return (
                <li key={l.slug + l.variant}>
                  <div className="thumb"><ProductArt art={p.art} label={p.name} /><b>{l.qty}</b></div>
                  <div>
                    <span className="serif">{p.name}</span>
                    {l.variant && <small className="muted"> {l.variant}</small>}
                  </div>
                  <span>{priced ? money(priced.total) : ""}</span>
                </li>
              );
            })}
          </ul>

          <div className="promo">
            <input placeholder="Promo code" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} aria-label="Promo code" />
            <button type="button" className="btn btn-ghost" onClick={() => setPromo(promoInput)}>Apply</button>
          </div>
          {promo && totals && !totals.promoApplied && <p className="err small">That code isn&apos;t valid.</p>}

          {totals && (
            <dl className="totals">
              <div><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
              {totals.discount > 0 && <div><dt>Discount ({totals.promoApplied})</dt><dd>−{money(totals.discount)}</dd></div>}
              <div><dt>Shipping</dt><dd>{totals.shipping ? money(totals.shipping) : "Complimentary"}</dd></div>
              <div><dt>Estimated tax</dt><dd>{money(totals.tax)}</dd></div>
              <div className="grand"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
            </dl>
          )}

          <button className="btn btn-dark btn-block" disabled={busy || !totals}>
            {busy ? "Placing order…" : `Place order${totals ? ` · ${money(totals.total)}` : ""}`}
          </button>
        </aside>
      </form>
    </div>
  );
}
