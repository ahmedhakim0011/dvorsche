import type { Product } from "./products";

/** `stock === undefined` means untracked (demo catalog) and is treated as available. */
export const inStock = (p: Product) =>
  p.variants ? p.variants.some((v) => v.stock === undefined || v.stock > 0) : p.stock === undefined || p.stock > 0;
