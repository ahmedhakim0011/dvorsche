"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine } from "./pricing";
import type { Product } from "./products";
import { unitPrice } from "./pricing";

interface CartCtx {
  catalog: Product[];
  product: (slug: string) => Product | undefined;
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  ready: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, variant?: string, qty?: number) => void;
  setQty: (slug: string, variant: string | undefined, qty: number) => void;
  remove: (slug: string, variant?: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "dvorsche.bag.v1";

export function CartProvider({ children, catalog }: { children: ReactNode; catalog: Product[] }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage after mount (reading it during render would cause a hydration mismatch).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw).filter((l: CartLine) => catalog.some((p) => p.slug === l.slug)));
    } catch {}
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const same = (a: CartLine, slug: string, variant?: string) => a.slug === slug && a.variant === variant;

  const add = useCallback((slug: string, variant?: string, qty = 1) => {
    setLines((cur) => {
      const hit = cur.find((l) => same(l, slug, variant));
      if (hit) return cur.map((l) => (l === hit ? { ...l, qty: Math.min(10, l.qty + qty) } : l));
      return [...cur, { slug, variant, qty }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((slug: string, variant: string | undefined, qty: number) => {
    setLines((cur) =>
      qty <= 0 ? cur.filter((l) => !same(l, slug, variant)) : cur.map((l) => (same(l, slug, variant) ? { ...l, qty: Math.min(10, qty) } : l)),
    );
  }, []);

  const remove = useCallback((slug: string, variant?: string) => setLines((c) => c.filter((l) => !same(l, slug, variant))), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(() => {
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => {
      const p = catalog.find((x) => x.slug === l.slug);
      return s + (p ? unitPrice(p, l.variant) * l.qty : 0);
    }, 0);
    const product = (slug: string) => catalog.find((p) => p.slug === slug);
    return { catalog, product, lines, count, subtotal, open, ready, setOpen, add, setQty, remove, clear };
  }, [catalog, lines, open, ready, add, setQty, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
