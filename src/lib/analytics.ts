"use client";

/** GA4 e-commerce events. No-ops unless NEXT_PUBLIC_GA_ID is set AND the visitor has accepted analytics (see components/Analytics.tsx). */
type Item = { item_id: string; item_name: string; item_variant?: string; price: number; quantity?: number; item_brand?: string };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const CONSENT_KEY = "dv-analytics-consent";

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
}

export const toItem = (slug: string, name: string, price: number, variant?: string, quantity?: number): Item => ({
  item_id: slug,
  item_name: name,
  item_variant: variant,
  price,
  quantity,
  item_brand: "D’Vorsche",
});
