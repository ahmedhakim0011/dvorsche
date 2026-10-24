import type { Product } from "./products";

export interface CartLine {
  slug: string;
  variant?: string;
  qty: number;
}

export type ShippingMethod = "standard" | "express";

export const FREE_SHIPPING_THRESHOLD = 250;
export const TAX_RATE = 0.07;

export interface Promo {
  code: string;
  pct: number;
}

export function unitPrice(p: Product, variant?: string) {
  if (!p.variants) return p.price;
  return p.variants.find((v) => v.label === variant)?.price ?? p.variants[0].price;
}

export interface PricedLine extends CartLine {
  name: string;
  unit: number;
  total: number;
}

export interface Totals {
  lines: PricedLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  promoApplied?: string;
  freeShippingRemaining: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Pure pricing: the single source of truth, always run on the server against the live catalog. */
export function computeTotals(lines: CartLine[], catalog: Product[], shipping: ShippingMethod = "standard", promo?: Promo): Totals {
  const priced: PricedLine[] = [];
  for (const l of lines) {
    const p = catalog.find((x) => x.slug === l.slug);
    const qty = Math.max(1, Math.min(10, Math.floor(Number(l.qty) || 0)));
    if (!p || !qty) continue;
    const unit = unitPrice(p, l.variant);
    priced.push({ slug: p.slug, variant: l.variant, qty, name: p.name, unit, total: round2(unit * qty) });
  }
  const subtotal = round2(priced.reduce((s, l) => s + l.total, 0));
  const discount = promo ? round2(subtotal * promo.pct) : 0;
  const net = subtotal - discount;
  const shippingCost = priced.length === 0 ? 0 : shipping === "express" ? 28 : net >= FREE_SHIPPING_THRESHOLD ? 0 : 14;
  const tax = round2(net * TAX_RATE);
  return {
    lines: priced,
    subtotal,
    discount,
    shipping: shippingCost,
    tax,
    total: round2(net + shippingCost + tax),
    promoApplied: promo?.code,
    freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - net),
  };
}
