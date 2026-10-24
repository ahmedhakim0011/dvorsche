"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires GA4 purchase once per order (de-duplicated per browser session). Renders nothing. */
export default function PurchaseEvent({ id, value, tax, shipping, items }: { id: string; value: number; tax: number; shipping: number; items: { slug: string; name: string; variant?: string; unit: number; qty: number }[] }) {
  useEffect(() => {
    const key = `dv-purchase-${id}`;
    const t = setTimeout(() => {
      try {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
      } catch {}
      track("purchase", { transaction_id: id, currency: "USD", value, tax, shipping, items: items.map((i) => ({ item_id: i.slug, item_name: i.name, item_variant: i.variant, price: i.unit, quantity: i.qty, item_brand: "D’Vorsche" })) });
    }, 800);
    return () => clearTimeout(t);
  }, [id, value, tax, shipping, items]);
  return null;
}
