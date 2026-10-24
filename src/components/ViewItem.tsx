"use client";

import { useEffect } from "react";
import { track, toItem } from "@/lib/analytics";

/** Fires GA4 view_item once per product page view (no-op without consent). Renders nothing. */
export default function ViewItem({ slug, name, price }: { slug: string; name: string; price: number }) {
  useEffect(() => {
    const t = setTimeout(() => track("view_item", { currency: "USD", value: price, items: [toItem(slug, name, price)] }), 800);
    return () => clearTimeout(t);
  }, [slug, name, price]);
  return null;
}
